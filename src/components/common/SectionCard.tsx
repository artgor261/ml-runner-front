import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

interface SectionCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  disablePadding?: boolean;
}

export function SectionCard({ title, action, children, disablePadding }: SectionCardProps) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      {(title || action) && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          {title && <Typography variant="h6">{title}</Typography>}
          {action}
        </Stack>
      )}
      <Box sx={{ p: disablePadding ? 0 : 2 }}>{children}</Box>
    </Paper>
  );
}
