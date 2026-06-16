import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useStartTraining, useStartTrainingFromFile } from '../../hooks/useTraining';
import { useDatasets } from '../../hooks/useDatasets';
import type { Executor, Hyperparams } from '../../api';
import { parseTickers } from '../../utils/format';

interface StartTrainingDialogProps {
  open: boolean;
  onClose: () => void;
  defaultExperiment?: string;
}

interface TrainingForm {
  experiment_name: string;
  run_name: string;
  description: string;
  dataset_id: string;
  tickers: string;
  feature_cols: string;
  executor: Executor;
  input_chunk_length: string;
  output_chunk_length: string;
  kernel_size: string;
  num_filters: string;
  dilation_base: string;
  num_layers: string;
  lr: string;
  batch_size: string;
  n_epochs: string;
  loss: string;
  device: string;
}

const LOSS_OPTIONS = ['', 'mse', 'l1', 'huber', 'smoothl1'];
const DEVICE_OPTIONS = ['', 'cpu', 'gpu'];

const HYPERPARAM_FIELDS: Array<{ name: keyof TrainingForm; label: string }> = [
  { name: 'input_chunk_length', label: 'input_chunk_length' },
  { name: 'output_chunk_length', label: 'output_chunk_length' },
  { name: 'kernel_size', label: 'kernel_size' },
  { name: 'num_filters', label: 'num_filters' },
  { name: 'dilation_base', label: 'dilation_base' },
  { name: 'num_layers', label: 'num_layers' },
  { name: 'batch_size', label: 'batch_size' },
  { name: 'n_epochs', label: 'n_epochs' },
];

function numOrNull(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function StartTrainingDialog({
  open,
  onClose,
  defaultExperiment,
}: StartTrainingDialogProps) {
  const [tab, setTab] = useState<'form' | 'file'>('form');
  const [file, setFile] = useState<File | null>(null);

  const datasets = useDatasets();
  const startMutation = useStartTraining();
  const fileMutation = useStartTrainingFromFile();

  const { control, handleSubmit, reset, setValue, watch } = useForm<TrainingForm>({
    defaultValues: {
      experiment_name: defaultExperiment ?? '',
      run_name: '',
      description: '',
      dataset_id: '',
      tickers: '',
      feature_cols: '',
      executor: 'local',
      input_chunk_length: '',
      output_chunk_length: '',
      kernel_size: '',
      num_filters: '',
      dilation_base: '',
      num_layers: '',
      lr: '',
      batch_size: '',
      n_epochs: '',
      loss: '',
      device: '',
    },
  });

  useEffect(() => {
    if (open && defaultExperiment) setValue('experiment_name', defaultExperiment);
  }, [open, defaultExperiment, setValue]);

  const selectedDatasetId = watch('dataset_id');

  // Prefill tickers from the chosen dataset when empty.
  useEffect(() => {
    if (!selectedDatasetId) return;
    const ds = datasets.data?.find((d) => d.id === selectedDatasetId);
    if (ds && ds.tickers.length > 0) {
      setValue('tickers', ds.tickers.join(', '), { shouldValidate: true });
    }
  }, [selectedDatasetId, datasets.data, setValue]);

  const loading = startMutation.isPending || fileMutation.isPending;

  const close = () => {
    reset();
    setFile(null);
    setTab('form');
    onClose();
  };

  const submitForm = handleSubmit((values) => {
    const params: Hyperparams = {
      input_chunk_length: numOrNull(values.input_chunk_length),
      output_chunk_length: numOrNull(values.output_chunk_length),
      kernel_size: numOrNull(values.kernel_size),
      num_filters: numOrNull(values.num_filters),
      dilation_base: numOrNull(values.dilation_base),
      num_layers: numOrNull(values.num_layers),
      lr: numOrNull(values.lr),
      batch_size: numOrNull(values.batch_size),
      n_epochs: numOrNull(values.n_epochs),
      loss: values.loss || null,
      device: values.device || null,
    };

    startMutation.mutate(
      {
        experiment_name: values.experiment_name,
        run_name: values.run_name || null,
        description: values.description || null,
        dataset_id: values.dataset_id || null,
        tickers: parseTickers(values.tickers),
        feature_cols: values.feature_cols ? parseTickers(values.feature_cols) : null,
        params,
        executor: values.executor,
      },
      { onSuccess: close },
    );
  });

  const submitFile = () => {
    if (!file) return;
    fileMutation.mutate(file, { onSuccess: close });
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="md" fullWidth>
      <DialogTitle>Start training</DialogTitle>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Configure" value="form" />
        <Tab label="From JSON file" value="file" />
      </Tabs>

      <DialogContent>
        {tab === 'form' ? (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
            >
              <Controller
                name="experiment_name"
                control={control}
                rules={{ required: 'Experiment name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Experiment name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? 'Created if it does not exist'}
                  />
                )}
              />
              <Controller
                name="run_name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Run name (optional)" fullWidth />
                )}
              />
              <Controller
                name="dataset_id"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Dataset (optional)" fullWidth>
                    <MenuItem value="">None</MenuItem>
                    {datasets.data?.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="executor"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Executor" fullWidth>
                    <MenuItem value="local">Local</MenuItem>
                    <MenuItem value="datasphere">Yandex DataSphere</MenuItem>
                  </TextField>
                )}
              />
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
                    placeholder="open, high, low, volume"
                    fullWidth
                  />
                )}
              />
            </Box>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Description (optional)" fullWidth multiline minRows={2} />
              )}
            />

            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              Hyperparameters — leave blank to use trainer defaults
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              {HYPERPARAM_FIELDS.map((hp) => (
                <Controller
                  key={hp.name}
                  name={hp.name}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label={hp.label} type="number" fullWidth size="small" />
                  )}
                />
              ))}
              <Controller
                name="lr"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="learning_rate"
                    type="number"
                    inputProps={{ step: 'any' }}
                    fullWidth
                    size="small"
                  />
                )}
              />
              <Controller
                name="loss"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="loss" fullWidth size="small">
                    {LOSS_OPTIONS.map((opt) => (
                      <MenuItem key={opt || 'default'} value={opt}>
                        {opt || 'default'}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="device"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="device" fullWidth size="small">
                    {DEVICE_OPTIONS.map((opt) => (
                      <MenuItem key={opt || 'default'} value={opt}>
                        {opt || 'default'}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 2 }} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              Upload a JSON file containing a full TrainRequest body.
            </Typography>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
              {file ? file.name : 'Choose JSON file'}
              <input
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={close} disabled={loading}>
          Cancel
        </Button>
        {tab === 'form' ? (
          <Button onClick={() => submitForm()} variant="contained" disabled={loading}>
            {loading ? 'Starting…' : 'Start training'}
          </Button>
        ) : (
          <Button onClick={submitFile} variant="contained" disabled={loading || !file}>
            {loading ? 'Starting…' : 'Start from file'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
