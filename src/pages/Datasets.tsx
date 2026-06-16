import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column, type FilterDef } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState, ErrorState } from '../components/common/States';
import { CreateDatasetDialog } from '../components/forms/CreateDatasetDialog';
import { useDatasets, useDeleteDataset } from '../hooks/useDatasets';
import type { DatasetRead } from '../api';
import { formatDateShort, formatList, formatNumber } from '../utils/format';

const SOURCE_FILTER: FilterDef<DatasetRead> = {
  id: 'source',
  label: 'Source',
  getValue: (row) => row.source,
  options: [
    { label: 'MOEX', value: 'moex' },
    { label: 'Google Drive', value: 'gdrive' },
    { label: 'Upload', value: 'upload' },
  ],
};

export function Datasets() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useDatasets();
  const deleteMutation = useDeleteDataset();

  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DatasetRead | null>(null);

  const columns: Column<DatasetRead>[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      value: (r) => r.name,
      render: (r) => <strong>{r.name}</strong>,
    },
    {
      id: 'source',
      label: 'Source',
      sortable: true,
      value: (r) => r.source,
      render: (r) => <Chip label={r.source} size="small" variant="outlined" />,
    },
    {
      id: 'tickers',
      label: 'Tickers',
      value: (r) => r.tickers.join(' '),
      render: (r) => formatList(r.tickers),
    },
    {
      id: 'rows',
      label: 'Rows',
      align: 'right',
      sortable: true,
      value: (r) => r.rows ?? 0,
      render: (r) => formatNumber(r.rows),
    },
    {
      id: 'period',
      label: 'Period',
      value: (r) => r.start ?? '',
      render: (r) =>
        r.start || r.end ? `${formatDateShort(r.start)} → ${formatDateShort(r.end)}` : '—',
    },
    {
      id: 'created_at',
      label: 'Created',
      sortable: true,
      value: (r) => r.created_at,
      render: (r) => formatDateShort(r.created_at),
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      width: 56,
      render: (r) => (
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setToDelete(r);
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Stack>
      <PageHeader
        title="Datasets"
        subtitle="Historical market data registered for training and validation"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New dataset
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          getRowId={(r) => r.id}
          onRowClick={(r) => navigate(`/datasets/${r.id}`)}
          filters={[SOURCE_FILTER]}
          searchPlaceholder="Search datasets…"
          initialSort={{ columnId: 'created_at', direction: 'desc' }}
          emptyMessage="No datasets yet. Create one to get started."
        />
      )}

      <CreateDatasetDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete dataset"
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </Stack>
  );
}
