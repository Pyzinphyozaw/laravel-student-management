import { api } from './axios';
import type { SchoolClass } from '../types';

export async function getClasses() {
  const { data } = await api.get<{ data: SchoolClass[] }>('/classes');
  return data.data;
}