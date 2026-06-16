import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FactCheckIcon from '@mui/icons-material/FactCheckOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { DefinitionList } from '../components/common/DefinitionList';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState, ErrorState } from '../components/common/States';
import { useDeleteModel, useModel } from '../hooks/useModels';
import { formatDate, metricsToEntries } from '../utils/format';

export function ModelDetails() {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useModel(modelId);
  const deleteMutation = useDeleteModel();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState error={error} onRetry={refetch} />;

  const metricsEntries = metricsToEntries(data.metrics);
  const paramEntries = Object.entries(data.params ?? {});

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/models')} sx={{ mb: 2 }}>
        Models
      </Button>

      <PageHeader
        title={data.name}
        subtitle={data.description ?? undefined}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FactCheckIcon />}
              onClick={() =>
                navigate(
                  `/validation?model_id=${data.id}&tickers=${encodeURIComponent(data.tickers.join(','))}`,
                )
              }
            >
              Validate
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </Button>
          </Stack>
        }
      />

      <Stack spacing={3}>
        <SectionCard title="Overview">
          <DefinitionList
            columns={3}
            items={[
              { label: 'Framework', value: data.framework },
              { label: 'Architecture', value: data.architecture ?? '—' },
              { label: 'Created', value: formatDate(data.created_at) },
              {
                label: 'Source run',
                value: data.run_id ? (
                  <Typography
                    variant="body2"
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={() => navigate(`/runs/${data.run_id}`)}
                  >
                    {data.run_id}
                  </Typography>
                ) : (
                  '—'
                ),
              },
              { label: 'Path', value: data.path },
              { label: 'ID', value: data.id },
            ]}
          />
        </SectionCard>

        <SectionCard title={`Tickers (${data.tickers.length})`}>
          {data.tickers.length === 0 ? (
            'No tickers'
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {data.tickers.map((t) => (
                <Chip key={t} label={t} size="small" variant="outlined" />
              ))}
            </Stack>
          )}
        </SectionCard>

        {data.feature_cols.length > 0 && (
          <SectionCard title="Feature columns">
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {data.feature_cols.map((f) => (
                <Chip key={f} label={f} size="small" variant="outlined" />
              ))}
            </Stack>
          </SectionCard>
        )}

        {metricsEntries.length > 0 && (
          <SectionCard title="Metrics">
            <DefinitionList
              columns={4}
              items={metricsEntries.map(([k, v]) => ({ label: k, value: v }))}
            />
          </SectionCard>
        )}

        {paramEntries.length > 0 && (
          <SectionCard title="Training parameters">
            <DefinitionList
              columns={3}
              items={paramEntries.map(([k, v]) => ({
                label: k,
                value: typeof v === 'object' ? JSON.stringify(v) : String(v),
              }))}
            />
          </SectionCard>
        )}
      </Stack>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete model"
        message={`Delete "${data.name}" from the registry?`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id, { onSuccess: () => navigate('/models') })}
      />
    </Box>
  );
}
