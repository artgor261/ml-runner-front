import axios, { AxiosError } from 'axios';
import type { HTTPValidationError } from './types';

/**
 * Shared axios instance. All requests are prefixed with `/api/v1`.
 *
 * In development, requests to `/api` are proxied to the backend by Vite
 * (see vite.config.ts). In production set VITE_API_BASE_URL to the backend host.
 */
const baseURL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Normalize an axios error into a human-readable message. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<HTTPValidationError | { detail?: unknown }>;
    const data = axiosError.response?.data;

    if (data && typeof data === 'object' && 'detail' in data) {
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        return detail
          .map((item) => {
            if (item && typeof item === 'object' && 'msg' in item) {
              const loc = Array.isArray((item as { loc?: unknown[] }).loc)
                ? (item as { loc: unknown[] }).loc.join('.')
                : '';
              const msg = (item as { msg?: string }).msg ?? '';
              return loc ? `${loc}: ${msg}` : msg;
            }
            return String(item);
          })
          .join('; ');
      }
    }

    if (axiosError.message) return axiosError.message;
  }

  if (error instanceof Error) return error.message;
  return 'Unexpected error';
}
