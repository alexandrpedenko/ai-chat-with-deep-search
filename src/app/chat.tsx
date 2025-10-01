"use client";

import { 
  Box, 
  TextField, 
  Button, 
  Stack,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useChat } from "@ai-sdk/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { Message } from "ai";
import { ChatMessage } from "~/components/chat-message";
import { isNewChatCreated } from "~/utils/chat";
import { ScrollableChat } from "~/components/scrollable-chat";

interface ChatProps {
  userName: string;
  chatId?: string;
  currentChat?: {
    id: string;
    userId: string;
    title: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    messages: any[];
  } | null;
}

export const ChatPage = ({ userName, chatId, currentChat }: ChatProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const initialMessages = useMemo(() => (
    currentChat?.messages?.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      parts: msg.parts as any,
      content: "",
    })) || []
  ), [currentChat?.messages]) as Message[];
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    data,
  } = useChat({
    body: {
      chatId,
    },
    initialMessages: initialMessages as any,
  });

  // Listen for NEW_CHAT_CREATED events and redirect
  useEffect(() => {
    const lastDataItem = data?.[data.length - 1];

    if (isNewChatCreated(lastDataItem)) {
      router.push(`?id=${lastDataItem.chatId}`);
    }
  }, [data, router]);

  const isAuthenticated = status === "authenticated" && session?.user;
  const isAuthenticating = status === "loading";

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert("Please sign in to send messages");
      return;
    }
    
    handleSubmit(e);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      bgcolor: 'background.default'
    }}>
      {/* Messages Area */}
      <ScrollableChat>
        <Container maxWidth="md" sx={{ flexGrow: 1 }}>
          <Stack spacing={3} sx={{ py: 2 }}>
            {!isAuthenticated && !isAuthenticating && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Please sign in with GitHub to start chatting with the AI assistant.
              </Alert>
            )}
            {isAuthenticating && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Checking authentication status...
              </Alert>
            )}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message as any}
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
      </ScrollableChat>

      {/* Input Area */}
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
            onSubmit={handleFormSubmit}
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
              onChange={handleInputChange}
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
    </Box>
  );
};