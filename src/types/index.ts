/* src/types/index.ts */

export * from './database.types';
export * from './halaqa';
export * from './attendance';
export * from './curriculum';
export * from './parent';
export * from './student';
export * from './teacher';

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
