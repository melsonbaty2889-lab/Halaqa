/* src/types/index.ts */

export * from './database.types';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'teacher'
  | 'student'
  | 'parent';

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}
