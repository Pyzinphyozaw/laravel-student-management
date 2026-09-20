import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStudent } from '../api/students';
import type { StudentPayload } from '../types';

export function useUpdateStudent(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudentPayload) => updateStudent(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student', id] });
    },
  });
}