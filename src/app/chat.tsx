"use client";

import { 
  Box, 
  TextField, 
  Button, 
  Stack,
  Container
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { ChatMessage } from "~/components/chat-message";

interface ChatProps {
  userName: string;
}

const messages = [
  {
    id: "1",
    content: "Hello, how are you?",
    role: "user",
  },
  {
    id: "2",
    content: "I'm doing well, thank you! How can I help you today?",
    role: "assistant",
  },
];

export const ChatPage = ({ userName }: ChatProps) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement chat functionality
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
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                text={message.content}
                role={message.role}
                userName={userName}
              />
            ))}
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