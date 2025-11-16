const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('enrollmentNumber')
      .matches(/^AU\d{7}$/i)
      .withMessage('Enrollment number must be in format AU2340017'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, enrollmentNumber, password } = req.body;

      // Normalize inputs
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedEnrollment = enrollmentNumber.toUpperCase().trim();

      // Check if user already exists - check both separately for better error messages
      const existingByEmail = await User.findOne({ email: normalizedEmail });
      const existingByEnrollment = await User.findOne({ enrollmentNumber: normalizedEnrollment });

      if (existingByEmail) {
        console.log(`Signup attempt with existing email: ${normalizedEmail}`);
        console.log(`   Found user: ${existingByEmail.name} (${existingByEmail.enrollmentNumber})`);
        return res.status(400).json({
          error: 'Email already registered',
        });
      }

      if (existingByEnrollment) {
        console.log(`Signup attempt with existing enrollment: ${normalizedEnrollment}`);
        console.log(`   Found user: ${existingByEnrollment.name} (${existingByEnrollment.email})`);
        return res.status(400).json({
          error: 'Enrollment number already registered',
        });
      }

      // Create user
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        enrollmentNumber: normalizedEnrollment,
        password,
        role: 'student',
      });

      console.log(`New user created: ${user.email} (${user.enrollmentNumber})`);

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          enrollmentNumber: user.enrollmentNumber,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Email or enrollment number already exists' });
      }
      res.status(500).json({ error: 'Failed to create account' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and include password
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          enrollmentNumber: user.enrollmentNumber,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      enrollmentNumber: user.enrollmentNumber,
      role: user.role,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get all users (Admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required. Only administrators can view all users.',
      });
    }

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      enrollmentNumber: user.enrollmentNumber,
      role: user.role,
      createdAt: user.createdAt,
    }));

    res.json({
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;

