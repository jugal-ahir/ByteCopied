const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const authenticateToken = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// Get all courses for the logged-in user
router.get('/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user.userId }).sort({ courseCode: 1, section: 1 });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Add a new course
router.post(
  '/courses',
  authenticateToken,
  [
    body('courseCode').trim().notEmpty().withMessage('Course code is required'),
    body('courseName').trim().notEmpty().withMessage('Course name is required'),
    body('section').trim().notEmpty().withMessage('Section is required'),
    body('timings').isArray({ min: 1 }).withMessage('At least one timing is required'),
    body('timings.*.day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
      .withMessage('Invalid day'),
    body('timings.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid start time format (use HH:MM in 24-hour format)'),
    body('timings.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid end time format (use HH:MM in 24-hour format)'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { courseCode, courseName, section, timings, color } = req.body;

      // Validate that end time is after start time for each timing
      for (const timing of timings) {
        const startMinutes = timeToMinutes(timing.startTime);
        const endMinutes = timeToMinutes(timing.endTime);
        if (endMinutes <= startMinutes) {
          return res.status(400).json({ 
            error: `End time must be after start time for ${timing.day}` 
          });
        }
      }

      // Check if course with same code and section already exists for this user
      const existingCourse = await Course.findOne({
        createdBy: req.user.userId,
        courseCode: courseCode.toUpperCase(),
        section: section,
      });

      if (existingCourse) {
        return res.status(400).json({ 
          error: `Course ${courseCode.toUpperCase()} Section ${section} already exists` 
        });
      }

      // Get all existing courses to check for conflicts
      const existingCourses = await Course.find({ createdBy: req.user.userId });
      const newCourse = new Course({
        courseCode: courseCode.toUpperCase(),
        courseName,
        section,
        timings,
        color: color || getRandomColor(),
        createdBy: req.user.userId,
      });

      // Check for conflicts
      const conflicts = [];
      for (const existing of existingCourses) {
        if (newCourse.hasConflict(existing)) {
          conflicts.push({
            courseCode: existing.courseCode,
            courseName: existing.courseName,
            section: existing.section,
          });
        }
      }

      // Save the course
      const savedCourse = await newCourse.save();

      res.json({
        course: savedCourse,
        conflicts: conflicts.length > 0 ? conflicts : null,
        warning: conflicts.length > 0 
          ? `Course added but conflicts with ${conflicts.length} existing course(s)` 
          : null,
      });
    } catch (error) {
      console.error('Error adding course:', error);
      if (error.code === 11000) {
        return res.status(400).json({ 
          error: 'Course with this code and section already exists' 
        });
      }
      res.status(500).json({ error: error.message || 'Failed to add course' });
    }
  }
);

// Update a course
router.put(
  '/courses/:id',
  authenticateToken,
  [
    body('courseCode').optional().trim().notEmpty(),
    body('courseName').optional().trim().notEmpty(),
    body('section').optional().trim().notEmpty(),
    body('timings').optional().isArray({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const course = await Course.findOne({
        _id: req.params.id,
        createdBy: req.user.userId,
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const { courseCode, courseName, section, timings, color } = req.body;

      // Update fields
      if (courseCode) course.courseCode = courseCode.toUpperCase();
      if (courseName) course.courseName = courseName;
      if (section) course.section = section;
      if (timings) {
        // Validate timings
        for (const timing of timings) {
          const startMinutes = timeToMinutes(timing.startTime);
          const endMinutes = timeToMinutes(timing.endTime);
          if (endMinutes <= startMinutes) {
            return res.status(400).json({ 
              error: `End time must be after start time for ${timing.day}` 
            });
          }
        }
        course.timings = timings;
      }
      if (color) course.color = color;

      // Check for conflicts with other courses (excluding itself)
      const existingCourses = await Course.find({
        createdBy: req.user.userId,
        _id: { $ne: req.params.id },
      });

      const conflicts = [];
      for (const existing of existingCourses) {
        if (course.hasConflict(existing)) {
          conflicts.push({
            courseCode: existing.courseCode,
            courseName: existing.courseName,
            section: existing.section,
          });
        }
      }

      const updatedCourse = await course.save();

      res.json({
        course: updatedCourse,
        conflicts: conflicts.length > 0 ? conflicts : null,
        warning: conflicts.length > 0 
          ? `Course updated but conflicts with ${conflicts.length} existing course(s)` 
          : null,
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ error: error.message || 'Failed to update course' });
    }
  }
);

// Delete a course
router.delete('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully', course });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Check for conflicts in existing timetable
router.get('/conflicts', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user.userId });
    const conflicts = [];

    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        if (courses[i].hasConflict(courses[j])) {
          conflicts.push({
            course1: {
              id: courses[i]._id,
              courseCode: courses[i].courseCode,
              courseName: courses[i].courseName,
              section: courses[i].section,
            },
            course2: {
              id: courses[j]._id,
              courseCode: courses[j].courseCode,
              courseName: courses[j].courseName,
              section: courses[j].section,
            },
          });
        }
      }
    }

    res.json({ conflicts, hasConflicts: conflicts.length > 0 });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ error: 'Failed to check conflicts' });
  }
});

// Helper function to convert time string to minutes
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to generate random color
function getRandomColor() {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f472b6',
    '#10b981', '#14b8a6', '#3b82f6', '#06b6d4',
    '#f59e0b', '#ef4444', '#84cc16', '#a855f7',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Download timetable as PDF
router.get('/download/pdf', authenticateToken, async (req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      const courses = await Course.find({ createdBy: req.user.userId }).sort({ courseCode: 1, section: 1 });

      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        info: {
          Title: 'Timetable',
          Author: 'ByteCopied',
          Subject: 'Class Timetable',
        }
      });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#6366f1';
      const textColor = '#1f2937';
      const lightGray = '#f3f4f6';
      const borderColor = '#e5e7eb';

      // Header
      const headerHeight = 60;
      doc.rect(50, 50, 495, headerHeight)
        .fillColor(primaryColor)
        .fill()
        .fillColor('#ffffff')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('CLASS TIMETABLE', 50, 70, { 
          width: 495, 
          align: 'center',
        });

      doc.fillColor(textColor);
      let yPos = 130;

      // Course list
      if (courses.length === 0) {
        doc.fontSize(14)
          .text('No courses added to timetable', 50, yPos, { align: 'center' });
      } else {
        // Group courses by day for better organization
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach(day => {
          const dayCourses = [];
          courses.forEach(course => {
            course.timings.forEach(timing => {
              if (timing.day === day) {
                dayCourses.push({
                  courseCode: course.courseCode,
                  courseName: course.courseName,
                  section: course.section,
                  startTime: timing.startTime,
                  endTime: timing.endTime,
                });
              }
            });
          });

          if (dayCourses.length > 0) {
            // Day header
            if (yPos > 700) {
              doc.addPage();
              yPos = 50;
            }

            doc.fontSize(16)
              .font('Helvetica-Bold')
              .fillColor(primaryColor)
              .text(day, 50, yPos);
            
            yPos += 25;

            // Course boxes for this day
            dayCourses.sort((a, b) => a.startTime.localeCompare(b.startTime));
            
            dayCourses.forEach(course => {
              if (yPos > 750) {
                doc.addPage();
                yPos = 50;
              }

              const boxHeight = 40;
              doc.rect(50, yPos, 495, boxHeight)
                .fillColor(lightGray)
                .fill()
                .strokeColor(borderColor)
                .lineWidth(1)
                .stroke()
                .fillColor(textColor);

              doc.fontSize(12)
                .font('Helvetica-Bold')
                .text(course.courseCode, 60, yPos + 8)
                .font('Helvetica')
                .fontSize(10)
                .text(`Section ${course.section}`, 60, yPos + 22)
                .fontSize(11)
                .text(course.courseName, 150, yPos + 8, { width: 250 })
                .font('Helvetica-Bold')
                .text(`${course.startTime} - ${course.endTime}`, 420, yPos + 12, { width: 100, align: 'right' });

              yPos += boxHeight + 5;
            });

            yPos += 10;
          }
        });
      }

      // End document
      doc.end();
    } catch (error) {
      reject(error);
    }
  }).then((pdfBuffer) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=timetable.pdf');
    res.send(pdfBuffer);
  }).catch((error) => {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF file' });
  });
});

// Download timetable as CSV
router.get('/download/csv', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user.userId }).sort({ courseCode: 1, section: 1 });

    // CSV header
    let csv = 'Course Code,Course Name,Section,Day,Start Time,End Time\n';

    // Add course data
    courses.forEach(course => {
      course.timings.forEach(timing => {
        csv += `"${course.courseCode}","${course.courseName}","${course.section}","${timing.day}","${timing.startTime}","${timing.endTime}"\n`;
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=timetable.csv');

    // Send CSV
    res.send(csv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Failed to generate CSV file' });
  }
});

module.exports = router;

