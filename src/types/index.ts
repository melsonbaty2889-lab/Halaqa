/* src/types/index.ts */

export * from './database.types';
export * from './academy';
export * from './attendance';
export * from './badge';
export * from './certificate';
export * from './curriculum';
export * from './document';
export * from './enrollment';
export * from './exam';
export * from './halaqa';
export * from './notification';
export * from './parent';
export * from './payment';
export * from './profile';
export * from './progress';
export * from './quran';
export * from './session';
export * from './student';
export * from './subscription';
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
