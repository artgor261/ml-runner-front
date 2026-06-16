import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { DefinitionList } from '../components/common/DefinitionList';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState, ErrorState } from '../components/common/States';
import { DatasetPreviewTable } from '../components/datasets/DatasetPreviewTable';
import { useDataset, useDeleteDataset } from '../hooks/useDatasets';
import { formatDate, formatNumber } from '../utils/format';

export function DatasetDetails() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useDataset(datasetId);
  const deleteMutation = useDeleteDataset();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/datasets')}
        sx={{ mb: 2 }}
      >
        Datasets
      </Button>

      <PageHeader
        title={data.name}
        subtitle={data.description ?? undefined}
        actions={
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </Button>
        }
      />

      <Stack spacing={3}>
        <SectionCard title="Overview">
          <DefinitionList
            columns={3}
            items={[
              { label: 'Source', value: <Chip label={data.source} size="small" variant="outlined" /> },
              { label: 'Rows', value: formatNumber(data.rows) },
              { label: 'Interval', value: data.interval ?? '—' },
              { label: 'Start', value: data.start ?? '—' },
              { label: 'End', value: data.end ?? '—' },
              { label: 'Created', value: formatDate(data.created_at) },
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

        <SectionCard title="Data" disablePadding>
          <DatasetPreviewTable dataset={data} />
        </SectionCard>

        {Object.keys(data.meta ?? {}).length > 0 && (
          <SectionCard title="Metadata">
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
              {JSON.stringify(data.meta, null, 2)}
            </Box>
          </SectionCard>
        )}
      </Stack>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete dataset"
        message={`Delete "${data.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          deleteMutation.mutate(data.id, { onSuccess: () => navigate('/datasets') })
        }
      />
    </Box>
  );
}
