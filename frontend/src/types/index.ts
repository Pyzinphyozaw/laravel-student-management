export interface SchoolClass {
  id: number;
  name: string;
}

export interface Student {
  id: number;
  class_id: number;
  name: string;
  email: string;
  phone: string | null;
  class?: SchoolClass;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export interface StudentPayload {
  class_id: number;
  name: string;
  email: string;
  phone?: string | null;
}