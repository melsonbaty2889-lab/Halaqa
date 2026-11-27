/* src/types/teacher.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type TeacherRow = Tables<'teachers'>;
export type TeacherInsert = InsertTables<'teachers'>;
export type TeacherUpdate = UpdateTables<'teachers'>;

export type AcademyTeacherRow = Tables<'academy_teachers'>;
export type AcademyTeacherInsert = InsertTables<'academy_teachers'>;
export type AcademyTeacherUpdate = UpdateTables<'academy_teachers'>;

export type EmploymentType = 'salary' | 'hourly';
export type TeachingMode = 'online' | 'offline' | 'hybrid';

export interface Teacher
  extends Omit<TeacherRow, 'employment_type' | 'teaching_mode'> {
  employment_type?: EmploymentType | string | null;
  teaching_mode?: TeachingMode | string | null;

  // علاقة البروفايل المرتبط بالمعلم عند عمل join
  profiles?: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface TeacherFilters {
  searchTerm: string;
  is_active?: boolean | 'all';
  is_archived: boolean;
  teaching_mode?: string;
  specialization?: string;
}
