import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  MenuItem,
  Grid,
  LinearProgress,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import TimerIcon from '@mui/icons-material/Timer';
import { useAuth } from '../contexts/AuthContext';
import createApiInstance from '../services/api';
import { saveAs } from 'file-saver';

export default function Attendance() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { getAuthHeaders, isAdmin, currentUser } = useAuth();
  const [section, setSection] = useState('1');
  const [timerDuration, setTimerDuration] = useState(60);
  const [activeSession, setActiveSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [rollNumber, setRollNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasNotified, setHasNotified] = useState(false);
  const pollingIntervalRef = useRef(null);

  const api = createApiInstance(getAuthHeaders);

  // Timer effect - use server-calculated timeRemaining and countdown locally
  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      // Use server-provided timeRemaining if available (most accurate)
      if (activeSession.timeRemaining !== undefined) {
        setTimeRemaining(activeSession.timeRemaining);
        
        // Store when we received this value to calculate countdown
        const receivedAt = activeSession.serverTime ? new Date(activeSession.serverTime) : new Date();
        const serverTimeRemaining = activeSession.timeRemaining;
        
        // Countdown locally, refreshing from server periodically
        const timer = setInterval(() => {
          const now = new Date();
          const elapsedSinceUpdate = Math.floor((now.getTime() - receivedAt.getTime()) / 1000);
          const newRemaining = Math.max(0, serverTimeRemaining - elapsedSinceUpdate);
          setTimeRemaining(newRemaining);
          
          if (newRemaining <= 0) {
            clearInterval(timer);
            // Refresh from server to get updated status
            // eslint-disable-next-line react-hooks/exhaustive-deps
            fetchActiveSessions();
          }
        }, 1000);

        return () => clearInterval(timer);
      } else {
        // Fallback: calculate from startedAt if server timeRemaining not available
        let startedAt;
        if (activeSession.startedAt?.toDate) {
          startedAt = activeSession.startedAt.toDate();
        } else if (typeof activeSession.startedAt === 'string') {
          startedAt = new Date(activeSession.startedAt);
        } else if (activeSession.startedAt?.seconds) {
          startedAt = new Date(activeSession.startedAt.seconds * 1000);
        } else {
          startedAt = new Date(activeSession.startedAt);
        }
        
        const updateTimer = () => {
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
          const validElapsed = Math.max(0, elapsed);
          const remaining = Math.max(0, Math.min(activeSession.timerDuration, activeSession.timerDuration - validElapsed));
          setTimeRemaining(remaining);
          return remaining;
        };

        updateTimer();
        const timer = setInterval(() => {
          const remaining = updateTimer();
          if (remaining <= 0) {
            clearInterval(timer);
          }
        }, 1000);

        return () => clearInterval(timer);
      }
    } else {
      setTimeRemaining(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  useEffect(() => {
    // Initial fetch - happens immediately
    fetchActiveSessions();
    
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    if (!isAdmin) {
      // For students: poll more frequently when no active session, less frequently when active
      const pollInterval = activeSession ? 10000 : 3000; // 3 seconds when waiting, 10 seconds when active
      
      const handleVisibilityChange = () => {
        // When page becomes visible, immediately fetch
        if (!document.hidden) {
          fetchActiveSessions();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      pollingIntervalRef.current = setInterval(() => {
        // Only poll if page is visible
        if (!document.hidden) {
          fetchActiveSessions();
        }
      }, pollInterval);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      // For admin, refresh session data every 5 seconds to keep timer synchronized
      pollingIntervalRef.current = setInterval(() => {
        if (activeSession) {
          fetchActiveSessions();
        }
      }, 5000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, activeSession]);

  // Request browser notification permission and show notification when session starts
  useEffect(() => {
    if (!isAdmin && activeSession && !hasNotified && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      } else if (Notification.permission === 'granted') {
        new Notification('🎯 Attendance Session Started!', {
          body: `Section ${activeSession.section} attendance is now active. Click to mark your attendance!`,
          icon: '/favicon.ico',
          tag: 'attendance-session',
          requireInteraction: false,
        });
        setHasNotified(true);
      }
    }
    // Reset notification flag when session ends
    if (!activeSession) {
      setHasNotified(false);
    }
  }, [activeSession, isAdmin, hasNotified]);

  const fetchActiveSessions = async () => {
    try {
      const response = await api.get('/attendance/sessions');
      const active = response.data.find((s) => s.status === 'active');
      if (active) {
        // Update activeSession immediately when found
        const wasInactive = !activeSession;
        const isNewSession = wasInactive || (activeSession && activeSession.id !== active.id);
        setActiveSession(active);
        // Use server-provided timeRemaining if available (calculated on server for accuracy)
        if (active.timeRemaining !== undefined) {
          setTimeRemaining(active.timeRemaining);
        }
        
        // Check if user has already submitted (for students)
        if (!isAdmin && active.hasSubmitted !== undefined) {
          setSubmitted(active.hasSubmitted);
        }
        
        // Auto-fill enrollment number if available, not already submitted, and it's a new session
        if (!isAdmin && !active.hasSubmitted && currentUser?.enrollmentNumber && isNewSession) {
          setRollNumber(currentUser.enrollmentNumber);
        }
        
        // Show notification if session just became active
        if (wasInactive && !isAdmin) {
          setSuccess(`🎉 Attendance session started for Section ${active.section}!`);
          setTimeout(() => setSuccess(''), 5000);
        }
      } else {
        setActiveSession(null);
        setTimeRemaining(0);
        setSubmitted(false);
        setRollNumber(''); // Clear roll number when no active session
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleStartSession = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/attendance/start', {
        section,
        timerDuration,
      });
      setActiveSession(response.data.session);
      // Timer will be calculated automatically by the useEffect based on startedAt
      setSuccess(`Attendance session started for Section ${section}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/attendance/end', {
        sessionId: activeSession.id,
      }, {
        responseType: 'blob',
      });

      // Check if response is actually a PDF or an error JSON
      const contentType = response.headers['content-type'] || '';
      
      // If content type is JSON, it's an error response
      if (contentType.includes('application/json')) {
        // Error response - parse the blob as text to get error message
        const text = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsText(response.data);
        });
        
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || errorData.details || 'Failed to end session');
        } catch (parseError) {
          throw new Error('Failed to end session. Invalid response from server.');
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `attendance_${activeSession.section}_${Date.now()}.pdf`);

      setActiveSession(null);
      setTimeRemaining(0);
      setSuccess('Attendance session ended. PDF downloaded.');
      fetchActiveSessions();
    } catch (error) {
      console.error('End session error:', error);
      
      // Handle blob error responses
      if (error.response?.data instanceof Blob) {
        try {
          const text = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsText(error.response.data);
          });
          const errorData = JSON.parse(text);
          setError(errorData.error || errorData.details || 'Failed to end session');
        } catch (parseError) {
          setError(error.message || 'Failed to end session. Please check server logs.');
        }
      } else {
        setError(error.message || error.response?.data?.error || 'Failed to end session');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!activeSession || !rollNumber.trim() || submitted) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/attendance/submit', {
        sessionId: activeSession.id,
        rollNumber: rollNumber.trim(),
      });
      setSubmitted(true);
      setRollNumber('');
      setSuccess('✅ Attendance submitted successfully!');
      // Don't reset submitted state - keep it disabled
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to submit attendance';
      if (errorMsg.includes('already submitted')) {
        setSubmitted(true);
        setSuccess('✅ You have already submitted your attendance!');
      } else {
        setError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    // Student view
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 11, sm: 14 }, mb: 4 }}>
        <Box
          sx={{
            background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            mb: 4,
            boxShadow: isDark
            ? '0px 8px 32px rgba(0,0,0,0.5)'
            : '0px 8px 32px rgba(0,0,0,0.1)',
          }}
        >
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
            📋 Attendance
          </Typography>
        </Box>

        {activeSession ? (
          <Paper
            sx={{
              p: { xs: 3, sm: 5 },
              mt: 3,
              background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              boxShadow: isDark
            ? '0px 8px 32px rgba(0,0,0,0.5)'
            : '0px 8px 32px rgba(0,0,0,0.1)',
              border: '2px solid #6366f1',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  boxShadow: '0px 8px 32px rgba(99, 102, 241, 0.3)',
                },
                '50%': {
                  boxShadow: '0px 8px 40px rgba(99, 102, 241, 0.5)',
                },
              },
            }}
          >
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                🎯 Attendance Session Active!
              </Typography>
              <Typography variant="body2">
                Enter your roll number below to mark your attendance. Hurry, time is running out!
              </Typography>
            </Alert>
            
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  mb: 2,
                  animation: 'bounce 1s ease-in-out infinite',
                  '@keyframes bounce': {
                    '0%, 100%': {
                      transform: 'translateY(0)',
                    },
                    '50%': {
                      transform: 'translateY(-10px)',
                    },
                  },
                }}
              >
                <TimerIcon sx={{ fontSize: 50, color: 'white' }} />
              </Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                Section {activeSession.section} - Active Session
              </Typography>
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(timeRemaining / activeSession.timerDuration) * 100}
                sx={{
                  mt: 2,
                  height: 12,
                  borderRadius: 6,
                  background: 'rgba(99, 102, 241, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderRadius: 6,
                  },
                }}
              />
            </Box>

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

            {submitted ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  borderRadius: 3,
                  border: '2px solid #10b981',
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    mb: 2,
                    animation: 'scaleIn 0.5s ease-out',
                    '@keyframes scaleIn': {
                      '0%': {
                        transform: 'scale(0)',
                        opacity: 0,
                      },
                      '100%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 40 }}>✅</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#059669', mb: 1 }}>
                  Attendance Submitted!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your attendance has been successfully recorded. You cannot submit again for this session.
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmitAttendance}>
                <TextField
                  fullWidth
                  label="Enter Your Roll Number"
                  placeholder={currentUser?.enrollmentNumber ? `Your enrollment: ${currentUser.enrollmentNumber}` : ''}
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  disabled={timeRemaining === 0 || submitting}
                  helperText={currentUser?.enrollmentNumber ? `Tip: Your enrollment number is ${currentUser.enrollmentNumber}` : ''}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                  }}
                  required
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={timeRemaining === 0 || submitting}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: submitting 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      opacity: 0.7,
                    },
                    '&::before': submitting ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 1.5s infinite',
                      '@keyframes shimmer': {
                        '0%': { left: '-100%' },
                        '100%': { left: '100%' },
                      },
                    } : {},
                  }}
                >
                  {submitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress 
                        size={24} 
                        sx={{ 
                          color: 'white',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          },
                        }} 
                      />
                      <Typography component="span">Submitting...</Typography>
                    </Box>
                  ) : (
                    'Submit Attendance'
                  )}
                </Button>
              </Box>
            )}

            {timeRemaining === 0 && (
              <Alert
                severity="warning"
                sx={{
                  mt: 3,
                  borderRadius: 2,
                }}
              >
                ⏰ Time's up! The attendance session has ended.
              </Alert>
            )}
          </Paper>
        ) : (
          <Paper
            sx={{
              p: 6,
              mt: 3,
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
            <Box
              sx={{
                display: 'inline-flex',
                p: 3,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                mb: 3,
              }}
            >
              <TimerIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              ⏸️ No Active Session
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Waiting for an admin to start an attendance session...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              This page will automatically update when a session starts.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="caption" color="text.secondary">
                Checking for active sessions...
              </Typography>
            </Box>
          </Paper>
        )}
      </Container>
    );
  }

  // Admin view
  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 11, sm: 14 }, mb: 4 }}>
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
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          👥 Attendance Management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {!activeSession ? (
        <Paper
          sx={{
            p: 5,
            mt: 3,
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
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            🚀 Start New Attendance Session
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                {['1', '2', '3', '4'].map((sec) => (
                  <MenuItem key={sec} value={sec}>
                    Section {sec}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Timer Duration (seconds)"
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                {[30, 40, 50, 60].map((duration) => (
                  <MenuItem key={duration} value={duration}>
                    {duration} seconds
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartSession}
                disabled={loading}
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Attendance Session'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 5,
            mt: 3,
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
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                mb: 2,
              }}
            >
              <TimerIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Section {activeSession.section} - Active Session
            </Typography>
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(timeRemaining / activeSession.timerDuration) * 100}
              sx={{
                mt: 2,
                height: 12,
                borderRadius: 6,
                background: 'rgba(236, 72, 153, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  borderRadius: 6,
                },
              }}
            />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
              Total Students: {activeSession.totalStudents}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<StopIcon />}
            onClick={handleEndSession}
            disabled={loading}
            fullWidth
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'End Session & Generate PDF'}
          </Button>
        </Paper>
      )}
    </Container>
  );
}

