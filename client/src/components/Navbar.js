import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Code,
  People,
  Logout,
  AdminPanelSettings,
  School,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleClose();
  };

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const getNavButtonStyles = (isActive) => ({
    color: 'white',
    fontWeight: 600,
    px: 2.5,
    py: 1,
    borderRadius: 2,
    minWidth: 120,
    position: 'relative',
    background: isActive
      ? 'rgba(255,255,255,0.25)'
      : 'transparent',
    backdropFilter: 'blur(10px)',
    border: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
    '&::before': isActive ? {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: 3,
      background: 'linear-gradient(90deg, transparent, white, transparent)',
      borderRadius: '3px 3px 0 0',
    } : {},
    '&:hover': {
      background: 'rgba(255,255,255,0.2)',
      transform: 'translateY(-2px)',
      border: '1px solid rgba(255,255,255,0.2)',
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        top: { xs: 8, sm: 16 },
        left: { xs: 8, sm: 16 },
        right: { xs: 8, sm: 16 },
        width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
        borderRadius: { xs: 2, sm: 3 },
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0px 8px 32px rgba(0,0,0,0.15), 0px 0px 0px 1px rgba(255,255,255,0.1) inset',
        border: '1px solid rgba(255,255,255,0.2)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ py: 1.5, px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            flexGrow: { xs: 1, md: 0 },
            mr: { xs: 2, md: 4 },
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              mr: 1.5,
              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Code sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            ByteCopied
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: { xs: 'flex-end', md: 'flex-start' },
        }}>
          <Button
            onClick={() => navigate('/')}
            startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
            sx={getNavButtonStyles(location.pathname === '/')}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => navigate('/snippets')}
            startIcon={<Code sx={{ fontSize: 18 }} />}
            sx={getNavButtonStyles(location.pathname === '/snippets')}
          >
            Snippets
          </Button>
          <Button
            onClick={() => navigate('/attendance')}
            startIcon={<People sx={{ fontSize: 18 }} />}
            sx={getNavButtonStyles(location.pathname === '/attendance')}
          >
            Attendance
          </Button>
          <Button
            onClick={() => navigate('/timetable')}
            startIcon={<CalendarToday sx={{ fontSize: 18 }} />}
            sx={getNavButtonStyles(location.pathname === '/timetable')}
          >
            Timetable
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2 }}>
          {isAdmin && (
            <Chip
              icon={<AdminPanelSettings sx={{ fontSize: 16 }} />}
              label="Admin"
              size="small"
              sx={{
                background: 'rgba(236, 72, 153, 0.3)',
                color: 'white',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.2)',
                display: { xs: 'none', sm: 'flex' },
                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.05)',
              },
            }}
            onClick={handleMenu}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                fontSize: '0.875rem',
                fontWeight: 700,
                boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {getInitials(currentUser?.name, currentUser?.email)}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  maxWidth: 150,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentUser?.name || currentUser?.email?.split('@')[0] || 'User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.75rem',
                  display: 'block',
                }}
              >
                {isAdmin ? 'Administrator' : 'Student'}
              </Typography>
            </Box>
            <AccountCircle
              sx={{
                fontSize: 20,
                color: 'rgba(255,255,255,0.7)',
                display: { xs: 'block', md: 'none' },
              }}
            />
          </Box>
        </Box>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 3,
              boxShadow: '0px 8px 32px rgba(0,0,0,0.15)',
              minWidth: 280,
              border: '1px solid rgba(0,0,0,0.05)',
              overflow: 'hidden',
            },
          }}
          MenuListProps={{
            sx: { py: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                {getInitials(currentUser?.name, currentUser?.email)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUser?.name || currentUser?.email || 'User'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {isAdmin ? (
                    <>
                      <AdminPanelSettings sx={{ fontSize: 14, color: '#ec4899' }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                        Administrator
                      </Typography>
                    </>
                  ) : (
                    <>
                      <School sx={{ fontSize: 14, color: '#6366f1' }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                        Student
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              navigate('/');
              handleClose();
            }}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: '#6366f1' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate('/snippets');
              handleClose();
            }}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
              },
            }}
          >
            <ListItemIcon>
              <Code sx={{ color: '#6366f1' }} />
            </ListItemIcon>
            <ListItemText primary="Snippets" />
          </MenuItem>
          {isAdmin && (
            <MenuItem
              onClick={() => {
                navigate('/attendance');
                handleClose();
              }}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                },
              }}
            >
              <ListItemIcon>
                <People sx={{ color: '#ec4899' }} />
              </ListItemIcon>
              <ListItemText primary="Attendance" />
            </MenuItem>
          )}
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              },
            }}
          >
            <ListItemIcon>
              <Logout sx={{ color: '#ef4444' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ sx: { color: '#ef4444', fontWeight: 600 } }} />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

