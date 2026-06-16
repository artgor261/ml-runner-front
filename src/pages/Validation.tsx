import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { DefinitionList } from '../components/common/DefinitionList';
import { EmptyState, LoadingState } from '../components/common/States';
import { PredictionWindowViewer } from '../components/charts/PredictionWindowViewer';
import { useModels } from '../hooks/useModels';
import { useDatasets } from '../hooks/useDatasets';
import { useRunValidation } from '../hooks/useValidation';
import type { ValidationRequest } from '../api';
import { formatNumber, parseTickers } from '../utils/format';

interface ValidationForm {
  modelSource: 'registered' | 'path';
  model_id: string;
  model_path: string;
  datasetSource: 'registered' | 'path';
  dataset_id: string;
  parquet_dir: string;
  tickers: string;
  feature_cols: string;
  include_predictions: boolean;
  include_backtest: boolean;
  backtest_threshold: string;
}

export function Validation() {
  const [searchParams] = useSearchParams();
  const models = useModels();
  const datasets = useDatasets();
  const validation = useRunValidation();
  const [activeTicker, setActiveTicker] = useState(0);

  const { control, handleSubmit, watch, setValue } = useForm<ValidationForm>({
    defaultValues: {
      modelSource: 'registered',
      model_id: '',
      model_path: '',
      datasetSource: 'registered',
      dataset_id: '',
      parquet_dir: '',
      tickers: '',
      feature_cols: '',
      include_predictions: true,
      include_backtest: false,
      backtest_threshold: '0.0004',
    },
  });

  // Deep-link prefill from Run / Model detail pages.
  useEffect(() => {
    const modelId = searchParams.get('model_id');
    const modelPath = searchParams.get('model_path');
    const tickers = searchParams.get('tickers');
    if (modelId) {
      setValue('modelSource', 'registered');
      setValue('model_id', modelId);
    } else if (modelPath) {
      setValue('modelSource', 'path');
      setValue('model_path', modelPath);
    }
    if (tickers) setValue('tickers', parseTickers(tickers).join(', '));
  }, [searchParams, setValue]);

  const modelSource = watch('modelSource');
  const datasetSource = watch('datasetSource');
  const includeBacktest = watch('include_backtest');

  const submit = handleSubmit((values) => {
    const payload: ValidationRequest = {
      tickers: parseTickers(values.tickers),
      feature_cols: values.feature_cols ? parseTickers(values.feature_cols) : null,
      include_predictions: values.include_predictions,
      include_backtest: values.include_backtest,
      backtest_threshold: Number(values.backtest_threshold) || undefined,
      model_id: values.modelSource === 'registered' ? values.model_id || null : null,
      model_path: values.modelSource === 'path' ? values.model_path || null : null,
      dataset_id: values.datasetSource === 'registered' ? values.dataset_id || null : null,
      parquet_dir: values.datasetSource === 'path' ? values.parquet_dir || null : null,
    };
    setActiveTicker(0);
    validation.mutate(payload);
  });

  const result = validation.data;
  const predictionTickers = useMemo(
    () => (result?.predictions ? Object.keys(result.predictions) : []),
    [result],
  );
  const metricsEntries = useMemo(
    () =>
      result
        ? Object.entries(result.metrics).map(
            ([k, v]) => [k, formatNumber(v)] as [string, string],
          )
        : [],
    [result],
  );

  return (
    <Box>
      <PageHeader title="Validation" subtitle="Evaluate a model on test data" />

      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '360px 1fr' }, gap: 3 }}
      >
        {/* ---- Form ---- */}
        <SectionCard title="Configuration">
          <Stack spacing={2.5} component="form" onSubmit={submit}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Model source
              </Typography>
              <Controller
                name="modelSource"
                control={control}
                render={({ field }) => (
                  <Tabs
                    value={field.value}
                    onChange={(_, v) => field.onChange(v)}
                    sx={{ minHeight: 36, mb: 1 }}
                  >
                    <Tab label="Registered" value="registered" sx={{ minHeight: 36 }} />
                    <Tab label="By path" value="path" sx={{ minHeight: 36 }} />
                  </Tabs>
                )}
              />
              {modelSource === 'registered' ? (
                <Controller
                  name="model_id"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Model" fullWidth size="small">
                      <MenuItem value="">Select model…</MenuItem>
                      {models.data?.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              ) : (
                <Controller
                  name="model_path"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Path to .pt file" fullWidth size="small" />
                  )}
                />
              )}
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Data source
              </Typography>
              <Controller
                name="datasetSource"
                control={control}
                render={({ field }) => (
                  <Tabs
                    value={field.value}
                    onChange={(_, v) => field.onChange(v)}
                    sx={{ minHeight: 36, mb: 1 }}
                  >
                    <Tab label="Dataset" value="registered" sx={{ minHeight: 36 }} />
                    <Tab label="Parquet dir" value="path" sx={{ minHeight: 36 }} />
                  </Tabs>
                )}
              />
              {datasetSource === 'registered' ? (
                <Controller
                  name="dataset_id"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Dataset" fullWidth size="small">
                      <MenuItem value="">Select dataset…</MenuItem>
                      {datasets.data?.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              ) : (
                <Controller
                  name="parquet_dir"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Parquet directory" fullWidth size="small" />
                  )}
                />
              )}
            </Box>

            <Controller
              name="tickers"
              control={control}
              rules={{ required: 'At least one ticker is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Tickers"
                  placeholder="SBER, GAZP"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="feature_cols"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Feature columns (optional)"
                  fullWidth
                  size="small"
                />
              )}
            />

            <Divider />

            <Controller
              name="include_predictions"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={field.onChange} />}
                  label="Include predictions"
                />
              )}
            />
            <Controller
              name="include_backtest"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={field.onChange} />}
                  label="Run backtest"
                />
              )}
            />
            {includeBacktest && (
              <Controller
                name="backtest_threshold"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Backtest threshold"
                    type="number"
                    inputProps={{ step: 'any' }}
                    fullWidth
                    size="small"
                  />
                )}
              />
            )}

            <Button
              type="submit"
              variant="contained"
              startIcon={<PlayArrowIcon />}
              disabled={validation.isPending}
            >
              {validation.isPending ? 'Running…' : 'Run validation'}
            </Button>
          </Stack>
        </SectionCard>

        {/* ---- Results ---- */}
        <Stack spacing={3}>
          {validation.isPending ? (
            <SectionCard>
              <LoadingState label="Running validation…" />
            </SectionCard>
          ) : !result ? (
            <SectionCard>
              <EmptyState
                title="No results yet"
                description="Configure a model and dataset, then run validation."
              />
            </SectionCard>
          ) : (
            <>
              <SectionCard title="Metrics">
                <DefinitionList
                  columns={4}
                  items={metricsEntries.map(([k, v]) => ({ label: k, value: v }))}
                />
              </SectionCard>

              {predictionTickers.length > 0 && (
                <SectionCard title="Predictions" disablePadding>
                  <Tabs
                    value={Math.min(activeTicker, predictionTickers.length - 1)}
                    onChange={(_, v) => setActiveTicker(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
                  >
                    {predictionTickers.map((t) => (
                      <Tab key={t} label={t} />
                    ))}
                  </Tabs>
                  <Box sx={{ p: 2 }}>
                    {(() => {
                      const ticker =
                        predictionTickers[Math.min(activeTicker, predictionTickers.length - 1)];
                      const pred = result.predictions?.[ticker];
                      if (!pred) return null;
                      return (
                        <PredictionWindowViewer ticker={ticker} prediction={pred} />
                      );
                    })()}
                  </Box>
                </SectionCard>
              )}

              {predictionTickers.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No predictions returned.
                </Typography>
              )}

              {result.backtest && (
                <SectionCard title="Backtest">
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      fontSize: 12,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(result.backtest, null, 2)}
                  </Box>
                </SectionCard>
              )}
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
