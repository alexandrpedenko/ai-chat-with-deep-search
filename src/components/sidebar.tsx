'use client';

import { Drawer, Toolbar } from '@mui/material';
import { ChatList } from "./chat-list";

interface Chat {
  id: string;
  title: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface SidebarProps {
  userChats: Chat[];
  currentChatId?: string;
}

export function Sidebar({  userChats, currentChatId }: SidebarProps) {
  return (
    <Drawer
      variant="permanent"
      elevation={0} 
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Toolbar />
      <ChatList userChats={userChats} currentChatId={currentChatId} />
    </Drawer>
  );
}