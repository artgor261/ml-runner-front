/** Formatting helpers shared across pages. */

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatNumber(value: unknown, digits = 4): string {
  if (value == null || value === '') return '—';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  if (Number.isInteger(num)) return num.toLocaleString();
  return num.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function formatList(value: string[] | null | undefined, max = 4): string {
  if (!value || value.length === 0) return '—';
  if (value.length <= max) return value.join(', ');
  return `${value.slice(0, max).join(', ')} +${value.length - max}`;
}

/** Parse a comma/space separated string into a clean string array. */
export function parseTickers(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

export function truncate(value: string, length = 40): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1)}…`;
}

/** Format a metrics record as flat key/value display pairs. */
export function metricsToEntries(
  metrics: Record<string, unknown> | null | undefined,
): Array<[string, string]> {
  if (!metrics) return [];
  return Object.entries(metrics)
    .filter(([, v]) => typeof v === 'number' || typeof v === 'string')
    .map(([k, v]) => [k, formatNumber(v)]);
}
