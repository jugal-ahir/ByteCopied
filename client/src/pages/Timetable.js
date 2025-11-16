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
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function Timetable() {
  const { getAuthHeaders } = useAuth();
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

  // Generate timetable grid
  const generateTimetableGrid = () => {
    const grid = {};
    DAYS.forEach(day => {
      grid[day] = Array(24).fill(null).map(() => []);
    });

    courses.forEach(course => {
      course.timings.forEach(timing => {
        const startHour = parseInt(timing.startTime.split(':')[0]);
        const endHour = parseInt(timing.endTime.split(':')[0]);
        const startMin = parseInt(timing.startTime.split(':')[1]);
        const endMin = parseInt(timing.endTime.split(':')[1]);

        // Calculate which time slots this course occupies
        const startSlot = startHour + (startMin >= 30 ? 0.5 : 0);
        const endSlot = endHour + (endMin > 30 ? 1 : endMin > 0 ? 0.5 : 0);

        for (let slot = Math.floor(startSlot * 2); slot < Math.floor(endSlot * 2); slot++) {
          if (slot >= 0 && slot < 48) {
            const hour = Math.floor(slot / 2);
            if (grid[timing.day] && grid[timing.day][hour]) {
              grid[timing.day][hour].push({
                course,
                timing,
                startSlot,
                endSlot,
              });
            }
          }
        }
      });
    });

    return grid;
  };

  const timetableGrid = generateTimetableGrid();

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
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          p: 3,
          mb: 4,
          boxShadow: '0px 8px 32px rgba(0,0,0,0.1)',
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
            }}
          >
            📅 Timetable Manager
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {courses.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPDF}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: '#ef4444',
                    color: '#ef4444',
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
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
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
              sx={{
                borderRadius: 2,
                fontWeight: 600,
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
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          boxShadow: '0px 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Weekly Timetable
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 100 }}>Time</TableCell>
                {DAYS.map(day => (
                  <TableCell key={day} sx={{ fontWeight: 600, textAlign: 'center' }}>
                    {day.substring(0, 3)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {TIME_SLOTS.map((time, hourIndex) => (
                <TableRow key={time}>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                    {time}
                  </TableCell>
                  {DAYS.map(day => {
                    const coursesInSlot = timetableGrid[day]?.[hourIndex] || [];
                    const uniqueCourses = [];
                    const seen = new Set();
                    
                    coursesInSlot.forEach(item => {
                      if (!seen.has(item.course._id)) {
                        seen.add(item.course._id);
                        uniqueCourses.push(item);
                      }
                    });

                    return (
                      <TableCell
                        key={day}
                        sx={{
                          p: 0.5,
                          verticalAlign: 'top',
                          border: '1px solid rgba(0,0,0,0.1)',
                          minHeight: 60,
                        }}
                      >
                        {uniqueCourses.map((item, idx) => {
                          const courseConflicts = getCourseConflicts(item.course._id);
                          const hasConflict = courseConflicts.length > 0;
                          
                          return (
                            <Box
                              key={idx}
                              sx={{
                                bgcolor: hasConflict ? '#fee2e2' : item.course.color,
                                color: 'white',
                                p: 0.5,
                                mb: 0.5,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                border: hasConflict ? '2px solid #ef4444' : 'none',
                              }}
                            >
                              <Box sx={{ fontWeight: 600 }}>{item.course.courseCode}</Box>
                              <Box sx={{ fontSize: '0.65rem', opacity: 0.95, lineHeight: 1.2, mt: 0.25 }}>
                                {item.course.courseName}
                              </Box>
                              <Box sx={{ fontSize: '0.65rem', opacity: 0.9, mt: 0.25 }}>
                                Sec {item.course.section}
                              </Box>
                              <Box sx={{ fontSize: '0.65rem', opacity: 0.9, mt: 0.25 }}>
                                {item.timing.startTime} - {item.timing.endTime}
                              </Box>
                            </Box>
                          );
                        })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
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
                  border: hasConflict ? '2px solid #ef4444' : '1px solid rgba(0,0,0,0.1)',
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
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0px 8px 32px rgba(0,0,0,0.1)',
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0px 8px 32px rgba(0,0,0,0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.5rem',
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
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.02)',
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
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDialog}
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

