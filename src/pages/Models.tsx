import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState, ErrorState } from '../components/common/States';
import { AddModelDialog } from '../components/forms/AddModelDialog';
import { useDeleteModel, useModels } from '../hooks/useModels';
import type { ModelRead } from '../api';
import { formatDateShort, formatList, formatNumber } from '../utils/format';

export function Models() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useModels();
  const deleteMutation = useDeleteModel();
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ModelRead | null>(null);

  const columns: Column<ModelRead>[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      value: (r) => r.name,
      render: (r) => <strong>{r.name}</strong>,
    },
    {
      id: 'architecture',
      label: 'Architecture',
      sortable: true,
      value: (r) => r.architecture ?? '',
      render: (r) => (r.architecture ? <Chip label={r.architecture} size="small" variant="outlined" /> : '—'),
    },
    {
      id: 'tickers',
      label: 'Tickers',
      value: (r) => r.tickers.join(' '),
      render: (r) => formatList(r.tickers, 3),
    },
    {
      id: 'val_loss',
      label: 'Val loss',
      align: 'right',
      sortable: true,
      value: (r) => {
        const v = r.metrics?.val_loss;
        return typeof v === 'number' ? v : Number.POSITIVE_INFINITY;
      },
      render: (r) => formatNumber(r.metrics?.val_loss),
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
        title="Models"
        subtitle="Registered model artifacts"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            Add model
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
          onRowClick={(r) => navigate(`/models/${r.id}`)}
          searchPlaceholder="Search models…"
          initialSort={{ columnId: 'created_at', direction: 'desc' }}
          emptyMessage="No models registered yet."
        />
      )}

      <AddModelDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete model"
        message={`Delete "${toDelete?.name}" from the registry?`}
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
