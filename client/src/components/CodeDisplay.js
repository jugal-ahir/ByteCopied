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
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.1)',
        flexGrow: 1,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#1e1e1e',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#6366f1',
          borderRadius: '4px',
        },
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

