import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteStudent } from '../api/students';

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
}