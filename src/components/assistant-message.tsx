import { 
  Box, 
  Avatar, 
  Typography, 
  Paper,
  Stack
} from '@mui/material';
import { SmartToy as BotIcon } from '@mui/icons-material';
import type { Message } from "ai";
import { MessagePartsRenderer } from './message-parts';

interface AssistantMessageProps {
  message: Message;
}

export const AssistantMessage = ({ message }: AssistantMessageProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      <Avatar
        sx={{
          bgcolor: 'secondary.main',
          width: 40,
          height: 40,
        }}
      >
        <BotIcon />
      </Avatar>
      
      <Box sx={{ maxWidth: '85%' }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Assistant
          </Typography>
          
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRadius: 2,
              borderTopLeftRadius: 1,
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
    </Box>
  );
};