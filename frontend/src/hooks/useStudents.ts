import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getStudents, type StudentQuery } from '../api/students';

export function useStudents(params: StudentQuery) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => getStudents(params),
    placeholderData: keepPreviousData,
  });
}