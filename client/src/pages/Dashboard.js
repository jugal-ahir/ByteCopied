import React from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, Chip } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 11, sm: 14 }, mb: 4 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          p: { xs: 2, sm: 4 },
          mb: 4,
          boxShadow: '0px 8px 32px rgba(0,0,0,0.1)',
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
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          boxShadow: '0px 8px 32px rgba(0,0,0,0.1)',
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
    </Container>
  );
}

