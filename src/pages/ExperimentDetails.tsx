import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ModelTrainingIcon from '@mui/icons-material/ModelTrainingOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { DefinitionList } from '../components/common/DefinitionList';
import { RunsTable } from '../components/common/RunsTable';
import { StatusChip } from '../components/common/StatusChip';
import { LoadingState, ErrorState } from '../components/common/States';
import { useExperiment } from '../hooks/useExperiments';
import type { RunRead } from '../api';
import { formatDate, formatNumber } from '../utils/format';

function bestRun(runs: RunRead[]): RunRead | null {
  const completed = runs.filter(
    (r) => r.status === 'completed' && typeof r.metrics?.val_loss === 'number',
  );
  if (completed.length === 0) return null;
  return completed.reduce((best, r) =>
    (r.metrics!.val_loss as number) < (best.metrics!.val_loss as number) ? r : best,
  );
}

export function ExperimentDetails() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useExperiment(experimentId);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState error={error} onRetry={refetch} />;

  const best = bestRun(data.runs);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/experiments')} sx={{ mb: 2 }}>
        Experiments
      </Button>

      <PageHeader
        title={data.name}
        subtitle={data.description ?? undefined}
        actions={
          <Button
            variant="contained"
            startIcon={<ModelTrainingIcon />}
            onClick={() => navigate(`/training?experiment=${encodeURIComponent(data.name)}`)}
          >
            New training run
          </Button>
        }
      />

      <Stack spacing={3}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3,
          }}
        >
          <SectionCard title="Overview">
            <DefinitionList
              columns={2}
              items={[
                { label: 'Runs', value: data.run_count },
                { label: 'Created', value: formatDate(data.created_at) },
                { label: 'ID', value: data.id },
              ]}
            />
          </SectionCard>

          <SectionCard title="Best result">
            {best ? (
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={() => navigate(`/runs/${best.id}`)}
                  >
                    {best.name}
                  </Typography>
                  <StatusChip status={best.status} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  val_loss = {formatNumber(best.metrics?.val_loss)}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No completed runs with metrics yet.
              </Typography>
            )}
          </SectionCard>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Runs
          </Typography>
          <RunsTable runs={data.runs} emptyMessage="No runs in this experiment yet." />
        </Box>
      </Stack>
    </Box>
  );
}
