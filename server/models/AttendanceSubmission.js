const mongoose = require('mongoose');

const attendanceSubmissionSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceSession',
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate submissions
attendanceSubmissionSchema.index({ sessionId: 1, rollNumber: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceSubmission', attendanceSubmissionSchema);

