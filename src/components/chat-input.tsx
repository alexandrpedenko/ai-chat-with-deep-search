import React from 'react';
import {
  Box,
  TextField,
  Button,
  Container
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ChatInput = React.memo(({
  input,
  isLoading,
  isAuthenticated,
  onInputChange,
  onSubmit
}: ChatInputProps) => {
  return (
    <Box
      sx={{
        flexShrink: 0, // Prevent shrinking
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={
              !isAuthenticated 
                ? "Sign in to start chatting..." 
                : "Say something..."
            }
            variant="outlined"
            size="small"
            value={input}
            onChange={onInputChange}
            disabled={isLoading || !isAuthenticated}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default',
              }
            }}
            autoFocus={!!isAuthenticated}
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={isLoading || !isAuthenticated}
            sx={{ 
              minWidth: 'auto',
              px: 2,
              height: '40px'
            }}
          >
            Send
          </Button>
        </Box>
      </Container>
    </Box>
  );
});

ChatInput.displayName = 'ChatInput';