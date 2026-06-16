import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RunMetricPoint } from '../../api';

interface LossChartProps {
  history: RunMetricPoint[];
  height?: number;
}

/** Training curve: X = Epoch, Y = Loss, with Train and Validation lines. */
export function LossChart({ history, height = 320 }: LossChartProps) {
  const theme = useTheme();

  const data = useMemo(
    () =>
      [...history]
        .sort((a, b) => a.epoch - b.epoch)
        .map((p) => ({
          epoch: p.epoch,
          train_loss: p.train_loss,
          val_loss: p.val_loss,
        })),
    [history],
  );

  if (data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No training history yet
        </Typography>
      </Box>
    );
  }

  const trainColor = theme.palette.mode === 'light' ? '#000000' : '#3b6fd4';
  const valColor = theme.palette.mode === 'light' ? '#999999' : '#3fb950';
  const gridColor = theme.palette.divider;
  const axisColor = theme.palette.text.secondary;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="epoch"
          stroke={axisColor}
          tick={{ fontSize: 12 }}
          label={{ value: 'Epoch', position: 'insideBottom', offset: -2, fontSize: 12, fill: axisColor }}
        />
        <YAxis
          stroke={axisColor}
          tick={{ fontSize: 12 }}
          width={64}
          label={{ value: 'Loss', angle: -90, position: 'insideLeft', fontSize: 12, fill: axisColor }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="train_loss"
          name="Train Loss"
          stroke={trainColor}
          strokeWidth={2}
          dot={false}
          connectNulls
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="val_loss"
          name="Validation Loss"
          stroke={valColor}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
