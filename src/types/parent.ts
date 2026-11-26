/* src/types/parent.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type ParentRow = Tables<'parents'>;
export type ParentInsert = InsertTables<'parents'>;
export type ParentUpdate = UpdateTables<'parents'>;

export interface Parent extends Omit<ParentRow, 'metadata'> {
  metadata?: Json | null;

  // العلاقات المجلوبة
  profiles?: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface ParentFilters {
  searchTerm: string;
  preferred_language?: string;
}
