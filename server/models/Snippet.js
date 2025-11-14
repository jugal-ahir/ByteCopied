const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
  },
  language: {
    type: String,
    default: 'text',
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdByEmail: {
    type: String,
    required: true,
  },
  createdByName: {
    type: String,
    required: true,
  },
  isViewOnly: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster queries
snippetSchema.index({ createdBy: 1, createdAt: -1 });
snippetSchema.index({ isViewOnly: 1, createdAt: -1 });

module.exports = mongoose.model('Snippet', snippetSchema);

