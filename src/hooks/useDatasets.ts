import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { datasetsApi, getErrorMessage } from '../api';
import type { DatasetReadWithData, GDriveImportRequest, MoexLoadRequest } from '../api';
import { notify } from '../store/notificationStore';
import { queryKeys } from './queryKeys';

/**
 * Prime the cache from a creation response: the dataset metadata feeds the
 * detail query, and the inline rows are stored separately so the dataset
 * preview can render real data immediately (no parquet round-trip needed).
 */
function seedCreatedDataset(queryClient: QueryClient, dataset: DatasetReadWithData) {
  const { data, ...meta } = dataset;
  queryClient.setQueryData(queryKeys.dataset(dataset.id), meta);
  queryClient.setQueryData(queryKeys.datasetData(dataset.id), data);
  queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
}

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
  const queryClient = useQueryClient();
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
      seedCreatedDataset(queryClient, data);
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}

export function useImportGDriveDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GDriveImportRequest) => datasetsApi.importFromGDrive(payload),
    onMutate: (payload) =>
      notify(`Importing "${payload.name}" from Google Drive…`, 'info'),
    onSuccess: (data) => {
      notify(`Dataset "${data.name}" imported from Google Drive`, 'success');
      seedCreatedDataset(queryClient, data);
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
