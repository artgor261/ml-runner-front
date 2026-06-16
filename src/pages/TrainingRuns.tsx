import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '../components/common/PageHeader';
import { RunsTable } from '../components/common/RunsTable';
import { LoadingState, ErrorState } from '../components/common/States';
import { StartTrainingDialog } from '../components/forms/StartTrainingDialog';
import { useAllRuns } from '../hooks/useExperiments';

export function TrainingRuns() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useAllRuns();
  const [dialogOpen, setDialogOpen] = useState(false);

  const experimentParam = searchParams.get('experiment') ?? undefined;

  // Deep-link: /training?experiment=Foo opens the start dialog prefilled.
  useEffect(() => {
    if (experimentParam) setDialogOpen(true);
  }, [experimentParam]);

  const closeDialog = () => {
    setDialogOpen(false);
    if (experimentParam) {
      searchParams.delete('experiment');
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <Stack>
      <PageHeader
        title="Training Runs"
        subtitle="All training runs across experiments"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Start training
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <RunsTable runs={data ?? []} emptyMessage="No training runs yet." />
      )}

      <StartTrainingDialog
        open={dialogOpen}
        onClose={closeDialog}
        defaultExperiment={experimentParam}
      />
    </Stack>
  );
}
