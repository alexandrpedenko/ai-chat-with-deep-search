import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import type { Message } from "ai";
import { Markdown } from './markdown';

// Define MessagePart type as specified
export type MessagePart = NonNullable<Message["parts"]>[number];

interface MessagePartComponentProps {
  part: MessagePart;
}

export const MessagePartComponent = ({ part }: MessagePartComponentProps) => {
  switch (part.type) {
    case "text":
      return <Markdown>{part.text}</Markdown>;
    
    case "tool-invocation":
      const { toolInvocation } = part;
      const isResult = toolInvocation.state === "result";
      const isPartialCall = toolInvocation.state === "partial-call";
      
      return (
        <Box sx={{ mb: 2 }}>
          <Accordion elevation={2} sx={{ bgcolor: 'action.hover' }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ minHeight: 48 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <SearchIcon color="primary" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {toolInvocation.toolName}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Chip 
                  label={toolInvocation.state} 
                  size="small"
                  color={isResult ? "success" : isPartialCall ? "warning" : "info"}
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {/* Tool Arguments */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Arguments:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
                    <Typography variant="body2" component="pre" sx={{ 
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {JSON.stringify(toolInvocation.args, null, 2)}
                    </Typography>
                  </Paper>
                </Box>
                
                {/* Tool Result (if available) */}
                {isResult && 'result' in toolInvocation && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Result:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
                        <Typography variant="body2" component="pre" sx={{ 
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {JSON.stringify(toolInvocation.result, null, 2)}
                        </Typography>
                      </Paper>
                    </Box>
                  </>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
      );
    
    default:
      // For any other part types we don't handle yet (reasoning, source, file, step-start)
      return (
        <Box sx={{ mb: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Unsupported part type: {part.type}
          </Typography>
        </Box>
      );
  }
};

interface MessagePartsRendererProps {
  parts: MessagePart[];
  fallbackContent?: string;
}

export const MessagePartsRenderer = ({ parts, fallbackContent }: MessagePartsRendererProps) => {
  // If we have parts, render them
  if (parts && parts.length > 0) {
    return (
      <>
        {parts.map((part: MessagePart, index: number) => (
          <MessagePartComponent key={`${part.type}-${index}`} part={part} />
        ))}
      </>
    );
  }

  // Fallback to content if no parts
  if (fallbackContent) {
    return <Markdown>{fallbackContent}</Markdown>;
  }

  // No content at all
  return (
    <Typography variant="body2" color="text.secondary" fontStyle="italic">
      No content to display
    </Typography>
  );
};