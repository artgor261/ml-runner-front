import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { datasetFileUrl, readParquetWindow, tickerParquetPath } from '../utils/parquet';

interface UseDatasetPreviewArgs {
  datasetPath: string | undefined;
  ticker: string | undefined;
  page: number;
  pageSize: number;
}

/**
 * Reads a window of rows for one ticker's parquet file. Keeps previous data
 * while paging so the table doesn't flash empty between pages.
 */
export function useDatasetPreview({
  datasetPath,
  ticker,
  page,
  pageSize,
}: UseDatasetPreviewArgs) {
  const url =
    datasetPath && ticker ? datasetFileUrl(tickerParquetPath(datasetPath, ticker)) : undefined;

  return useQuery({
    queryKey: ['dataset-preview', url, page, pageSize],
    queryFn: () => readParquetWindow(url as string, page * pageSize, page * pageSize + pageSize),
    enabled: Boolean(url),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
