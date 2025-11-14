const express = require('express');
const { body, validationResult } = require('express-validator');
const Snippet = require('../models/Snippet');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all snippets (role-based)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    let snippets = [];

    if (role === 'admin') {
      // Admin sees all snippets
      snippets = await Snippet.find()
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email enrollmentNumber');
    } else {
      // Students see their own snippets + admin's view-only snippets
      const ownSnippets = await Snippet.find({ createdBy: userId }).sort({ createdAt: -1 });
      const adminSnippets = await Snippet.find({ isViewOnly: true }).sort({ createdAt: -1 });
      snippets = [...ownSnippets, ...adminSnippets].sort((a, b) => b.createdAt - a.createdAt);
    }

    // Format response
    const formattedSnippets = snippets.map(snippet => ({
      id: snippet._id,
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      description: snippet.description,
      createdBy: snippet.createdBy._id || snippet.createdBy,
      createdByEmail: snippet.createdByEmail,
      createdByName: snippet.createdByName,
      isViewOnly: snippet.isViewOnly,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    }));

    res.json(formattedSnippets);
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// Get single snippet
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;

    const snippet = await Snippet.findById(id).populate('createdBy', 'name email');

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Check access permissions
    if (snippet.isViewOnly && snippet.createdBy._id.toString() !== userId && role !== 'admin') {
      // Students can view admin's view-only snippets
      return res.json({
        id: snippet._id,
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        description: snippet.description,
        createdBy: snippet.createdBy._id,
        createdByEmail: snippet.createdByEmail,
        createdByName: snippet.createdByName,
        isViewOnly: snippet.isViewOnly,
        createdAt: snippet.createdAt,
        updatedAt: snippet.updatedAt,
      });
    }

    if (snippet.createdBy._id.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: snippet._id,
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      description: snippet.description,
      createdBy: snippet.createdBy._id,
      createdByEmail: snippet.createdByEmail,
      createdByName: snippet.createdByName,
      isViewOnly: snippet.isViewOnly,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching snippet:', error);
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
});

// Create snippet
router.post(
  '/',
  authenticateToken,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('language').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, email, name, role } = req.user;
      const { title, code, language, description, isViewOnly } = req.body;

      // Only admins can create view-only snippets
      const viewOnly = role === 'admin' ? (isViewOnly || false) : false;

      const snippet = await Snippet.create({
        title,
        code,
        language: language || 'text',
        description: description || '',
        createdBy: userId,
        createdByEmail: email,
        createdByName: name,
        isViewOnly: viewOnly,
      });

      res.status(201).json({
        id: snippet._id,
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        description: snippet.description,
        createdBy: snippet.createdBy,
        createdByEmail: snippet.createdByEmail,
        createdByName: snippet.createdByName,
        isViewOnly: snippet.isViewOnly,
        createdAt: snippet.createdAt,
        updatedAt: snippet.updatedAt,
      });
    } catch (error) {
      console.error('Error creating snippet:', error);
      res.status(500).json({ error: 'Failed to create snippet' });
    }
  }
);

// Update snippet
router.put(
  '/:id',
  authenticateToken,
  [
    body('title').optional().trim().notEmpty(),
    body('code').optional().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, role } = req.user;
      const { id } = req.params;

      const snippet = await Snippet.findById(id);

      if (!snippet) {
        return res.status(404).json({ error: 'Snippet not found' });
      }

      // Check permissions
      if (snippet.isViewOnly && role !== 'admin') {
        return res.status(403).json({ error: 'Cannot edit view-only snippets' });
      }

      if (snippet.createdBy.toString() !== userId && role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update snippet
      Object.assign(snippet, req.body);
      await snippet.save();

      res.json({
        id: snippet._id,
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        description: snippet.description,
        createdBy: snippet.createdBy,
        createdByEmail: snippet.createdByEmail,
        createdByName: snippet.createdByName,
        isViewOnly: snippet.isViewOnly,
        createdAt: snippet.createdAt,
        updatedAt: snippet.updatedAt,
      });
    } catch (error) {
      console.error('Error updating snippet:', error);
      res.status(500).json({ error: 'Failed to update snippet' });
    }
  }
);

// Delete snippet
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;

    const snippet = await Snippet.findById(id);

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Check permissions
    if (snippet.createdBy.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Snippet.findByIdAndDelete(id);

    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

module.exports = router;
