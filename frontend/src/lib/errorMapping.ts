import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { isValidationError, getErrorMessage } from '../api/axios';

export function applyApiErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  knownFields: (keyof T)[],
): string | null {
  if (isValidationError(err)) {
    const errors = err.response?.data.errors ?? {};
    let matched = false;

    (Object.keys(errors) as string[]).forEach((field) => {
      const messages = errors[field];
      if (!messages?.length) return;

      if (knownFields.includes(field as keyof T)) {
        setError(field as Path<T>, { type: 'server', message: messages[0] });
        matched = true;
      }
    });

    // If the backend returned errors that don't map to fields, surface them.
    if (!matched) {
      const flat = Object.values(errors).flat();
      return flat[0] ?? 'Validation failed';
    }
    return null;
  }

  return getErrorMessage(err);
}

export type ApiErrorSetter<T extends FieldValues> = UseFormSetError<T>;