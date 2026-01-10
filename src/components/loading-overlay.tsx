import { Box, CircularProgress } from '@mui/material';

export const LoadingOverlay = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(18, 18, 18, 0.8)',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <CircularProgress />
    </Box>
  );
};
