/* src/types/student.ts */

import type { Tables, InsertTables, UpdateTables } from './database.types';

export type StudentRow = Tables<'students'>;
export type StudentInsert = InsertTables<'students'>;
export type StudentUpdate = UpdateTables<'students'>;

export type StudentGender = 'male' | 'female';
export type StudentStatus = 'active' | 'inactive' | 'paused' | 'graduated';

export interface Student
  extends Omit<StudentRow, 'gender' | 'status'> {
  gender?: StudentGender | string | null;
  status: StudentStatus | string;

  // بيانات إضافية من العلاقات أو العروض (Views) عند الحاجة
  current_quarter?: number | null;
  parent_name?: string | null;
  parent_phone?: string | null;
}

export interface StudentFilters {
  searchTerm?: string;
  gender?: 'all' | StudentGender;
  halaqaId?: string;
  status?: 'all' | StudentStatus;
  isArchived?: boolean;
}
