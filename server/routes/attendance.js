const express = require('express');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceSubmission = require('../models/AttendanceSubmission');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get roll numbers from Excel file
const getRollNumbersFromExcel = async (section) => {
  try {
    const filePath = path.join(__dirname, '../../assets/roll-sheets', `section${section}.xlsx`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file for section ${section} not found`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    
    const rollNumbers = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const rollNumber = row.getCell(1).value;
        if (rollNumber) {
          rollNumbers.push(String(rollNumber).trim().toUpperCase());
        }
      }
    });

    return rollNumbers;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
};

// Generate PDF attendance sheet
const generateAttendancePDF = (
  section,
  submittedRollNumbers,
  allRollNumbers,
  timerDuration
) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        info: {
          Title: `Attendance Sheet - Section ${section}`,
          Author: 'ByteCopied',
          Subject: 'Attendance Report',
        }
      });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#6366f1';
      const successColor = '#10b981';
      const dangerColor = '#ef4444';
      const textColor = '#1f2937';
      const lightGray = '#f3f4f6';
      const borderColor = '#e5e7eb';

      // Helper function to draw colored rectangle
      const drawColoredBox = (x, y, width, height, color) => {
        doc.rect(x, y, width, height)
          .fillColor(color)
          .fill()
          .fillColor(textColor);
      };

      // Header with gradient effect (simulated with colored box)
      const headerHeight = 80;
      drawColoredBox(50, 50, 495, headerHeight, primaryColor);
      
      doc.fillColor('#ffffff')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('ATTENDANCE SHEET', 50, 70, { 
          width: 495, 
          align: 'center',
          lineGap: 5
        });
      
      doc.fontSize(18)
        .text(`Section ${section}`, 50, 100, { 
          width: 495, 
          align: 'center' 
        });

      doc.fillColor(textColor);
      let yPos = 150;

      // Information box
      const infoBoxHeight = 60;
      doc.rect(50, yPos, 495, infoBoxHeight)
        .fillColor(lightGray)
        .fill()
        .strokeColor(borderColor)
        .lineWidth(1)
        .stroke()
        .fillColor(textColor);

      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = currentDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      doc.fontSize(11)
        .font('Helvetica-Bold')
        .text('Date:', 70, yPos + 10)
        .font('Helvetica')
        .text(dateStr, 130, yPos + 10)
        .font('Helvetica-Bold')
        .text('Time:', 70, yPos + 30)
        .font('Helvetica')
        .text(timeStr, 130, yPos + 30)
        .font('Helvetica-Bold')
        .text('Duration:', 300, yPos + 10)
        .font('Helvetica')
        .text(`${timerDuration} seconds`, 380, yPos + 10)
        .font('Helvetica-Bold')
        .text('Total Students:', 300, yPos + 30)
        .font('Helvetica')
        .text(`${allRollNumbers.length}`, 420, yPos + 30);

      yPos += infoBoxHeight + 30;

      // Calculate absent students
      const absentRollNumbers = allRollNumbers.filter(
        roll => !submittedRollNumbers.includes(roll)
      );

      // Summary Statistics Box
      const statsBoxHeight = 50;
      doc.rect(50, yPos, 495, statsBoxHeight)
        .fillColor(lightGray)
        .fill()
        .strokeColor(borderColor)
        .lineWidth(1)
        .stroke()
        .fillColor(textColor);

      const presentPercent = allRollNumbers.length > 0 
        ? ((submittedRollNumbers.length / allRollNumbers.length) * 100).toFixed(1)
        : 0;

      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(successColor)
        .text(`Present: ${submittedRollNumbers.length}`, 70, yPos + 10)
        .fillColor(dangerColor)
        .text(`Absent: ${absentRollNumbers.length}`, 250, yPos + 10)
        .fillColor(primaryColor)
        .text(`Attendance Rate: ${presentPercent}%`, 400, yPos + 10)
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica')
        .text(`Out of ${allRollNumbers.length} total students`, 70, yPos + 30);

      yPos += statsBoxHeight + 30;

      // Present Students Section
      doc.fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(successColor)
        .text('PRESENT STUDENTS', 50, yPos);
      
      yPos += 25;

      if (submittedRollNumbers.length > 0) {
        // Draw table header
        doc.rect(50, yPos, 495, 25)
          .fillColor(successColor)
          .fill()
          .fillColor('#ffffff')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('S.No.', 60, yPos + 7)
          .text('Roll Number', 120, yPos + 7)
          .fillColor(textColor);

        yPos += 25;

        // Draw present students in table format
        const rowsPerPage = 20;
        submittedRollNumbers.forEach((roll, index) => {
          if (yPos > 700) {
            // New page
            doc.addPage();
            yPos = 50;
            // Redraw header
            drawColoredBox(50, 50, 495, headerHeight, primaryColor);
            doc.fillColor('#ffffff')
              .fontSize(28)
              .font('Helvetica-Bold')
              .text('ATTENDANCE SHEET', 50, 70, { width: 495, align: 'center' });
            doc.fillColor(textColor);
            yPos = 100;
          }

          const isEven = index % 2 === 0;
          doc.rect(50, yPos, 495, 20)
            .fillColor(isEven ? '#ffffff' : lightGray)
            .fill()
            .strokeColor(borderColor)
            .lineWidth(0.5)
            .stroke()
            .fillColor(textColor)
            .fontSize(10)
            .font('Helvetica')
            .text(`${index + 1}.`, 60, yPos + 5)
            .font('Helvetica-Bold')
            .text(roll, 120, yPos + 5);

          yPos += 20;
        });
      } else {
        doc.fontSize(12)
          .font('Helvetica')
          .fillColor('#6b7280')
          .text('No students marked present.', 50, yPos);
        yPos += 20;
      }

      yPos += 20;

      // Absent Students Section
      if (absentRollNumbers.length > 0) {
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(18)
          .font('Helvetica-Bold')
          .fillColor(dangerColor)
          .text('ABSENT STUDENTS', 50, yPos);
        
        yPos += 25;

        // Draw table header
        doc.rect(50, yPos, 495, 25)
          .fillColor(dangerColor)
          .fill()
          .fillColor('#ffffff')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('S.No.', 60, yPos + 7)
          .text('Roll Number', 120, yPos + 7)
          .fillColor(textColor);

        yPos += 25;

        // Draw absent students in table format
        absentRollNumbers.forEach((roll, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const isEven = index % 2 === 0;
          doc.rect(50, yPos, 495, 20)
            .fillColor(isEven ? '#ffffff' : lightGray)
            .fill()
            .strokeColor(borderColor)
            .lineWidth(0.5)
            .stroke()
            .fillColor(textColor)
            .fontSize(10)
            .font('Helvetica')
            .text(`${index + 1}.`, 60, yPos + 5)
            .font('Helvetica-Bold')
            .text(roll, 120, yPos + 5);

          yPos += 20;
        });
      }

      // Footer - add to all pages
      // Wait for all pages to be buffered before adding footer
      const pageRange = doc.bufferedPageRange();
      const pageStart = pageRange.start;
      const pageCount = pageRange.count;
      
      // Add footer to each page
      for (let i = pageStart; i < pageStart + pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .fillColor('#9ca3af')
          .text(
            `Generated by ByteCopied | Page ${i - pageStart + 1} of ${pageCount}`,
            50,
            doc.page.height - 30,
            { align: 'center', width: 495 }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Start attendance session
router.post(
  '/start',
  authenticateToken,
  [
    body('section').isIn(['1', '2', '3', '4']).withMessage('Invalid section'),
    body('timerDuration').isIn([30, 40, 50, 60]).withMessage('Invalid timer duration'),
  ],
  async (req, res) => {
    try {
      const { userId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ 
          error: 'Admin access required. Please make sure your role is set to "admin" in the database.',
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { section, timerDuration } = req.body;

      // Verify Excel file exists
      const rollNumbers = await getRollNumbersFromExcel(section);

      // End any existing active sessions for this section
      await AttendanceSession.updateMany(
        { section: section, status: 'active' },
        { status: 'completed', endedAt: new Date() }
      );

      // Create attendance session
      const session = await AttendanceSession.create({
        section: section,
        timerDuration,
        totalStudents: rollNumbers.length,
        startedBy: userId,
        status: 'active',
        startedAt: new Date(),
      });

      res.json({ 
        session: {
          id: session._id,
          section: session.section,
          timerDuration: session.timerDuration,
          totalStudents: session.totalStudents,
          startedAt: session.startedAt,
          status: session.status,
        },
        totalStudents: rollNumbers.length 
      });
    } catch (error) {
      console.error('Error starting attendance:', error);
      res.status(500).json({ error: error.message || 'Failed to start attendance' });
    }
  }
);

// Submit attendance
router.post(
  '/submit',
  authenticateToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { sessionId, rollNumber } = req.body;

      // Check if session is active
      const session = await AttendanceSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status !== 'active') {
        return res.status(400).json({ error: 'Session is not active' });
      }

      // Check if user has already submitted for this session (by user ID)
      const existingUserSubmission = await AttendanceSubmission.findOne({
        sessionId,
        submittedBy: req.user.userId,
      });

      if (existingUserSubmission) {
        return res.status(400).json({ 
          error: 'You have already submitted your attendance for this session',
          message: 'Attendance already submitted',
        });
      }

      // Also check if this roll number has already been submitted (prevent duplicate roll numbers)
      const existingRollSubmission = await AttendanceSubmission.findOne({
        sessionId,
        rollNumber: rollNumber.trim().toUpperCase(),
      });

      if (existingRollSubmission) {
        return res.status(400).json({ 
          error: 'This roll number has already been submitted for this session',
          message: 'Roll number already submitted',
        });
      }

      // Add submission
      await AttendanceSubmission.create({
        sessionId,
        rollNumber: rollNumber.trim().toUpperCase(),
        submittedBy: req.user.userId,
        submittedAt: new Date(),
      });

      res.json({ message: 'Attendance submitted successfully' });
    } catch (error) {
      console.error('Error submitting attendance:', error);
      if (error.code === 11000) {
        return res.json({ message: 'Attendance already submitted' });
      }
      res.status(500).json({ error: 'Failed to submit attendance' });
    }
  }
);

// End attendance session and generate PDF
router.post(
  '/end',
  authenticateToken,
  [body('sessionId').notEmpty().withMessage('Session ID is required')],
  async (req, res) => {
    try {
      const { userId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ 
          error: 'Admin access required. Please make sure your role is set to "admin" in the database.',
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { sessionId } = req.body;

      // Get session
      const session = await AttendanceSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Get all submissions
      const submissions = await AttendanceSubmission.find({ sessionId });
      const submittedRollNumbers = submissions.map(sub => sub.rollNumber);

      // Get all roll numbers from Excel
      let allRollNumbers;
      try {
        allRollNumbers = await getRollNumbersFromExcel(session.section);
      } catch (excelError) {
        console.error('Error reading Excel file:', excelError);
        return res.status(500).json({ 
          error: `Failed to read Excel file for section ${session.section}. Please ensure the file exists at assets/roll-sheets/section${session.section}.xlsx`,
          details: excelError.message 
        });
      }

      // Generate PDF
      let pdfBuffer;
      try {
        pdfBuffer = await generateAttendancePDF(
          session.section,
          submittedRollNumbers,
          allRollNumbers,
          session.timerDuration
        );
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        return res.status(500).json({ 
          error: 'Failed to generate PDF',
          details: pdfError.message 
        });
      }

      // Update session status
      await AttendanceSession.findByIdAndUpdate(sessionId, {
        status: 'completed',
        endedAt: new Date(),
        presentCount: submittedRollNumbers.length,
        absentCount: allRollNumbers.length - submittedRollNumbers.length,
      });

      // Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=attendance_${session.section}_${Date.now()}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error ending attendance:', error);
      res.status(500).json({ error: error.message || 'Failed to end attendance' });
    }
  }
);

// Check if user has already submitted for a session
router.get('/check-submission/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.user;

    // Check if submission exists by user ID
    const submission = await AttendanceSubmission.findOne({
      sessionId,
      submittedBy: userId,
    });

    res.json({ 
      hasSubmitted: !!submission,
      submittedAt: submission?.submittedAt || null,
      rollNumber: submission?.rollNumber || null,
    });
  } catch (error) {
    console.error('Error checking submission:', error);
    res.status(500).json({ error: 'Failed to check submission status' });
  }
});

// Get active sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    
    let sessions;
    
    if (role !== 'admin') {
      // Students only need active sessions - limit to 1 to save reads
      sessions = await AttendanceSession.find({ status: 'active' })
        .sort({ startedAt: -1 })
        .limit(1);
    } else {
      // Admins see recent sessions
      sessions = await AttendanceSession.find()
        .sort({ startedAt: -1 })
        .limit(10);
    }

    // For students, check if they've already submitted (by user ID)
    let hasSubmitted = false;
    if (role !== 'admin' && sessions.length > 0) {
      const submission = await AttendanceSubmission.findOne({
        sessionId: sessions[0]._id,
        submittedBy: userId,
      });
      hasSubmitted = !!submission;
    }

    const formattedSessions = sessions.map(session => ({
      id: session._id,
      section: session.section,
      timerDuration: session.timerDuration,
      totalStudents: session.totalStudents,
      startedBy: session.startedBy,
      status: session.status,
      presentCount: session.presentCount,
      absentCount: session.absentCount,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      hasSubmitted: role !== 'admin' ? hasSubmitted : undefined,
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;
