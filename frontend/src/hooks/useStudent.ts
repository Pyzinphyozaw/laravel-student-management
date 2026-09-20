import { useQuery } from '@tanstack/react-query';
import { getStudent } from '../api/students';

export function useStudent(id: number) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}