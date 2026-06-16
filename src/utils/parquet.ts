import { parquetMetadata, parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';

/**
 * Browser-side parquet reading for dataset previews.
 *
 * Files are fetched once over HTTP and cached in memory; row windows are then
 * decoded on demand so paging through a large dataset never re-downloads it.
 */

export type ParquetRow = Record<string, unknown>;

export interface ParquetWindow {
  rows: ParquetRow[];
  rowCount: number;
  columns: string[];
}

const bufferCache = new Map<string, ArrayBuffer>();

/** Build the dev-server URL that serves a parquet file by absolute path. */
export function datasetFileUrl(parquetPath: string): string {
  return `/__dataset-file?path=${encodeURIComponent(parquetPath)}`;
}

/** Join a dataset directory path and a ticker into a parquet file path. */
export function tickerParquetPath(datasetPath: string, ticker: string): string {
  const trimmed = datasetPath.replace(/[/\\]+$/, '');
  return `${trimmed}/${ticker}.parquet`;
}

async function loadBuffer(url: string): Promise<ArrayBuffer> {
  const cached = bufferCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? 'Data file not found on disk'
        : `Failed to load data file (HTTP ${res.status})`,
    );
  }
  const buffer = await res.arrayBuffer();
  bufferCache.set(url, buffer);
  return buffer;
}

function columnsFromMetadata(buffer: ArrayBuffer): string[] {
  const meta = parquetMetadata(buffer);
  // Flat schema: index 0 is the root message, the rest are leaf columns.
  return meta.schema.slice(1).map((element) => element.name);
}

/** Read a [rowStart, rowEnd) window of rows plus the total row count. */
export async function readParquetWindow(
  url: string,
  rowStart: number,
  rowEnd: number,
): Promise<ParquetWindow> {
  const buffer = await loadBuffer(url);
  const meta = parquetMetadata(buffer);
  const rowCount = Number(meta.num_rows);

  const file = {
    byteLength: buffer.byteLength,
    slice: async (start: number, end?: number) => buffer.slice(start, end),
  };

  const safeStart = Math.max(0, Math.min(rowStart, rowCount));
  const safeEnd = Math.max(safeStart, Math.min(rowEnd, rowCount));

  const rows =
    safeEnd > safeStart
      ? ((await parquetReadObjects({
          file,
          compressors,
          rowStart: safeStart,
          rowEnd: safeEnd,
        })) as ParquetRow[])
      : [];

  const columns = rows.length > 0 ? Object.keys(rows[0]) : columnsFromMetadata(buffer);

  return { rows, rowCount, columns };
}

/** Format a decoded parquet cell value for display. */
export function formatCell(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString().replace('T', ' ').replace('Z', '');
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }
  return String(value);
}
