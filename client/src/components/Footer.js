import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        px: 2,
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          fontWeight: 500,
        }}
      >
        Designed and developed with ❤️ by Jugal
      </Typography>
    </Box>
  );
}

