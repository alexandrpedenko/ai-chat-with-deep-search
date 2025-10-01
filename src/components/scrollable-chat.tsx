'use client';

import { Box } from '@mui/material';
import { StickToBottom } from "use-stick-to-bottom";
import type { ReactNode } from 'react';

interface ScrollableChatProps {
  children: ReactNode;
}

export function ScrollableChat({ children }: ScrollableChatProps) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0, // Important for flexbox overflow
        position: 'relative',
        // Style the scrollbar for the StickToBottom child div
        '& > div': {
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
            },
          },
        },
      }}
    >
      <StickToBottom
        resize="smooth"
        initial="smooth"
        style={{
          height: '100%',
          width: '100%'
        }}
      >
        <StickToBottom.Content
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </StickToBottom.Content>
      </StickToBottom>
    </Box>
  );
}