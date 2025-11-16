import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Ensure API URL always ends with /api
const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  // If URL doesn't end with /api, append it
  if (envUrl && !envUrl.endsWith('/api')) {
    return envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
  }
  return envUrl;
};

export default function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, isAdmin, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const API_URL = getApiUrl();
      const response = await axios.get(`${API_URL}/auth/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError(error.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenUsersDialog = () => {
    setUsersDialogOpen(true);
    if (users.length === 0) {
      fetchUsers();
    }
  };

  const handleCloseUsersDialog = () => {
    setUsersDialogOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 11, sm: 14 }, mb: 4 }}>
      <Box
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          p: { xs: 2, sm: 4 },
          mb: 4,
          boxShadow: isDark
            ? '0px 8px 32px rgba(0,0,0,0.5)'
            : '0px 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2.5rem' },
          }}
        >
          Welcome back! 👋
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 2, fontWeight: 500, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          {currentUser?.name || currentUser?.email}
        </Typography>
        {currentUser?.enrollmentNumber && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            {currentUser.enrollmentNumber}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mt: 2 }}>
          <Chip
            label={isAdmin ? '👑 Administrator' : '🎓 Student'}
            color={isAdmin ? 'secondary' : 'primary'}
            sx={{
              fontWeight: 600,
              px: 1,
              py: 2.5,
              fontSize: '0.95rem',
            }}
          />
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<PersonSearchIcon />}
              onClick={handleOpenUsersDialog}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 },
              }}
            >
              View All Users
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover::before': {
                opacity: 1,
              },
            }}
            onClick={() => navigate('/snippets')}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <CodeIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Code Snippets
                  </Typography>
                </Box>
                <ArrowForwardIcon sx={{ opacity: 0.7 }} />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Manage your code snippets. Create, edit, delete, and download your code snippets.
                {isAdmin && ' You can also create view-only snippets for students.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={isAdmin ? 4 : 6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover::before': {
                opacity: 1,
              },
            }}
            onClick={() => navigate('/timetable')}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Timetable
                  </Typography>
                </Box>
                <ArrowForwardIcon sx={{ opacity: 0.7 }} />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Create and manage your class timetable. Add courses with schedules and automatically
                detect time conflicts.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {isAdmin && (
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover::before': {
                  opacity: 1,
                },
              }}
              onClick={() => navigate('/attendance')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 2,
                        p: 1.5,
                        mr: 2,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Attendance System
                    </Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ opacity: 0.7 }} />
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Manage student attendance. Start attendance sessions, set timers, and generate
                  attendance reports with absentees list.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Paper
        sx={{
          p: 4,
          mt: 4,
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
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          🚀 Quick Start
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            />
            <Typography variant="body1" color="text.secondary">
              Navigate to <strong style={{ color: '#6366f1' }}>Snippets</strong> to manage your code snippets
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              }}
            />
            <Typography variant="body1" color="text.secondary">
              Navigate to <strong style={{ color: '#4facfe' }}>Timetable</strong> to manage your class schedule
            </Typography>
          </Box>
          {isAdmin && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                }}
              />
              <Typography variant="body1" color="text.secondary">
                Navigate to <strong style={{ color: '#ec4899' }}>Attendance</strong> to start an attendance session
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* View All Users Dialog */}
      <Dialog
        open={usersDialogOpen}
        onClose={handleCloseUsersDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: isMobile ? 0 : 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            All Registered Users
          </Typography>
          <Button
            onClick={handleCloseUsersDialog}
            sx={{ minWidth: 'auto', p: 1 }}
            color="inherit"
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {loadingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : usersError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {usersError}
            </Alert>
          ) : users.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No users found.
            </Typography>
          ) : (
            <TableContainer
              sx={{
                maxHeight: '60vh',
                '&::-webkit-scrollbar': {
                  width: '10px',
                  height: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: '10px',
                  border: `2px solid ${isDark ? '#1e1e1e' : '#ffffff'}`,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  },
                },
                scrollbarWidth: 'thin',
                scrollbarColor: '#6366f1 rgba(255, 255, 255, 0.05)',
              }}
            >
              <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.8)' }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.8)' }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.8)' }}>
                      Enrollment
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.8)' }}>
                      Role
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.8)',
                        display: { xs: 'none', sm: 'table-cell' },
                      }}
                    >
                      Registered
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        },
                      }}
                    >
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.enrollmentNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                          color={user.role === 'admin' ? 'secondary' : 'primary'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', sm: 'table-cell' },
                        }}
                      >
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {users.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Total Users: <strong>{users.length}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
          <Button onClick={handleCloseUsersDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

