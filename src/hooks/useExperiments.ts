import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { experimentsApi, getErrorMessage } from '../api';
import type { ExperimentCreate } from '../api';
import { notify } from '../store/notificationStore';
import { queryKeys } from './queryKeys';

export function useExperiments() {
  return useQuery({ queryKey: queryKeys.experiments, queryFn: experimentsApi.list });
}

export function useExperiment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.experiment(id ?? ''),
    queryFn: () => experimentsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useAllRuns() {
  return useQuery({ queryKey: queryKeys.allRuns, queryFn: experimentsApi.listAllRuns });
}

const ACTIVE_STATUSES = ['pending', 'running'] as const;

export function useRunDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.runDetail(id ?? ''),
    queryFn: () => experimentsApi.getRunDetail(id as string),
    enabled: Boolean(id),
    // Auto-refresh while the run is active so monitoring stays live.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && (ACTIVE_STATUSES as readonly string[]).includes(status)
        ? 3_000
        : false;
    },
  });
}

export function useCreateExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExperimentCreate) => experimentsApi.create(payload),
    onSuccess: (data) => {
      notify(`Experiment "${data.name}" created`, 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.experiments });
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}
