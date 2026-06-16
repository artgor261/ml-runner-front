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
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useRegisterModel, useUploadModel } from '../../hooks/useModels';
import { parseTickers } from '../../utils/format';

interface AddModelDialogProps {
  open: boolean;
  onClose: () => void;
}

interface UploadForm {
  name: string;
  description: string;
}
interface RegisterForm {
  name: string;
  path: string;
  description: string;
  architecture: string;
  tickers: string;
  feature_cols: string;
}

export function AddModelDialog({ open, onClose }: AddModelDialogProps) {
  const [tab, setTab] = useState<'upload' | 'register'>('upload');
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useUploadModel();
  const registerMutation = useRegisterModel();

  const uploadForm = useForm<UploadForm>({ defaultValues: { name: '', description: '' } });
  const registerForm = useForm<RegisterForm>({
    defaultValues: {
      name: '',
      path: '',
      description: '',
      architecture: 'tcn_multi',
      tickers: '',
      feature_cols: '',
    },
  });

  const loading = uploadMutation.isPending || registerMutation.isPending;

  const close = () => {
    uploadForm.reset();
    registerForm.reset();
    setFile(null);
    setTab('upload');
    onClose();
  };

  const submitUpload = uploadForm.handleSubmit((values) => {
    if (!file) return;
    uploadMutation.mutate(
      { name: values.name, description: values.description || null, file },
      { onSuccess: close },
    );
  });

  const submitRegister = registerForm.handleSubmit((values) => {
    registerMutation.mutate(
      {
        name: values.name,
        path: values.path,
        description: values.description || null,
        architecture: values.architecture || null,
        tickers: values.tickers ? parseTickers(values.tickers) : null,
        feature_cols: values.feature_cols ? parseTickers(values.feature_cols) : null,
      },
      { onSuccess: close },
    );
  });

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Add model</DialogTitle>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Upload .pt file" value="upload" />
        <Tab label="Register by path" value="register" />
      </Tabs>

      <DialogContent>
        {tab === 'upload' ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={uploadForm.control}
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Model name"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={uploadForm.control}
              render={({ field }) => (
                <TextField {...field} label="Description (optional)" fullWidth multiline minRows={2} />
              )}
            />
            <Box>
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                {file ? file.name : 'Choose .pt file'}
                <input
                  type="file"
                  accept=".pt"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              {!file && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  A model weights file (.pt) is required.
                </Typography>
              )}
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={registerForm.control}
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Model name"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="path"
              control={registerForm.control}
              rules={{ required: 'Path is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Path to .pt file"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="architecture"
              control={registerForm.control}
              render={({ field }) => (
                <TextField {...field} label="Architecture" fullWidth />
              )}
            />
            <Controller
              name="tickers"
              control={registerForm.control}
              render={({ field }) => (
                <TextField {...field} label="Tickers (optional)" fullWidth />
              )}
            />
            <Controller
              name="feature_cols"
              control={registerForm.control}
              render={({ field }) => (
                <TextField {...field} label="Feature columns (optional)" fullWidth />
              )}
            />
            <Controller
              name="description"
              control={registerForm.control}
              render={({ field }) => (
                <TextField {...field} label="Description (optional)" fullWidth multiline minRows={2} />
              )}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={close} disabled={loading}>
          Cancel
        </Button>
        {tab === 'upload' ? (
          <Button onClick={() => submitUpload()} variant="contained" disabled={loading || !file}>
            {loading ? 'Uploading…' : 'Upload'}
          </Button>
        ) : (
          <Button onClick={() => submitRegister()} variant="contained" disabled={loading}>
            {loading ? 'Registering…' : 'Register'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
