import { useNavigate } from 'react-router-dom';
import { DataTable, type Column, type FilterDef } from './DataTable';
import { StatusChip } from './StatusChip';
import type { RunRead, RunStatus } from '../../api';
import { formatDate, formatList, formatNumber } from '../../utils/format';

const STATUS_FILTER: FilterDef<RunRead> = {
  id: 'status',
  label: 'Status',
  getValue: (r) => r.status,
  options: (['pending', 'running', 'completed', 'failed', 'stopped'] as RunStatus[]).map(
    (s) => ({ label: s, value: s }),
  ),
};

const EXECUTOR_FILTER: FilterDef<RunRead> = {
  id: 'executor',
  label: 'Executor',
  getValue: (r) => r.executor,
  options: [
    { label: 'Local', value: 'local' },
    { label: 'DataSphere', value: 'datasphere' },
  ],
};

interface RunsTableProps {
  runs: RunRead[];
  emptyMessage?: string;
}

export function RunsTable({ runs, emptyMessage = 'No runs yet.' }: RunsTableProps) {
  const navigate = useNavigate();

  const columns: Column<RunRead>[] = [
    {
      id: 'name',
      label: 'Run',
      sortable: true,
      value: (r) => r.name,
      render: (r) => <strong>{r.name}</strong>,
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      value: (r) => r.status,
      render: (r) => <StatusChip status={r.status} />,
    },
    {
      id: 'executor',
      label: 'Executor',
      sortable: true,
      value: (r) => r.executor,
    },
    {
      id: 'tickers',
      label: 'Tickers',
      value: (r) => r.tickers.join(' '),
      render: (r) => formatList(r.tickers, 3),
    },
    {
      id: 'epoch',
      label: 'Epoch',
      align: 'right',
      sortable: true,
      value: (r) => r.current_epoch ?? 0,
      render: (r) =>
        r.total_epochs != null
          ? `${r.current_epoch ?? 0} / ${r.total_epochs}`
          : (r.current_epoch ?? '—'),
    },
    {
      id: 'val_loss',
      label: 'Val loss',
      align: 'right',
      sortable: true,
      value: (r) => {
        const v = r.metrics?.val_loss ?? r.metrics?.['val_loss'];
        return typeof v === 'number' ? v : Number.POSITIVE_INFINITY;
      },
      render: (r) => formatNumber(r.metrics?.val_loss),
    },
    {
      id: 'created_at',
      label: 'Created',
      sortable: true,
      value: (r) => r.created_at,
      render: (r) => formatDate(r.created_at),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={runs}
      getRowId={(r) => r.id}
      onRowClick={(r) => navigate(`/runs/${r.id}`)}
      filters={[STATUS_FILTER, EXECUTOR_FILTER]}
      searchPlaceholder="Search runs…"
      initialSort={{ columnId: 'created_at', direction: 'desc' }}
      emptyMessage={emptyMessage}
    />
  );
}
