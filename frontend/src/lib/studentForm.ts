import type { Student } from '../types';
import type { StudentFormValues } from './validators';

export const emptyStudentFormValues: StudentFormValues = {
  class_id: 0,
  name: '',
  email: '',
  phone: '',
};

export function studentToFormValues(student?: Student | null): StudentFormValues {
  if (!student) return emptyStudentFormValues;
  return {
    class_id: student.class_id,
    name: student.name,
    email: student.email,
    phone: student.phone ?? '',
  };
}