/* src/types/teacher.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type TeacherRow = Tables<'teachers'>;
export type TeacherInsert = InsertTables<'teachers'>;
export type TeacherUpdate = UpdateTables<'teachers'>;

export type EmploymentType = 'salary' | 'hourly';
export type TeachingMode = 'online' | 'offline' | 'hybrid';

export interface Teacher
  extends Omit<
    TeacherRow,
    'bio' | 'international_payout' | 'metadata' | 'employment_type' | 'teaching_mode'
  > {
  bio?: Json | null;
  international_payout?: Json | null;
  metadata?: Json | null;
  employment_type?: EmploymentType | string | null;
  teaching_mode?: TeachingMode | string | null;

  // Foreign key relation from profiles
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
