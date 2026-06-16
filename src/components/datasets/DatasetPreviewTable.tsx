import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tab,
  Tabs,
} from '@mui/material';
import { getErrorMessage } from '../../api';
import type { DatasetRead } from '../../api';
import { useDatasetPreview } from '../../hooks/useDatasetPreview';
import { EmptyState } from '../common/States';
import { formatCell } from '../../utils/parquet';

const NUMERIC_ALIGN = new Set(['open', 'close', 'high', 'low', 'value', 'volume']);

interface DatasetPreviewTableProps {
  dataset: DatasetRead;
}

export function DatasetPreviewTable({ dataset }: DatasetPreviewTableProps) {
  const [ticker, setTicker] = useState(dataset.tickers[0]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  // Reset to the first page whenever the selected ticker changes.
  useEffect(() => {
    setPage(0);
  }, [ticker]);

  const { data, isLoading, isError, error, isPlaceholderData } = useDatasetPreview({
    datasetId: dataset.id,
    datasetPath: dataset.path,
    ticker,
    page,
    pageSize,
  });

  const columns = useMemo(() => data?.columns ?? [], [data]);

  if (dataset.tickers.length === 0) {
    return (
      <EmptyState
        title="No tickers"
        description="This dataset has no tickers to preview."
      />
    );
  }

  return (
    <Box>
      <Tabs
        value={ticker}
        onChange={(_, value) => setTicker(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}
      >
        {dataset.tickers.map((t) => (
          <Tab key={t} label={t} value={t} />
        ))}
      </Tabs>

      <Box sx={{ height: 3 }}>{(isLoading || isPlaceholderData) && <LinearProgress />}</Box>

      {isError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          Could not load data preview: {getErrorMessage(error)}. Preview reads parquet files
          directly and is available when running the dev server with access to the datasets
          directory.
        </Alert>
      ) : data && data.rowCount === 0 ? (
        <EmptyState title="Empty file" description="This parquet file has no rows." />
      ) : (
        <>
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 72 }} align="right">
                    #
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell
                      key={col}
                      sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                      align={NUMERIC_ALIGN.has(col) ? 'right' : 'left'}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.rows.map((row, idx) => (
                  <TableRow key={page * pageSize + idx} hover>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {(page * pageSize + idx).toLocaleString()}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col}
                        align={NUMERIC_ALIGN.has(col) ? 'right' : 'left'}
                        sx={{
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          fontFamily: NUMERIC_ALIGN.has(col) ? 'monospace' : undefined,
                        }}
                      >
                        {formatCell(row[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={data?.rowCount ?? 0}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100, 200]}
          />
        </>
      )}
    </Box>
  );
}
