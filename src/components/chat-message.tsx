import React from 'react';
import type { Message } from "ai";
import { UserMessage } from './user-message';
import { AssistantMessage } from './assistant-message';

interface ChatMessageProps {
  message: Message;
  userName: string;
}

export const ChatMessage = React.memo(({ message, userName }: ChatMessageProps) => {
  const isUser = message.role === "user";
  
  if (isUser) {
    return <UserMessage message={message} userName={userName} />;
  }
  
  return <AssistantMessage message={message} />;
});

ChatMessage.displayName = 'ChatMessage';