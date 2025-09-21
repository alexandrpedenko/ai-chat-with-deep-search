"use client";

import { 
  Box, 
  TextField, 
  Button, 
  Stack,
  Container,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useChat } from "@ai-sdk/react";
import { ChatMessage } from "~/components/chat-message";

interface ChatProps {
  userName: string;
}

export const ChatPage = ({ userName }: ChatProps) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.default'
    }}>
      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container maxWidth="md" sx={{ flexGrow: 1 }}>
          <Stack spacing={3} sx={{ py: 2 }}>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                text={message.content}
                role={message.role}
                userName={userName}
              />
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <Container maxWidth="md">
          <Box
            component="form"
            onSubmit={handleFormSubmit}
            sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Say something..."
              variant="outlined"
              size="small"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default',
                }
              }}
              autoFocus
            />
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={isLoading}
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
    </Box>
  );
};