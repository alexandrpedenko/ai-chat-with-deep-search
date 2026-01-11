import {
  Box,
  Typography,
  Paper,
  Link
} from '@mui/material';
import ReactMarkdown, { type Components } from "react-markdown";

const markdownComponents: Components = {
  // Override default elements with Material-UI styling
  p: ({ children }) => (
    <Typography 
      component="div"
      variant="body1" 
      sx={{ 
        mb: 2, 
        '&:first-of-type': { mt: 0 },
        '&:last-child': { mb: 0 },
        wordWrap: 'break-word'
      }}
    >
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ mb: 2, pl: 3, listStyleType: 'disc' }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ mb: 2, pl: 3, listStyleType: 'decimal' }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
      {children}
    </Typography>
  ),
  code: ({ children }) => (
    <Typography
      component="code"
      variant="body2"
      sx={{
        bgcolor: 'action.hover',
        px: 0.5,
        py: 0.25,
        borderRadius: 0.5,
        fontFamily: 'monospace',
        fontSize: '0.875em'
      }}
    >
      {children}
    </Typography>
  ),
  pre: ({ children }) => (
    <Paper
      elevation={1}
      sx={{
        mb: 2,
        p: 2,
        bgcolor: 'grey.900',
        color: 'common.white',
        borderRadius: 1,
        overflow: 'auto',
        '& code': {
          bgcolor: 'transparent',
          color: 'inherit',
          fontFamily: 'monospace'
        }
      }}
    >
      {children}
    </Paper>
  ),
  a: ({ children, href }) => (
    <Link
      component="a"
      href={href}
      color="primary"
      target="_blank"
      rel="noopener noreferrer"
      sx={{ textDecoration: 'underline' }}
    >
      {children}
    </Link>
  ),
  h1: ({ children }) => (
    <Typography variant="h4" component="h1" sx={{ mb: 2, mt: 1 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 1 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="h6" component="h3" sx={{ mb: 1.5, mt: 1 }}>
      {children}
    </Typography>
  ),
  blockquote: ({ children }) => (
    <Paper
      sx={{
        borderLeft: 4,
        borderColor: 'primary.main',
        pl: 2,
        py: 1,
        mb: 2,
        bgcolor: 'action.hover',
        fontStyle: 'italic'
      }}
    >
      {children}
    </Paper>
  ),
};

interface MarkdownProps {
  children: string;
}

export const Markdown = ({ children }: MarkdownProps) => {
  return <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>;
};