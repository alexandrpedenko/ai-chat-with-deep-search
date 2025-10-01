'use client';

import { AppBar, Toolbar, Typography } from '@mui/material';
import { AuthButton } from "./auth-button";

export function Header() {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        width: `calc(100% - ${280}px)`, 
        ml: `${280}px`,
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
  );
}