'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SessionProvider } from 'next-auth/react';
import { useMemo } from 'react';
import EmotionRegistry from '~/components/emotion-registry';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  // Memoize theme to prevent unnecessary re-creations
  const darkTheme = useMemo(() => createTheme({
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
  }), []);

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