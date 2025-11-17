import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme as useMUITheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../contexts/AuthContext';
import createApiInstance from '../services/api';
import { saveAs } from 'file-saver';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
// Create 30-minute interval time slots (48 slots for 24 hours)
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export default function Timetable() {
  const { getAuthHeaders } = useAuth();
  const theme = useMUITheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [courses, setCourses] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    section: '',
    timings: [{ day: 'Monday', startTime: '08:00', endTime: '09:00' }],
    color: '#6366f1',
  });

  const api = createApiInstance(getAuthHeaders);

  useEffect(() => {
    fetchCourses();
    checkConflicts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/timetable/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses');
    }
  };

  const checkConflicts = async () => {
    try {
      const response = await api.get('/timetable/conflicts');
      setConflicts(response.data.conflicts || []);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        courseCode: course.courseCode,
        courseName: course.courseName,
        section: course.section,
        timings: course.timings,
        color: course.color,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        courseCode: '',
        courseName: '',
        section: '',
        timings: [{ day: 'Monday', startTime: '08:00', endTime: '09:00' }],
        color: '#6366f1',
      });
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
  };

  const handleAddTiming = () => {
    setFormData({
      ...formData,
      timings: [...formData.timings, { day: 'Monday', startTime: '08:00', endTime: '09:00' }],
    });
  };

  const handleRemoveTiming = (index) => {
    if (formData.timings.length > 1) {
      setFormData({
        ...formData,
        timings: formData.timings.filter((_, i) => i !== index),
      });
    }
  };

  const handleTimingChange = (index, field, value) => {
    const newTimings = [...formData.timings];
    newTimings[index][field] = value;
    setFormData({ ...formData, timings: newTimings });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingCourse) {
        await api.put(`/timetable/courses/${editingCourse._id}`, formData);
        setSuccess('Course updated successfully!');
      } else {
        const response = await api.post('/timetable/courses', formData);
        if (response.data.conflicts && response.data.conflicts.length > 0) {
          setError(response.data.warning);
        } else {
          setSuccess('Course added successfully!');
        }
      }
      fetchCourses();
      checkConflicts();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error) {
      console.error('Error saving course:', error);
      setError(error.response?.data?.error || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await api.delete(`/timetable/courses/${id}`);
      setSuccess('Course deleted successfully!');
      fetchCourses();
      checkConflicts();
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('Failed to delete course');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get('/timetable/download/pdf', {
        responseType: 'blob',
      });

      // Check if response is actually a PDF or an error JSON
      const contentType = response.headers['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        const text = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsText(response.data);
        });
        
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to download PDF file');
        } catch (parseError) {
          throw new Error('Failed to download PDF file. Invalid response from server.');
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `timetable_${Date.now()}.pdf`);
      setSuccess('Timetable downloaded as PDF!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError(error.message || 'Failed to download PDF file');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get('/timetable/download/csv', {
        responseType: 'blob',
      });

      // Check if response is actually a file or an error JSON
      const contentType = response.headers['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        const text = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsText(response.data);
        });
        
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to download CSV file');
        } catch (parseError) {
          throw new Error('Failed to download CSV file. Invalid response from server.');
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      saveAs(blob, `timetable_${Date.now()}.csv`);
      setSuccess('Timetable downloaded as CSV!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setError(error.message || 'Failed to download CSV file');
    }
  };

  // Generate timetable grid with merged cell support using 30-minute intervals
  const generateTimetableGrid = () => {
    const grid = {};
    const cellSpans = {}; // Track rowSpan for each cell
    
    DAYS.forEach(day => {
      grid[day] = Array(48).fill(null).map(() => []); // 48 slots for 30-minute intervals
      cellSpans[day] = Array(48).fill(null).map(() => ({}));
    });

    courses.forEach(course => {
      course.timings.forEach(timing => {
        // Validate that the timing has a valid day
        if (!timing.day || !DAYS.includes(timing.day)) {
          console.warn(`Invalid day "${timing.day}" for course ${course.courseCode}`);
          return;
        }

        const startHour = parseInt(timing.startTime.split(':')[0]);
        const endHour = parseInt(timing.endTime.split(':')[0]);
        const startMin = parseInt(timing.startTime.split(':')[1]) || 0;
        const endMin = parseInt(timing.endTime.split(':')[1]) || 0;

        // Validate time values
        if (isNaN(startHour) || isNaN(endHour) || startHour < 0 || startHour >= 24 || endHour < 0 || endHour >= 24) {
          console.warn(`Invalid time for course ${course.courseCode} on ${timing.day}`);
          return;
        }

        // Calculate total minutes from midnight
        const startTimeMinutes = startHour * 60 + startMin;
        const endTimeMinutes = endHour * 60 + endMin;

        // Validate duration
        if (endTimeMinutes <= startTimeMinutes) {
          console.warn(`Invalid duration for course ${course.courseCode} on ${timing.day}`);
          return;
        }

        // Calculate which 30-minute slot this course starts at
        // Each hour has 2 slots (0 and 30 minutes)
        const startSlotIndex = Math.floor(startTimeMinutes / 30);
        const endSlotIndex = Math.ceil(endTimeMinutes / 30);
        const slotSpan = endSlotIndex - startSlotIndex;

        // Validate slot index
        if (startSlotIndex < 0 || startSlotIndex >= 48 || slotSpan <= 0) {
          console.warn(`Invalid slot calculation for course ${course.courseCode} on ${timing.day}`);
          return;
        }

        const courseData = {
          course,
          timing,
          startTimeMinutes,
          endTimeMinutes,
          startHour,
          endHour,
          startMin,
          endMin,
          startSlotIndex,
          endSlotIndex,
        };

        // Only add to the starting slot for the SPECIFIC day
        if (grid[timing.day] && grid[timing.day][startSlotIndex]) {
          // Verify this course isn't already added for this specific day and slot
          const alreadyAdded = grid[timing.day][startSlotIndex].some(
            item => item.course._id === course._id && 
                    item.timing.day === timing.day &&
                    item.timing.startTime === timing.startTime &&
                    item.timing.endTime === timing.endTime
          );
          
          if (!alreadyAdded) {
            grid[timing.day][startSlotIndex].push(courseData);
            
            // Calculate rowSpan (number of 30-minute slots to span)
            const spanKey = `${course._id}_${timing.day}_${timing.startTime}_${timing.endTime}`;
            cellSpans[timing.day][startSlotIndex][spanKey] = Math.max(1, slotSpan);
          }
        }
      });
    });

    return { grid, cellSpans };
  };

  const { grid: timetableGrid, cellSpans } = generateTimetableGrid();

  // Check if a course has conflicts
  const getCourseConflicts = (courseId) => {
    return conflicts.filter(
      conflict => conflict.course1.id === courseId || conflict.course2.id === courseId
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 11, sm: 14 }, mb: 4 }}>
      <Box
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          p: 3,
          mb: 4,
          boxShadow: isDark
            ? '0px 8px 32px rgba(0,0,0,0.5)'
            : '0px 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            📅 Timetable Manager
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            {courses.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPDF}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    flex: { xs: 1, sm: 'none' },
                    '&:hover': {
                      borderColor: '#dc2626',
                      background: 'rgba(239, 68, 68, 0.05)',
                    },
                  }}
                >
                  PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadCSV}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    flex: { xs: 1, sm: 'none' },
                    '&:hover': {
                      borderColor: '#2563eb',
                      background: 'rgba(59, 130, 246, 0.05)',
                    },
                  }}
                >
                  CSV
                </Button>
              </>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              fullWidth={{ xs: true, sm: false }}
              size="medium"
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                mt: { xs: 1, sm: 0 },
              }}
            >
              Add Course
            </Button>
          </Box>
        </Box>

        {conflicts.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <WarningIcon />
              <Typography variant="body2" fontWeight={600}>
                {conflicts.length} conflict(s) detected in your timetable!
              </Typography>
            </Box>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              {conflicts.map((conflict, idx) => (
                <li key={idx}>
                  <strong>{conflict.course1.courseCode} Section {conflict.course1.section}</strong> conflicts with{' '}
                  <strong>{conflict.course2.courseCode} Section {conflict.course2.section}</strong>
                </li>
              ))}
            </Box>
          </Alert>
        )}
      </Box>

      {/* Timetable Grid */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          boxShadow: isDark
            ? '0px 8px 32px rgba(0,0,0,0.5)'
            : '0px 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Weekly Timetable
        </Typography>
        <TableContainer sx={{ 
          maxWidth: '100%',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: isDark
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#6366f1',
            borderRadius: '4px',
            '&:hover': {
              background: '#4f46e5',
            },
          },
        }}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: { xs: 60, sm: 100 }, minWidth: 60, position: 'sticky', left: 0, zIndex: 10, bgcolor: 'background.paper' }}>
                  Time
                </TableCell>
                {DAYS.map(day => (
                  <TableCell key={day} sx={{ fontWeight: 600, textAlign: 'center', minWidth: 80 }}>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{day}</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{day.substring(0, 3)}</Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {TIME_SLOTS.map((time, slotIndex) => {
                // Helper function to check if a cell should be skipped
                const shouldSkipCell = (day) => {
                  // First, check if there are any courses that START at this slot for THIS specific day
                  const coursesStartingHere = timetableGrid[day]?.[slotIndex] || [];
                  if (coursesStartingHere.length > 0) {
                    // Verify that these courses actually belong to this day
                    const validCourses = coursesStartingHere.filter(
                      item => item.timing.day === day
                    );
                    if (validCourses.length > 0) {
                      // If there are valid courses starting here, don't skip
                      return false;
                    }
                  }
                  
                  // If no courses start here, check if a previous course spans into this slot
                  // Only check courses that belong to THIS specific day
                  for (let prevSlot = 0; prevSlot < slotIndex; prevSlot++) {
                    const prevCourses = timetableGrid[day]?.[prevSlot] || [];
                    for (const prevItem of prevCourses) {
                      // Verify this course belongs to this day
                      if (prevItem.timing.day !== day) {
                        continue;
                      }
                      const spanKey = `${prevItem.course._id}_${day}_${prevItem.timing.startTime}_${prevItem.timing.endTime}`;
                      const prevRowSpan = cellSpans[day]?.[prevSlot]?.[spanKey] || 1;
                      // If a course from a previous slot spans into this slot, skip this cell
                      if (prevSlot + prevRowSpan > slotIndex) {
                        return true;
                      }
                    }
                  }
                  return false;
                };

                return (
                  <TableRow key={time}>
                    <TableCell sx={{ 
                      fontWeight: 500, 
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      position: 'sticky',
                      left: 0,
                      zIndex: 9,
                      bgcolor: 'background.paper',
                      borderRight: isDark
                        ? '2px solid rgba(255,255,255,0.1)'
                        : '2px solid rgba(0,0,0,0.1)',
                    }}>
                      {time}
                    </TableCell>
                    {DAYS.map(day => {
                      // Skip this cell if it's part of a merged cell from a previous row
                      if (shouldSkipCell(day)) {
                        return null;
                      }

                      // Get courses for this specific day and slot, and filter to ensure they belong to this day
                      const coursesInSlot = (timetableGrid[day]?.[slotIndex] || []).filter(
                        item => item.timing.day === day
                      );
                      
                      const uniqueCourses = [];
                      const seen = new Set();
                      
                      coursesInSlot.forEach(item => {
                        // Use a unique key that includes course ID, day, and timing to handle same course on different days/times
                        const uniqueKey = `${item.course._id}_${day}_${item.timing.startTime}_${item.timing.endTime}`;
                        if (!seen.has(uniqueKey)) {
                          seen.add(uniqueKey);
                          uniqueCourses.push(item);
                        }
                      });

                      // Get the rowSpan for the first course (if multiple courses, use the max)
                      // Use the new spanKey format that includes the day and timing
                      const rowSpan = uniqueCourses.length > 0 ? 
                        Math.max(...uniqueCourses.map(item => {
                          const spanKey = `${item.course._id}_${day}_${item.timing.startTime}_${item.timing.endTime}`;
                          return cellSpans[day]?.[slotIndex]?.[spanKey] || 1;
                        })) : 
                        1;

                      return (
                        <TableCell
                          key={day}
                          sx={{
                            p: 0.5,
                            verticalAlign: 'middle',
                            border: isDark
                              ? '1px solid rgba(255,255,255,0.1)'
                              : '1px solid rgba(0,0,0,0.1)',
                            minHeight: 30,
                            position: 'relative',
                          }}
                          rowSpan={uniqueCourses.length > 0 ? rowSpan : 1}
                        >
                          {uniqueCourses.map((item, idx) => {
                            const courseConflicts = getCourseConflicts(item.course._id);
                            const hasConflict = courseConflicts.length > 0;
                            // Use the new spanKey format that includes the day and timing
                            const spanKey = `${item.course._id}_${day}_${item.timing.startTime}_${item.timing.endTime}`;
                            const itemRowSpan = cellSpans[day]?.[slotIndex]?.[spanKey] || 1;
                            
                            // Double-check that this course actually belongs to this day
                            if (item.timing.day !== day) {
                              return null;
                            }
                            
                            return (
                              <Box
                                key={idx}
                                sx={{
                                  bgcolor: hasConflict ? '#fee2e2' : item.course.color,
                                  color: 'white',
                                  p: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  border: hasConflict ? '2px solid #ef4444' : 'none',
                                  height: itemRowSpan > 1 ? `calc(100% - 4px)` : 'auto',
                                  minHeight: itemRowSpan > 1 ? `${itemRowSpan * 30 - 8}px` : 'auto',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  textAlign: 'center',
                                }}
                              >
                                <Box sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                                  {item.course.courseCode}
                                </Box>
                                <Box sx={{ 
                                  fontSize: { xs: '0.55rem', sm: '0.65rem' }, 
                                  opacity: 0.95, 
                                  lineHeight: 1.2, 
                                  mt: 0.25,
                                  display: { xs: 'none', sm: 'block' }
                                }}>
                                  {item.course.courseName}
                                </Box>
                                <Box sx={{ fontSize: { xs: '0.55rem', sm: '0.65rem' }, opacity: 0.9, mt: 0.25 }}>
                                  Sec {item.course.section}
                                </Box>
                                <Box sx={{ fontSize: { xs: '0.55rem', sm: '0.65rem' }, opacity: 0.9, mt: 0.25 }}>
                                  {item.timing.startTime} - {item.timing.endTime}
                                </Box>
                              </Box>
                            );
                          })}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Course List */}
      <Grid container spacing={3}>
        {courses.map(course => {
          const courseConflicts = getCourseConflicts(course._id);
          const hasConflict = courseConflicts.length > 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card
                sx={{
                  border: hasConflict ? '2px solid #ef4444' : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {course.courseCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {course.courseName}
                      </Typography>
                      <Chip
                        label={`Section ${course.section}`}
                        size="small"
                        sx={{
                          bgcolor: course.color,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(course)}
                        sx={{ color: '#6366f1' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(course._id)}
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {hasConflict && (
                    <Alert severity="warning" sx={{ mb: 2, py: 0.5 }}>
                      <Typography variant="caption" fontWeight={600}>
                        Has conflicts!
                      </Typography>
                    </Alert>
                  )}

                  <Box>
                    <Typography variant="caption" fontWeight={600} display="block" mb={1}>
                      Schedule:
                    </Typography>
                    {course.timings.map((timing, idx) => (
                      <Typography key={idx} variant="caption" display="block" sx={{ mb: 0.5 }}>
                        {timing.day}: {timing.startTime} - {timing.endTime}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {courses.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: isDark
            ? '0px 8px 32px rgba(0,0,0,0.5)'
            : '0px 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            📅 No courses added yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add your first course to start building your timetable!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Add Course
          </Button>
        </Paper>
      )}

      {/* Add/Edit Course Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: '0px 8px 32px rgba(0,0,0,0.15)',
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: '90vh' },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            p: { xs: 2, sm: 3 },
          }}
        >
          {editingCourse ? '✏️ Edit Course' : '➕ Add Course'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Course Code"
                fullWidth
                required
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                placeholder="e.g., ENR106"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Section"
                fullWidth
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g., 1"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Course Name"
                fullWidth
                required
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                placeholder="e.g., Introduction to Programming"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Color"
                type="color"
                fullWidth
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Timings
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddTiming}
                  variant="outlined"
                >
                  Add Timing
                </Button>
              </Box>

              {formData.timings.map((timing, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: isDark
                      ? '1px solid rgba(255,255,255,0.1)'
                      : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 2,
                    bgcolor: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Day</InputLabel>
                        <Select
                          value={timing.day}
                          label="Day"
                          onChange={(e) => handleTimingChange(index, 'day', e.target.value)}
                        >
                          {DAYS.map(day => (
                            <MenuItem key={day} value={day}>
                              {day}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Start Time"
                        type="time"
                        fullWidth
                        value={timing.startTime}
                        onChange={(e) => handleTimingChange(index, 'startTime', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="End Time"
                        type="time"
                        fullWidth
                        value={timing.endTime}
                        onChange={(e) => handleTimingChange(index, 'endTime', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      {formData.timings.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveTiming(index)}
                          fullWidth
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button
            onClick={handleCloseDialog}
            fullWidth={{ xs: true, sm: false }}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            fullWidth={{ xs: true, sm: false }}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {loading ? 'Saving...' : editingCourse ? 'Update' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

