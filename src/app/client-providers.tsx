'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from 'next-auth/react';
import EmotionRegistry from '~/components/emotion-registry';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  // Disable CSS variables to prevent hydration mismatches
  cssVariables: false,
  // Add additional configuration for consistent styling
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          // Disable CSS custom properties that cause hydration issues
          WebkitFontSmoothing: 'auto',
        },
      },
    },
  },
});

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {

  return (
    <EmotionRegistry>
      <SessionProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </EmotionRegistry>
  );
}