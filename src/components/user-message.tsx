import { 
  Box, 
  Avatar, 
  Typography, 
  Paper,
  Stack
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import type { Message } from "ai";
import { MessagePartsRenderer } from './message-parts';

interface UserMessageProps {
  message: Message;
  userName: string;
}

export const UserMessage = ({ message, userName }: UserMessageProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
      <Box sx={{ maxWidth: '70%' }}>
        <Stack spacing={1} sx={{ alignItems: 'flex-end' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {userName}
          </Typography>
          
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: 'primary.dark',
              color: 'primary.contrastText',
              borderRadius: 2,
              borderTopRightRadius: 1,
            }}
          >
            <Box sx={{ 
              '& > *:first-of-type': { mt: 0 },
              '& > *:last-child': { mb: 0 }
            }}>
              <MessagePartsRenderer 
                parts={message.parts || []} 
                fallbackContent={message.content}
              />
            </Box>
          </Paper>
        </Stack>
      </Box>

      <Avatar
        sx={{
          bgcolor: 'primary.main',
          width: 40,
          height: 40,
        }}
      >
        <PersonIcon />
      </Avatar>
    </Box>
  );
};