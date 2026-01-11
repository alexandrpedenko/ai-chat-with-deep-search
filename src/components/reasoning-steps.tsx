import { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography,
  Collapse,
  Stack,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import type { MessageAnnotation } from '~/domain/annotation';
import { Markdown } from './markdown';

interface ReasoningStepsProps {
  annotations: MessageAnnotation[];
}

export const ReasoningSteps = ({ annotations }: ReasoningStepsProps) => {
  const [openStep, setOpenStep] = useState<number | null>(null);

  if (annotations.length === 0) return null;

  return (
    <Box sx={{ mb: 2, width: '100%' }}>
      <Stack spacing={0.5}>
        {annotations.map((annotation, index) => {
          const isOpen = openStep === index;
          const action = annotation.action;
          
          return (
            <Box key={index}>
              <Button
                onClick={() => setOpenStep(isOpen ? null : index)}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  py: 1,
                  px: 2,
                  bgcolor: isOpen ? 'action.selected' : 'transparent',
                  color: isOpen ? 'text.primary' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isOpen ? 'action.selected' : 'action.hover',
                  },
                  textTransform: 'none',
                  borderRadius: 1,
                }}
              >
                <Chip
                  label={index + 1}
                  size="small"
                  sx={{
                    mr: 1.5,
                    minWidth: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    bgcolor: isOpen ? 'primary.main' : 'action.disabled',
                    color: isOpen ? 'primary.contrastText' : 'text.secondary',
                    '& .MuiChip-label': {
                      px: 1,
                    }
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flexGrow: 1,
                    fontWeight: isOpen ? 600 : 400,
                  }}
                >
                  {action.title}
                </Typography>
                {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </Button>
              
              <Collapse in={isOpen}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mt: 0.5,
                    bgcolor: 'background.default',
                    borderLeft: 3,
                    borderColor: 'primary.main',
                    borderRadius: 1,
                  }}
                >
                  <Typography 
                    component="div"
                    variant="body2" 
                    sx={{ 
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      mb: action.type === 'search' ? 1.5 : 0,
                      '& p': { margin: 0 },
                    }}
                  >
                    <Markdown>{action.reasoning}</Markdown>
                  </Typography>
                  
                  {action.type === 'search' && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'text.secondary',
                      }}
                    >
                      <SearchIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {action.query}
                      </Typography>
                    </Box>
                  )}
                  
                  {action.type === 'answer' && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'success.main',
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        Ready to answer
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Collapse>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
