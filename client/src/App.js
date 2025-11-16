import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Snippets from './pages/Snippets';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

function AppContent() {
  const { loading } = useAuth();
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);

  // Handle typing completion
  const handleTypingComplete = () => {
    setTypingComplete(true);
  };

  // Only hide loading screen when both auth is loaded AND typing is complete
  useEffect(() => {
    if (!loading && typingComplete) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setShowLoadingScreen(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, typingComplete]);

  if (showLoadingScreen) {
    return <LoadingScreen onTypingComplete={handleTypingComplete} />;
  }

  return (
    <Box sx={{ 
      position: 'relative', 
      zIndex: 1, 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
    }}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/snippets"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Snippets />
                </PrivateRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Attendance />
                </PrivateRoute>
              }
            />
            <Route
              path="/timetable"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Timetable />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
        <Footer />
      </Router>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeWrapper />
    </ThemeProvider>
  );
}

function ThemeWrapper() {
  const { theme } = useThemeMode();
  
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </MUIThemeProvider>
  );
}

export default App;

