import { useNavigate } from 'react-router-dom';
import { Box, Paper, Stack, Typography } from '@mui/material';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import ScienceIcon from '@mui/icons-material/ScienceOutlined';
import LayersIcon from '@mui/icons-material/LayersOutlined';
import ModelTrainingIcon from '@mui/icons-material/ModelTrainingOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusChip } from '../components/common/StatusChip';
import { LoadingState } from '../components/common/States';
import { useDatasets } from '../hooks/useDatasets';
import { useExperiments } from '../hooks/useExperiments';
import { useModels } from '../hooks/useModels';
import { useTrainingRuns } from '../hooks/useTraining';
import { useHealth } from '../hooks/useHealth';
import { formatDate } from '../utils/format';
import type { ReactNode } from 'react';

function StatCard({
  icon,
  label,
  value,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  onClick: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2.5,
        cursor: 'pointer',
        transition: 'border-color 0.18s ease',
        '&:hover': { borderColor: 'text.primary' },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
        <Box>
          <Typography variant="h4" sx={{ lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const datasets = useDatasets();
  const experiments = useExperiments();
  const models = useModels();
  const activeRuns = useTrainingRuns({ active: true });
  const health = useHealth();

  const recentExperiments = [...(experiments.data ?? [])]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 5);

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="ML model lifecycle at a glance" />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          icon={<StorageIcon />}
          label="Datasets"
          value={datasets.data?.length ?? '—'}
          onClick={() => navigate('/datasets')}
        />
        <StatCard
          icon={<ScienceIcon />}
          label="Experiments"
          value={experiments.data?.length ?? '—'}
          onClick={() => navigate('/experiments')}
        />
        <StatCard
          icon={<LayersIcon />}
          label="Models"
          value={models.data?.length ?? '—'}
          onClick={() => navigate('/models')}
        />
        <StatCard
          icon={<ModelTrainingIcon />}
          label="Active trainings"
          value={activeRuns.data?.length ?? '—'}
          onClick={() => navigate('/training')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
        }}
      >
        <SectionCard title="Recent experiments">
          {experiments.isLoading ? (
            <LoadingState />
          ) : recentExperiments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No experiments yet.
            </Typography>
          ) : (
            <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
              {recentExperiments.map((exp) => (
                <Stack
                  key={exp.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    py: 1.25,
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' },
                  }}
                  onClick={() => navigate(`/experiments/${exp.id}`)}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {exp.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(exp.created_at)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {exp.run_count} run{exp.run_count === 1 ? '' : 's'}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </SectionCard>

        <Stack spacing={3}>
          <SectionCard title="API status">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: health.isError ? 'error.main' : 'success.main',
                }}
              />
              <Typography variant="body2">
                {health.isLoading
                  ? 'Checking…'
                  : health.isError
                    ? 'Backend unavailable'
                    : 'Operational'}
              </Typography>
            </Stack>
          </SectionCard>

          <SectionCard title="Active trainings">
            {activeRuns.isLoading ? (
              <LoadingState />
            ) : (activeRuns.data?.length ?? 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No active training runs.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {activeRuns.data!.map((run) => (
                  <Stack
                    key={run.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={() => navigate(`/runs/${run.id}`)}
                  >
                    <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                      {run.name}
                    </Typography>
                    <StatusChip status={run.status} />
                  </Stack>
                ))}
              </Stack>
            )}
          </SectionCard>
        </Stack>
      </Box>
    </Box>
  );
}
