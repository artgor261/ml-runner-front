import { Chip } from '@mui/material';
import type { RunStatus } from '../../api';
import { useThemeStore } from '../../store/themeStore';

const DARK_COLORS: Record<RunStatus, string> = {
  pending: '#8b96ad',
  running: '#3b6fd4',
  completed: '#3fb950',
  failed: '#e5534b',
  stopped: '#d29922',
};

interface StatusChipProps {
  status: RunStatus;
  size?: 'small' | 'medium';
}

/**
 * Run status badge. In light mode it stays strictly black & white (per the
 * minimalist spec); in dark mode it uses semantic colors for quick scanning.
 */
export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const mode = useThemeStore((s) => s.mode);

  if (mode === 'light') {
    const filled = status === 'running' || status === 'completed';
    return (
      <Chip
        label={status}
        size={size}
        variant={filled ? 'filled' : 'outlined'}
        sx={{
          textTransform: 'capitalize',
          bgcolor: filled ? '#000' : 'transparent',
          color: filled ? '#fff' : '#000',
          borderColor: '#000',
          fontWeight: 500,
        }}
      />
    );
  }

  const color = DARK_COLORS[status];
  return (
    <Chip
      label={status}
      size={size}
      variant="outlined"
      sx={{
        textTransform: 'capitalize',
        color,
        borderColor: color,
        fontWeight: 500,
      }}
    />
  );
}
