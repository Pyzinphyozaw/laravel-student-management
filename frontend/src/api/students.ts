import { api } from './axios';
import type { Paginated, Student, StudentPayload } from '../types';

export interface StudentQuery {
  page?: number;
  search?: string;
  class_id?: number;
}

export async function getStudents(params: StudentQuery = {}) {
  const { data } = await api.get<Paginated<Student>>('/students', { params });
  return data;
}

export async function getStudent(id: number) {
  const { data } = await api.get<{ data: Student }>(`/students/${id}`);
  return data.data;
}

export async function createStudent(payload: StudentPayload) {
  const { data } = await api.post<{ data: Student }>('/students', payload);
  return data.data;
}

export async function updateStudent(id: number, payload: StudentPayload) {
  const { data } = await api.put<{ data: Student }>(`/students/${id}`, payload);
  return data.data;
}

export async function deleteStudent(id: number) {
  const { data } = await api.delete<{ message: string }>(`/students/${id}`);
  return data;
}