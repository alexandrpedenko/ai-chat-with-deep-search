'use client';

import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton,
  IconButton,
  Divider
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Chat {
  id: string;
  title: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface ChatListProps {
  userChats: Chat[];
  currentChatId?: string;
}

export function ChatList({ userChats, currentChatId }: ChatListProps) {
  const { data: session, status } = useSession();

  const shouldShowChats = session || status === 'loading';

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Your Chats
        </Typography>
        <IconButton 
          size="small" 
          component={Link}
          href="/"
          sx={{ 
            backgroundColor: 'action.hover',
            '&:hover': {
              backgroundColor: 'action.selected',
            }
          }}
          title="New Chat"
          disabled={!session}
        >
          <AddIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 1 }}>
        {shouldShowChats ? (
          userChats.length > 0 ? (
            userChats.map((chat) => (
              <ListItem key={chat.id} disablePadding>
                <ListItemButton
                  component={Link}
                  href={`?id=${chat.id}`}
                  selected={chat.id === currentChatId}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemText 
                    primary={chat.title}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      noWrap: true
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No chats yet. Start a new conversation!
              </Typography>
            </Box>
          )
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Sign in to start chatting
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );
}