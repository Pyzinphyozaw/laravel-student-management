import { useQuery } from '@tanstack/react-query';
import { getClasses } from '../api/classes';

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
    staleTime: 5 * 60 * 1000,
  });
}