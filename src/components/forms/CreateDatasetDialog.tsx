import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import {
  useCreateMoexDataset,
  useImportGDriveDataset,
  useImportLocalDataset,
} from '../../hooks/useDatasets';
import { parseTickers } from '../../utils/format';

interface CreateDatasetDialogProps {
  open: boolean;
  onClose: () => void;
}

type SourceTab = 'moex' | 'local' | 'gdrive';

interface MoexForm {
  name: string;
  tickers: string;
  start: string;
  end: string;
  interval: string;
  description: string;
}
interface LocalForm {
  name: string;
  path: string;
  tickers: string;
  description: string;
}
interface GDriveForm {
  name: string;
  gdrive_url: string;
  tickers: string;
  description: string;
}

export function CreateDatasetDialog({ open, onClose }: CreateDatasetDialogProps) {
  const [tab, setTab] = useState<SourceTab>('moex');

  const moexMutation = useCreateMoexDataset();
  const localMutation = useImportLocalDataset();
  const gdriveMutation = useImportGDriveDataset();

  const moexForm = useForm<MoexForm>({
    defaultValues: { name: '', tickers: '', start: '', end: '', interval: '', description: '' },
  });
  const localForm = useForm<LocalForm>({
    defaultValues: { name: '', path: '', tickers: '', description: '' },
  });
  const gdriveForm = useForm<GDriveForm>({
    defaultValues: { name: '', gdrive_url: '', tickers: '', description: '' },
  });

  const loading =
    moexMutation.isPending || localMutation.isPending || gdriveMutation.isPending;

  const close = () => {
    moexForm.reset();
    localForm.reset();
    gdriveForm.reset();
    onClose();
  };

  const submitMoex = moexForm.handleSubmit((values) => {
    moexMutation.mutate(
      {
        name: values.name,
        tickers: parseTickers(values.tickers),
        start: values.start,
        end: values.end || null,
        interval: values.interval ? Number(values.interval) : null,
        description: values.description || null,
      },
      { onSuccess: close },
    );
  });

  const submitLocal = localForm.handleSubmit((values) => {
    localMutation.mutate(
      {
        name: values.name,
        path: values.path,
        tickers: values.tickers ? parseTickers(values.tickers) : null,
        description: values.description || null,
      },
      { onSuccess: close },
    );
  });

  const submitGDrive = gdriveForm.handleSubmit((values) => {
    gdriveMutation.mutate(
      {
        name: values.name,
        gdrive_url: values.gdrive_url,
        tickers: values.tickers ? parseTickers(values.tickers) : null,
        description: values.description || null,
      },
      { onSuccess: close },
    );
  });

  const onSubmit =
    tab === 'moex' ? submitMoex : tab === 'local' ? submitLocal : submitGDrive;

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>New dataset</DialogTitle>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="MOEX" value="moex" />
        <Tab label="Local" value="local" />
        <Tab label="Google Drive" value="gdrive" />
      </Tabs>

      <DialogContent>
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
          {tab === 'moex' && (
            <Stack spacing={2}>
              <Controller
                name="name"
                control={moexForm.control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Dataset name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="tickers"
                control={moexForm.control}
                rules={{ required: 'At least one ticker is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Tickers"
                    placeholder="SBER, GAZP, LKOH"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? 'Comma or space separated'}
                  />
                )}
              />
              <Stack direction="row" spacing={2}>
                <Controller
                  name="start"
                  control={moexForm.control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Start"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="end"
                  control={moexForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End (optional)"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Stack>
              <Controller
                name="interval"
                control={moexForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Candle interval (optional)"
                    type="number"
                    fullWidth
                    helperText="Defaults to backend setting"
                  />
                )}
              />
              <Controller
                name="description"
                control={moexForm.control}
                render={({ field }) => (
                  <TextField {...field} label="Description (optional)" fullWidth multiline minRows={2} />
                )}
              />
            </Stack>
          )}

          {tab === 'local' && (
            <Stack spacing={2}>
              <Controller
                name="name"
                control={localForm.control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Dataset name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="path"
                control={localForm.control}
                rules={{ required: 'Path is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Directory path"
                    placeholder="/data/parquet/moex"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? 'Folder with <TICKER>.parquet files'}
                  />
                )}
              />
              <Controller
                name="tickers"
                control={localForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tickers (optional)"
                    placeholder="Leave empty to use all parquet files"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="description"
                control={localForm.control}
                render={({ field }) => (
                  <TextField {...field} label="Description (optional)" fullWidth multiline minRows={2} />
                )}
              />
            </Stack>
          )}

          {tab === 'gdrive' && (
            <Stack spacing={2}>
              <Controller
                name="name"
                control={gdriveForm.control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Dataset name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="gdrive_url"
                control={gdriveForm.control}
                rules={{ required: 'Google Drive link or ID is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Google Drive URL or ID"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="tickers"
                control={gdriveForm.control}
                render={({ field }) => (
                  <TextField {...field} label="Tickers (optional)" fullWidth />
                )}
              />
              <Controller
                name="description"
                control={gdriveForm.control}
                render={({ field }) => (
                  <TextField {...field} label="Description (optional)" fullWidth multiline minRows={2} />
                )}
              />
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit()} variant="contained" disabled={loading}>
          {loading ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
