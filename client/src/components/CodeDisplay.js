import React, { memo } from 'react';
import { Paper } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeDisplay = memo(({ code, language }) => {
  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: '#1e1e1e',
        maxHeight: 250,
        overflow: 'auto',
        borderRadius: '16px',
        border: '9px solid rgba(255, 255, 255, 0.1)',
        flexGrow: 1,
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          margin: '2px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: '10px',
          border: '2px solid #1e1e1e',
          transition: 'background 0.2s ease',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        },
        '&::-webkit-scrollbar-corner': {
          background: '#1e1e1e',
        },
        // Firefox scrollbar support
        scrollbarWidth: 'thin',
        scrollbarColor: '#6366f1 rgba(255, 255, 255, 0.05)',
      }}
    >
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{ margin: 0, background: 'transparent', fontSize: '0.875rem' }}
        wrapLines
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </Paper>
  );
});

CodeDisplay.displayName = 'CodeDisplay';

export default CodeDisplay;

