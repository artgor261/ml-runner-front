import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        404
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This page could not be found.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Back to dashboard
      </Button>
    </Box>
  );
}
