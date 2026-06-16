import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StopCircleIcon from '@mui/icons-material/StopCircleOutlined';
import FactCheckIcon from '@mui/icons-material/FactCheckOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { DefinitionList } from '../components/common/DefinitionList';
import { StatusChip } from '../components/common/StatusChip';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState, ErrorState } from '../components/common/States';
import { LossChart } from '../components/charts/LossChart';
import { useRunDetail } from '../hooks/useExperiments';
import { useCancelRun } from '../hooks/useTraining';
import { formatDate, formatNumber, metricsToEntries } from '../utils/format';

const ACTIVE = ['pending', 'running'];

export function RunDetails() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useRunDetail(runId);
  const cancelMutation = useCancelRun();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState error={error} onRetry={refetch} />;

  const isActive = ACTIVE.includes(data.status);
  const progress =
    data.total_epochs && data.total_epochs > 0
      ? Math.min(100, ((data.current_epoch ?? 0) / data.total_epochs) * 100)
      : null;

  const latest = data.history.at(-1);
  const metricsEntries = metricsToEntries(data.metrics);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/training')} sx={{ mb: 2 }}>
        Training Runs
      </Button>

      <PageHeader
        title={data.name}
        subtitle={data.description ?? undefined}
        actions={
          <Stack direction="row" spacing={1}>
            {data.model_path && (
              <Button
                variant="outlined"
                startIcon={<FactCheckIcon />}
                onClick={() =>
                  navigate(
                    `/validation?model_path=${encodeURIComponent(data.model_path!)}` +
                      `&tickers=${encodeURIComponent(data.tickers.join(','))}`,
                  )
                }
              >
                Validate
              </Button>
            )}
            {isActive && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopCircleIcon />}
                onClick={() => setConfirmCancel(true)}
              >
                Cancel
              </Button>
            )}
          </Stack>
        }
      />

      <Stack spacing={3}>
        <SectionCard title="Status">
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
              <StatusChip status={data.status} size="medium" />
              <Chip label={data.executor} size="small" variant="outlined" />
              <Typography variant="body2" color="text.secondary">
                Epoch {data.current_epoch ?? 0}
                {data.total_epochs ? ` / ${data.total_epochs}` : ''}
              </Typography>
              {latest?.train_loss != null && (
                <Typography variant="body2" color="text.secondary">
                  train_loss = {formatNumber(latest.train_loss)}
                </Typography>
              )}
              {latest?.val_loss != null && (
                <Typography variant="body2" color="text.secondary">
                  val_loss = {formatNumber(latest.val_loss)}
                </Typography>
              )}
            </Stack>

            {isActive && (
              <Box>
                <LinearProgress
                  variant={progress == null ? 'indeterminate' : 'determinate'}
                  value={progress ?? undefined}
                />
                {progress != null && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {progress.toFixed(0)}%
                  </Typography>
                )}
              </Box>
            )}

            {data.error && <Alert severity="error">{data.error}</Alert>}
          </Stack>
        </SectionCard>

        <SectionCard title="Training curve">
          <LossChart history={data.history} />
        </SectionCard>

        {metricsEntries.length > 0 && (
          <SectionCard title="Final metrics">
            <DefinitionList
              columns={4}
              items={metricsEntries.map(([k, v]) => ({ label: k, value: v }))}
            />
          </SectionCard>
        )}

        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}
        >
          <SectionCard title="Configuration">
            <DefinitionList
              columns={2}
              items={[
                { label: 'Executor', value: data.executor },
                { label: 'Dataset ID', value: data.dataset_id ?? '—' },
                {
                  label: 'Tickers',
                  value:
                    data.tickers.length > 0 ? (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {data.tickers.map((t) => (
                          <Chip key={t} label={t} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    ) : (
                      '—'
                    ),
                },
                { label: 'Feature columns', value: data.feature_cols.join(', ') || '—' },
                { label: 'Created', value: formatDate(data.created_at) },
                { label: 'Started', value: formatDate(data.started_at) },
                { label: 'Finished', value: formatDate(data.finished_at) },
                { label: 'Run ID', value: data.id },
              ]}
            />
          </SectionCard>

          <SectionCard title="Hyperparameters">
            {Object.keys(data.params ?? {}).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No parameters recorded.
              </Typography>
            ) : (
              <DefinitionList
                columns={2}
                items={Object.entries(data.params).map(([k, v]) => ({
                  label: k,
                  value: typeof v === 'object' ? JSON.stringify(v) : String(v),
                }))}
              />
            )}
          </SectionCard>
        </Box>

        {(data.run_dir || data.model_path) && (
          <SectionCard title="Artifacts">
            <DefinitionList
              columns={1}
              items={[
                { label: 'Run directory', value: data.run_dir ?? '—' },
                { label: 'Model path', value: data.model_path ?? '—' },
              ]}
            />
          </SectionCard>
        )}
      </Stack>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel run"
        message={`Stop training run "${data.name}"?`}
        confirmLabel="Stop run"
        loading={cancelMutation.isPending}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() =>
          cancelMutation.mutate(data.id, { onSuccess: () => setConfirmCancel(false) })
        }
      />
    </Box>
  );
}
