import axios, { AxiosError } from 'axios';
import type { ApiValidationError } from '../types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function isValidationError(
  err: unknown,
): err is AxiosError<ApiValidationError> {
  return (
    axios.isAxiosError(err) &&
    err.response?.status === 422 &&
    typeof err.response.data === 'object' &&
    err.response.data !== null &&
    'errors' in err.response.data
  );
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (
      (err.response?.data as { message?: string })?.message ??
      err.message ??
      'Something went wrong'
    );
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}