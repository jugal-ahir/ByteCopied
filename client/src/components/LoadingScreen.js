import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const LoadingScreen = ({ onTypingComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fullText = 'ByteCopied';
  const typingSpeed = 250; // milliseconds per character (slower for better visibility)
  const cursorBlinkSpeed = 530; // milliseconds
  const minDisplayTime = 2000; // Minimum time to show loading screen (2 seconds)

  useEffect(() => {
    // Typewriter effect - only run once
    let currentIndex = 0;
    let typingInterval = null;
    let completionTimeout = null;
    
    const startTyping = () => {
      typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          // Typing complete
          if (typingInterval) {
            clearInterval(typingInterval);
            typingInterval = null;
          }
          
          // Wait a bit after typing completes, then mark as complete
          completionTimeout = setTimeout(() => {
            setIsTypingComplete(true);
            if (onTypingComplete) {
              onTypingComplete();
            }
          }, minDisplayTime);
        }
      }, typingSpeed);
    };

    // Start typing immediately
    startTyping();

    // Cleanup function
    return () => {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
      if (completionTimeout) {
        clearTimeout(completionTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    // Cursor blink effect
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        zIndex: 9999,
        '@keyframes gradientShift': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      }}
    >
      {/* Animated background particles */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            animation: 'float 6s ease-in-out infinite',
          },
          '&::before': {
            top: '20%',
            left: '10%',
            animationDelay: '0s',
          },
          '&::after': {
            bottom: '20%',
            right: '10%',
            animationDelay: '3s',
          },
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translateY(0px) scale(1)',
              opacity: 0.3,
            },
            '50%': {
              transform: 'translateY(-30px) scale(1.1)',
              opacity: 0.6,
            },
          },
        }}
      />

      {/* Main content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        {/* ByteCopied text with typewriter effect */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '3.5rem', sm: '5rem', md: '6rem' },
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
            mb: 2,
            textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
            fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
            position: 'relative',
            display: 'inline-block',
            '&::after': {
              content: showCursor ? '"|"' : '""',
              display: 'inline-block',
              width: '4px',
              height: '1em',
              background: 'rgba(255, 255, 255, 0.9)',
              marginLeft: '8px',
              animation: showCursor ? 'blink 0.53s step-end infinite' : 'none',
              '@keyframes blink': {
                '0%, 50%': { opacity: 1 },
                '51%, 100%': { opacity: 0 },
              },
            },
          }}
        >
          {displayedText}
        </Typography>

        {/* Tagline */}
        {displayedText === fullText && (
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 300,
              letterSpacing: '0.1em',
              mt: 2,
              animation: 'fadeInUp 0.8s ease-out',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            Code Snippets & Attendance Management
          </Typography>
        )}

        {/* Loading spinner */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            animation: displayedText === fullText ? 'fadeIn 0.8s ease-out 0.3s both' : 'none',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
              },
              '100%': {
                opacity: 1,
              },
            },
          }}
        >
          <CircularProgress
            size={40}
            thickness={4}
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 400,
              letterSpacing: '0.05em',
            }}
          >
            Loading...
          </Typography>
        </Box>
      </Box>

      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          opacity: 0.6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.8)',
              animation: `bounce 1.4s ease-in-out infinite ${i * 0.2}s`,
              '@keyframes bounce': {
                '0%, 80%, 100%': {
                  transform: 'scale(0)',
                  opacity: 0.5,
                },
                '40%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LoadingScreen;

