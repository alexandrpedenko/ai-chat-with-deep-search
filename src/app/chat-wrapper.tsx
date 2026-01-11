'use client';

import { Box } from '@mui/material';
import { useSession } from 'next-auth/react';
import type { Chat, UserChat } from '~/domain/chat';
import { ChatPage } from "./chat";
import { Header } from "~/components/header";
import { Sidebar } from '~/components/sidebar';

interface ChatPageWrapperProps {
  chatId?: string;
  userChats: UserChat[];
  currentChat: Chat | null;
}

export function ChatPageWrapper({ chatId, userChats, currentChat }: ChatPageWrapperProps) {
  const { data: session } = useSession();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Header />

      <Sidebar
        userChats={userChats}
        currentChatId={chatId}
      />

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          mt: '64px',
          height: 'calc(100vh - 64px)',
          maxHeight: 'calc(100vh - 64px)',
          overflow: 'hidden'
        }}
      >
        <ChatPage 
          key={chatId || 'new-chat'}
          userName={session?.user?.name || "Guest"} 
          chatId={chatId} 
          currentChat={currentChat}
        />
      </Box>
    </Box>
  );
}