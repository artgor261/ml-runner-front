import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, IconButton, Stack, Tooltip as MuiTooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import {
  CartesianGrid,
  Legend,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  ResponsiveContainer,
} from 'recharts';
import type { TickerPrediction } from '../../api';

const SEGMENT_SIZE = 2000;
const STEP = 5;

interface PredictionWindowViewerProps {
  ticker: string;
  prediction: TickerPrediction;
  height?: number;
}

/**
 * Windowed time-series scatter viewer for validation predictions.
 *
 * Per ui_requirements.md: the series is split into 2000-point segments; within
 * each segment only every 5th point is plotted (actual[start:end:5] /
 * predicted[start:end:5]). The user steps between segments instead of scrolling
 * one huge chart — each segment is a static snapshot.
 */
export function PredictionWindowViewer({
  ticker,
  prediction,
  height = 360,
}: PredictionWindowViewerProps) {
  const theme = useTheme();
  const [segment, setSegment] = useState(0);

  const total = Math.min(
    prediction.actual.length,
    prediction.predicted.length,
    prediction.index.length || Number.MAX_SAFE_INTEGER,
  );
  const segmentCount = Math.max(1, Math.ceil(total / SEGMENT_SIZE));
  const current = Math.min(segment, segmentCount - 1);

  const { actualPoints, predictedPoints } = useMemo(() => {
    const start = current * SEGMENT_SIZE;
    const end = Math.min(start + SEGMENT_SIZE, total);
    const actual: Array<{ x: number; y: number }> = [];
    const predicted: Array<{ x: number; y: number }> = [];
    for (let i = start; i < end; i += STEP) {
      const x = prediction.index[i] ?? i;
      actual.push({ x, y: prediction.actual[i] });
      predicted.push({ x, y: prediction.predicted[i] });
    }
    return { actualPoints: actual, predictedPoints: predicted };
  }, [current, total, prediction]);

  const actualColor = theme.palette.mode === 'light' ? '#000000' : '#3b6fd4';
  const predictedColor = theme.palette.mode === 'light' ? '#9e9e9e' : '#e0823d';
  const gridColor = theme.palette.divider;
  const axisColor = theme.palette.text.secondary;

  const rangeStart = current * SEGMENT_SIZE;
  const rangeEnd = Math.min(rangeStart + SEGMENT_SIZE, total);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {ticker}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Points {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of{' '}
            {total.toLocaleString()} · every {STEP}th point
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <MuiTooltip title="First segment">
            <span>
              <IconButton
                size="small"
                onClick={() => setSegment(0)}
                disabled={current === 0}
              >
                <FirstPageIcon fontSize="small" />
              </IconButton>
            </span>
          </MuiTooltip>
          <MuiTooltip title="Previous segment">
            <span>
              <IconButton
                size="small"
                onClick={() => setSegment((s) => Math.max(0, s - 1))}
                disabled={current === 0}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </MuiTooltip>
          <Typography variant="body2" sx={{ minWidth: 92, textAlign: 'center' }}>
            Segment {current + 1} / {segmentCount}
          </Typography>
          <MuiTooltip title="Next segment">
            <span>
              <IconButton
                size="small"
                onClick={() => setSegment((s) => Math.min(segmentCount - 1, s + 1))}
                disabled={current >= segmentCount - 1}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </span>
          </MuiTooltip>
          <MuiTooltip title="Last segment">
            <span>
              <IconButton
                size="small"
                onClick={() => setSegment(segmentCount - 1)}
                disabled={current >= segmentCount - 1}
              >
                <LastPageIcon fontSize="small" />
              </IconButton>
            </span>
          </MuiTooltip>
        </Stack>
      </Stack>

      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Index"
            stroke={axisColor}
            tick={{ fontSize: 12 }}
            domain={['dataMin', 'dataMax']}
            label={{
              value: 'Time index',
              position: 'insideBottom',
              offset: -8,
              fontSize: 12,
              fill: axisColor,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Value"
            stroke={axisColor}
            tick={{ fontSize: 12 }}
            width={64}
            domain={['auto', 'auto']}
          />
          <ZAxis range={[24, 24]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Scatter
            name="Actual"
            data={actualPoints}
            fill={actualColor}
            isAnimationActive={false}
          />
          <Scatter
            name="Predicted"
            data={predictedPoints}
            fill={predictedColor}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
}
