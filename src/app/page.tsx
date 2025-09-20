'use client';

import { 
  Box, 
  Drawer, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton,
  IconButton,
  Divider,
  AppBar,
  Toolbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { ChatPage } from "./chat";
import { AuthButton } from "~/components/auth-button";

const drawerWidth = 280;

const chats = [
  {
    id: "1",
    title: "My First Chat",
  },
  {
    id: "2", 
    title: "Another Chat",
  },
];

const activeChatId = "1";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`,
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            My Chat App
          </Typography>
          <AuthButton />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Your Chats
            </Typography>
            <IconButton 
              size="small" 
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
            {session ? (
              chats.length > 0 ? (
                chats.map((chat) => (
                  <ListItem key={chat.id} disablePadding>
                    <ListItemButton
                      selected={chat.id === activeChatId}
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
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          mt: '64px' // AppBar height
        }}
      >
        <ChatPage userName={session?.user?.name || "Guest"} />
      </Box>
    </Box>
  );
}