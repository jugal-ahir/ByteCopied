import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        px: 2,
        textAlign: 'center',
        background: isDark
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.1)',
        color: 'white',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'white',
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          fontWeight: 500,
        }}
      >
        Designed and developed with ❤️ by Jugal
      </Typography>
    </Box>
  );
}

