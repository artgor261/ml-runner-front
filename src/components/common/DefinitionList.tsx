import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

export interface DefinitionItem {
  label: string;
  value: ReactNode;
}

/** Compact, label-over-value grid used on detail pages. */
export function DefinitionList({
  items,
  columns = 2,
}: {
  items: DefinitionItem[];
  columns?: number;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: `repeat(${Math.min(columns, 2)}, 1fr)`,
          md: `repeat(${columns}, 1fr)`,
        },
        gap: 2,
      }}
    >
      {items.map((item) => (
        <Stack key={item.label} spacing={0.25}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {item.label}
          </Typography>
          <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>
            {item.value ?? '—'}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}
