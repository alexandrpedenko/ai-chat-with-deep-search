"use client";

import { 
  Box, 
  Stack,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { useChat } from "@ai-sdk/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useCallback } from "react";
import type { Message } from "ai";
import type { Chat } from "~/domain/chat";
import { ChatMessage } from "~/components/chat-message";
import { isNewChatCreated } from "~/utils/chat";
import { ScrollableChat } from "~/components/scrollable-chat";
import { ChatInput } from "~/components/chat-input";
import { LoadingOverlay } from "~/components/loading-overlay";

interface ChatProps {
  userName: string;
  chatId?: string;
  currentChat?: Chat | null;
}

export const ChatPage = ({ userName, chatId, currentChat }: ChatProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  
  const initialMessages = useMemo(() => {
    const messages = currentChat?.messages?.map((msg) => ({
      id: msg.id,
      role: msg.role,
      parts: msg.parts,
      annotations: msg.annotations,
      content: msg.content,
    })) || [];
    
    return messages;
  }, [currentChat?.id, currentChat?.messages?.length]) as Message[];

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
    initialMessages,
  });

  // Listen for NEW_CHAT_CREATED events and redirect
  useEffect(() => {
    if (!data?.length) return;
    
    const lastDataItem = data[data.length - 1];

    if (isNewChatCreated(lastDataItem)) {
      router.push(`?id=${lastDataItem.chatId}`);
    }
  }, [data?.length, router]);

  const isAuthenticated = status === "authenticated" && session?.user;
  const isAuthenticating = status === "loading";

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert("Please sign in to send messages");
      return;
    }
    
    handleSubmit(e);
  }, [isAuthenticated, handleSubmit]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      bgcolor: 'background.default',
      position: 'relative'
    }}>
      {(isAuthenticating && !session) && <LoadingOverlay />}
      
      {/* Messages Area */}
      <ScrollableChat>
        <Container maxWidth="md" sx={{ flexGrow: 1 }}>
          <Stack spacing={3} sx={{ py: 2 }}>
            {!isAuthenticated && !isAuthenticating && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Please sign in with GitHub to start chatting with the AI assistant.
              </Alert>
            )}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message as Message}
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

      <ChatInput
        input={input}
        isLoading={isLoading}
        isAuthenticated={!!isAuthenticated}
        onInputChange={handleInputChange}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
};