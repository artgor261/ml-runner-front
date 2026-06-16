import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { datasetsApi, getErrorMessage } from '../api';
import type {
  GDriveImportRequest,
  LocalImportRequest,
  MoexLoadRequest,
} from '../api';
import { notify } from '../store/notificationStore';
import { queryKeys } from './queryKeys';

export function useDatasets() {
  return useQuery({ queryKey: queryKeys.datasets, queryFn: datasetsApi.list });
}

export function useDataset(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dataset(id ?? ''),
    queryFn: () => datasetsApi.get(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateDatasets() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
}

export function useCreateMoexDataset() {
  const invalidate = useInvalidateDatasets();
  return useMutation({
    mutationFn: (payload: MoexLoadRequest) => datasetsApi.loadFromMoex(payload),
    onSuccess: (data) => {
      notify(`Dataset "${data.name}" created from MOEX`, 'success');
      invalidate();
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}

export function useImportLocalDataset() {
  const invalidate = useInvalidateDatasets();
  return useMutation({
    mutationFn: (payload: LocalImportRequest) => datasetsApi.importFromLocal(payload),
    onSuccess: (data) => {
      notify(`Dataset "${data.name}" imported`, 'success');
      invalidate();
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}

export function useImportGDriveDataset() {
  const invalidate = useInvalidateDatasets();
  return useMutation({
    mutationFn: (payload: GDriveImportRequest) => datasetsApi.importFromGDrive(payload),
    onSuccess: (data) => {
      notify(`Dataset "${data.name}" imported from Google Drive`, 'success');
      invalidate();
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}

export function useDeleteDataset() {
  const invalidate = useInvalidateDatasets();
  return useMutation({
    mutationFn: (id: string) => datasetsApi.remove(id),
    onSuccess: () => {
      notify('Dataset deleted', 'success');
      invalidate();
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}
