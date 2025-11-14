const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4'],
  },
  timerDuration: {
    type: Number,
    required: true,
    enum: [30, 40, 50, 60],
  },
  totalStudents: {
    type: Number,
    required: true,
  },
  startedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  presentCount: {
    type: Number,
    default: 0,
  },
  absentCount: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
attendanceSessionSchema.index({ status: 1, createdAt: -1 });
attendanceSessionSchema.index({ startedAt: -1 });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);

