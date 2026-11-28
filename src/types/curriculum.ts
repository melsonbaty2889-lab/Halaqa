/* src/types/curriculum.ts */

import type { Tables, InsertTables, UpdateTables } from './database.types';

export type CurriculumRow = Tables<'curricula'>;
export type CurriculumInsert = InsertTables<'curricula'>;
export type CurriculumUpdate = UpdateTables<'curricula'>;

export type CurriculumCategory =
  | 'quran'
  | 'tajweed'
  | 'aqeedah'
  | 'fiqh'
  | 'hadith'
  | 'seerah'
  | 'arabic'
  | 'other';

export interface Curriculum extends Omit<CurriculumRow, 'category'> {
  category?: CurriculumCategory | string | null;
}

export interface CurriculumFilters {
  searchTerm: string;
  category?: string;
  is_active?: boolean | 'all';
}
