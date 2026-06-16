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
    // The MOEX request is synchronous and can take a while (data is fetched
    // ticker by ticker), so tell the user it has started right away.
    onMutate: (payload) =>
      notify(
        `Loading "${payload.name}" from MOEX (${payload.tickers.length} ticker${
          payload.tickers.length === 1 ? '' : 's'
        })… this may take a while`,
        'info',
      ),
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
    onMutate: (payload) => notify(`Importing "${payload.name}"…`, 'info'),
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
    onMutate: (payload) =>
      notify(`Importing "${payload.name}" from Google Drive…`, 'info'),
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
