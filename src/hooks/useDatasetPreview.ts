import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DatasetData } from '../api';
import {
  datasetFileUrl,
  type ParquetWindow,
  readParquetWindow,
  tickerParquetPath,
} from '../utils/parquet';
import { queryKeys } from './queryKeys';

interface UseDatasetPreviewArgs {
  datasetId: string | undefined;
  datasetPath: string | undefined;
  ticker: string | undefined;
  page: number;
  pageSize: number;
}

interface DatasetPreviewResult {
  data: ParquetWindow | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isPlaceholderData: boolean;
}

/**
 * Reads a window of rows for one ticker.
 *
 * Prefers rows returned inline by the creation endpoints (cached under
 * `datasetData`) — these work even in production. Falls back to reading the
 * ticker's parquet file over HTTP (dev only) for datasets opened later.
 */
export function useDatasetPreview({
  datasetId,
  datasetPath,
  ticker,
  page,
  pageSize,
}: UseDatasetPreviewArgs): DatasetPreviewResult {
  const queryClient = useQueryClient();

  const inlineRows =
    datasetId && ticker
      ? queryClient.getQueryData<DatasetData>(queryKeys.datasetData(datasetId))?.[ticker]
      : undefined;

  const url =
    datasetPath && ticker ? datasetFileUrl(tickerParquetPath(datasetPath, ticker)) : undefined;

  const query = useQuery({
    queryKey: ['dataset-preview', url, page, pageSize],
    queryFn: () => readParquetWindow(url as string, page * pageSize, page * pageSize + pageSize),
    enabled: Boolean(url) && !inlineRows,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    retry: false,
  });

  if (inlineRows) {
    const start = page * pageSize;
    const rows = inlineRows.slice(start, start + pageSize);
    const columns = inlineRows.length > 0 ? Object.keys(inlineRows[0]) : [];
    return {
      data: { rows, rowCount: inlineRows.length, columns },
      isLoading: false,
      isError: false,
      error: null,
      isPlaceholderData: false,
    };
  }

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isPlaceholderData: query.isPlaceholderData,
  };
}
