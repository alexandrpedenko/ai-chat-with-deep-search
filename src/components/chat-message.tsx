import { 
  Box, 
  Avatar, 
  Typography, 
  Paper,
  Stack
} from '@mui/material';
import { Person as PersonIcon, SmartToy as BotIcon } from '@mui/icons-material';
import { Markdown } from './markdown';

interface ChatMessageProps {
  text: string;
  role: string;
  userName: string;
}

export const ChatMessage = ({ text, role, userName }: ChatMessageProps) => {
  const isUser = role === "user";
  
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 40,
          height: 40,
        }}
      >
        {isUser ? (
          <PersonIcon />
        ) : (
          <BotIcon />
        )}
      </Avatar>
      
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            {isUser ? userName : "Assistant"}
          </Typography>
          
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: isUser ? 'primary.dark' : 'background.paper',
              color: isUser ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              maxWidth: '100%',
            }}
          >
            <Box sx={{ 
              '& > *:first-of-type': { mt: 0 },
              '& > *:last-child': { mb: 0 }
            }}>
              <Markdown>{text}</Markdown>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};