import { type ReactNode, useMemo, useState } from 'react';
import {
  Box,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface Column<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  /** Primitive used for sorting and free-text search. */
  value?: (row: T) => string | number | null | undefined;
  /** Custom cell renderer; defaults to `value`. */
  render?: (row: T) => ReactNode;
  width?: number | string;
}

export interface FilterDef<T> {
  id: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  getValue: (row: T) => string;
}

type SortDirection = 'asc' | 'desc';

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  filters?: FilterDef<T>[];
  initialSort?: { columnId: string; direction: SortDirection };
  rowsPerPageOptions?: number[];
  emptyMessage?: string;
  toolbarExtra?: ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Search…',
  filters = [],
  initialSort,
  rowsPerPageOptions = [10, 25, 50],
  emptyMessage = 'No records found',
  toolbarExtra,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | undefined>(initialSort?.columnId);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialSort?.direction ?? 'asc',
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] ?? 10);

  const columnsById = useMemo(
    () => Object.fromEntries(columns.map((c) => [c.id, c])),
    [columns],
  );

  const filtered = useMemo(() => {
    let result = rows;

    // Column filters.
    for (const filter of filters) {
      const selected = filterValues[filter.id];
      if (selected && selected !== '__all__') {
        result = result.filter((row) => filter.getValue(row) === selected);
      }
    }

    // Free-text search across searchable columns.
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((row) =>
        columns.some((col) => {
          const raw = col.value?.(row);
          return raw != null && String(raw).toLowerCase().includes(term);
        }),
      );
    }

    return result;
  }, [rows, filters, filterValues, search, columns]);

  const sorted = useMemo(() => {
    if (!sortColumn) return filtered;
    const col = columnsById[sortColumn];
    if (!col?.value) return filtered;
    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.value!(a);
      const bv = col.value!(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sortColumn, sortDirection, columnsById]);

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sorted, page, rowsPerPage],
  );

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const showToolbar = searchable || filters.length > 0 || Boolean(toolbarExtra);

  return (
    <Paper variant="outlined">
      {showToolbar && (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ p: 2 }}
          alignItems={{ md: 'center' }}
        >
          {searchable && (
            <TextField
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              sx={{ minWidth: 240 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          {filters.map((filter) => (
            <TextField
              key={filter.id}
              select
              size="small"
              label={filter.label}
              value={filterValues[filter.id] ?? '__all__'}
              onChange={(e) => {
                setFilterValues((prev) => ({ ...prev, [filter.id]: e.target.value }));
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="__all__">All</MenuItem>
              {filter.options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          {toolbarExtra}
        </Stack>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{ width: col.width, whiteSpace: 'nowrap' }}
                  sortDirection={sortColumn === col.id ? sortDirection : false}
                >
                  {col.sortable && col.value ? (
                    <TableSortLabel
                      active={sortColumn === col.id}
                      direction={sortColumn === col.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row) => (
              <TableRow
                key={getRowId(row)}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align} sx={{ width: col.width }}>
                    {col.render ? col.render(row) : (col.value?.(row) ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 6, textAlign: 'center' }}
                  >
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sorted.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(Number(e.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={rowsPerPageOptions}
      />
    </Paper>
  );
}
