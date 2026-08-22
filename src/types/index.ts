/* src/types/index.ts */

// إعادة تصدير كافة الأنواع من ملفات الجداول والطلاب
export * from './database.types';
export * from './student';

// أنواع عامة ومساعدة للتطبيق بأكمله (Global & Utility Types)
export type UserRole = 'admin' | 'supervisor' | 'teacher' | 'parent' | 'student';

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}
