const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Validate time format (HH:MM in 24-hour format)
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format (24-hour)'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format (24-hour)'
    }
  },
}, { _id: false });

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    uppercase: true,
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
  },
  timings: {
    type: [timeSlotSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one timing slot is required'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  color: {
    type: String,
    default: '#6366f1', // Default color for the course
  },
}, {
  timestamps: true,
});

// Index for faster queries
courseSchema.index({ createdBy: 1, createdAt: -1 });
courseSchema.index({ courseCode: 1, section: 1, createdBy: 1 }, { unique: true });

// Method to check if this course conflicts with another course
courseSchema.methods.hasConflict = function(otherCourse) {
  for (const timing1 of this.timings) {
    for (const timing2 of otherCourse.timings) {
      if (timing1.day === timing2.day) {
        // Same day, check time overlap
        const start1 = this.timeToMinutes(timing1.startTime);
        const end1 = this.timeToMinutes(timing1.endTime);
        const start2 = this.timeToMinutes(timing2.startTime);
        const end2 = this.timeToMinutes(timing2.endTime);
        
        // Check if time ranges overlap
        if ((start1 < end2 && end1 > start2)) {
          return true;
        }
      }
    }
  }
  return false;
};

// Helper method to convert time string to minutes
courseSchema.methods.timeToMinutes = function(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

module.exports = mongoose.model('Course', courseSchema);

