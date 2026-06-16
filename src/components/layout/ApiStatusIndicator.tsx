import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { useHealth } from '../../hooks/useHealth';
import { useThemeStore } from '../../store/themeStore';

/** Small dot + label reflecting backend `/health` availability. */
export function ApiStatusIndicator() {
  const { data, isLoading, isError } = useHealth();
  const mode = useThemeStore((s) => s.mode);

  const online = !isError && !isLoading && data != null;
  const label = isLoading ? 'Checking API' : online ? 'API online' : 'API offline';

  const color =
    mode === 'light'
      ? online
        ? '#000'
        : '#999'
      : online
        ? '#3fb950'
        : '#e5534b';

  return (
    <Tooltip title={label}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            bgcolor: color,
            border: mode === 'light' ? '1px solid #000' : 'none',
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {label}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
