'use client';

import { 
  Button,
  Typography,
  Box
} from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import { signIn, signOut, useSession } from 'next-auth/react';

export const AuthButton = () => {
  const { data: session, status } = useSession();

  if (status === "loading" || !session) {
    return (
      <Button disabled>
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {session.user?.name || session.user?.email}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => signOut()}
          size="small"
        >
          Sign Out
        </Button>
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      startIcon={<GitHubIcon />}
      onClick={() => signIn('github')}
      sx={{ 
        textTransform: 'none',
        borderRadius: 2
      }}
    >
      Sign in with GitHub
    </Button>
  );
};