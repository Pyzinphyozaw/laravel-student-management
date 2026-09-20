import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStudent } from '../api/students';
import type { StudentPayload } from '../types';

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudentPayload) => createStudent(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
}