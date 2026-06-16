import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { LoadingState, ErrorState } from '../components/common/States';
import { useCreateExperiment, useExperiments } from '../hooks/useExperiments';
import type { ExperimentRead } from '../api';
import { formatDate, truncate } from '../utils/format';

interface ExperimentForm {
  name: string;
  description: string;
}

function CreateExperimentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mutation = useCreateExperiment();
  const { control, handleSubmit, reset } = useForm<ExperimentForm>({
    defaultValues: { name: '', description: '' },
  });

  const close = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit((values) => {
    mutation.mutate(
      { name: values.name, description: values.description || null },
      { onSuccess: close },
    );
  });

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>New experiment</DialogTitle>
      <DialogContent>
        <Stack spacing={2} component="form" onSubmit={submit} sx={{ mt: 1 }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Experiment name"
                fullWidth
                autoFocus
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Description (optional)" fullWidth multiline minRows={2} />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button onClick={() => submit()} variant="contained" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function Experiments() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useExperiments();
  const [createOpen, setCreateOpen] = useState(false);

  const columns: Column<ExperimentRead>[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      value: (r) => r.name,
      render: (r) => <strong>{r.name}</strong>,
    },
    {
      id: 'description',
      label: 'Description',
      value: (r) => r.description ?? '',
      render: (r) => (r.description ? truncate(r.description, 60) : '—'),
    },
    {
      id: 'run_count',
      label: 'Runs',
      align: 'right',
      sortable: true,
      value: (r) => r.run_count,
    },
    {
      id: 'created_at',
      label: 'Created',
      sortable: true,
      value: (r) => r.created_at,
      render: (r) => formatDate(r.created_at),
    },
  ];

  return (
    <Stack>
      <PageHeader
        title="Experiments"
        subtitle="Group related training runs (MLflow-style)"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New experiment
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
          onRowClick={(r) => navigate(`/experiments/${r.id}`)}
          searchPlaceholder="Search experiments…"
          initialSort={{ columnId: 'created_at', direction: 'desc' }}
          emptyMessage="No experiments yet."
        />
      )}

      <CreateExperimentDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Stack>
  );
}
