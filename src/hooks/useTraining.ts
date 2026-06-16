import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, trainingApi } from '../api';
import type { ListRunsParams, RunStatus, TrainRequest } from '../api';
import { notify } from '../store/notificationStore';
import { queryKeys } from './queryKeys';

const ACTIVE_STATUSES: RunStatus[] = ['pending', 'running'];

export function useTrainingRuns(params: ListRunsParams = {}) {
  return useQuery({
    queryKey: queryKeys.trainingRuns(params),
    queryFn: () => trainingApi.listRuns(params),
    // Poll while there may be active runs so the table stays fresh.
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasActive = data?.some((run) => ACTIVE_STATUSES.includes(run.status));
      return hasActive ? 5_000 : false;
    },
  });
}

/**
 * Live status of a single run. Polls every 3s while the run is active,
 * satisfying "Обновление данных должно выполняться автоматически".
 */
export function useRunStatus(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.trainingStatus(id ?? ''),
    queryFn: () => trainingApi.getRunStatus(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE_STATUSES.includes(status) ? 3_000 : false;
    },
  });
}

function useInvalidateRuns() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['training', 'runs'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.allRuns });
    queryClient.invalidateQueries({ queryKey: queryKeys.experiments });
  };
}

export function useStartTraining() {
  const invalidate = useInvalidateRuns();
  return useMutation({
    mutationFn: (payload: TrainRequest) => trainingApi.startTraining(payload),
    onSuccess: (run) => {
      notify(`Training run "${run.name}" started`, 'success');
      invalidate();
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}

export function useStartTrainingFromFile() {
  const invalidate = useInvalidateRuns();
  return useMutation({
    mutationFn: (file: File) => trainingApi.startTrainingFromFile(file),
    onSuccess: (run) => {
      notify(`Training run "${run.name}" started from config`, 'success');
      invalidate();
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}

export function useCancelRun() {
  const invalidate = useInvalidateRuns();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trainingApi.cancelRun(id),
    onSuccess: (run) => {
      notify(`Run "${run.name}" cancelled`, 'info');
      invalidate();
      queryClient.invalidateQueries({ queryKey: queryKeys.runDetail(run.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingStatus(run.id) });
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}
