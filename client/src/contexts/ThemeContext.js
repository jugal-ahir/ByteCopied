import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Get theme from localStorage or default to 'light'
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ec4899',
        light: '#f472b6',
        dark: '#db2777',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
        secondary: mode === 'dark' ? '#cbd5e1' : '#64748b',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      mode === 'dark' ? '0px 2px 4px rgba(0,0,0,0.3)' : '0px 2px 4px rgba(0,0,0,0.05)',
      mode === 'dark' ? '0px 4px 8px rgba(0,0,0,0.4)' : '0px 4px 8px rgba(0,0,0,0.08)',
      mode === 'dark' ? '0px 8px 16px rgba(0,0,0,0.5)' : '0px 8px 16px rgba(0,0,0,0.1)',
      mode === 'dark' ? '0px 12px 24px rgba(0,0,0,0.6)' : '0px 12px 24px rgba(0,0,0,0.12)',
      mode === 'dark' ? '0px 16px 32px rgba(0,0,0,0.7)' : '0px 16px 32px rgba(0,0,0,0.14)',
      ...Array(19).fill(mode === 'dark' ? '0px 2px 4px rgba(0,0,0,0.3)' : '0px 2px 4px rgba(0,0,0,0.05)'),
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0px 4px 12px rgba(99, 102, 241, 0.4)' 
                : '0px 4px 12px rgba(99, 102, 241, 0.3)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark' 
              ? '0px 4px 20px rgba(0,0,0,0.4)' 
              : '0px 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'dark' 
                ? '0px 8px 30px rgba(0,0,0,0.6)' 
                : '0px 8px 30px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark' 
              ? '0px 4px 20px rgba(0,0,0,0.4)' 
              : '0px 4px 20px rgba(0,0,0,0.08)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

