/* src/types/halaqa.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type HalaqaRow = Tables<'halaqas'>;
export type HalaqaInsert = InsertTables<'halaqas'>;
export type HalaqaUpdate = UpdateTables<'halaqas'>;

export type HalaqaStatus = 'active' | 'paused';
export type TargetAudience = 'all' | 'kids' | 'males' | 'females';
export type TeachingType = 'online' | 'offline';
export type EducationalTrack = 'hifz' | 'muraja' | 'tilawa' | 'tajweed' | string;

export interface LocalizedText {
  ar?: string;
  en?: string;
  [key: string]: string | undefined;
}

export interface Halaqa
  extends Omit<
    HalaqaRow,
    'name' | 'description' | 'status' | 'target_audience' | 'teaching_type' | 'educational_track'
  > {
  name: LocalizedText | Json;
  description?: LocalizedText | Json | null;
  status?: HalaqaStatus | string | null;
  target_audience?: TargetAudience | string | null;
  teaching_type?: TeachingType | string | null;
  educational_track?: EducationalTrack | null;

  teachers?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;

  curricula?: {
    id: string;
    title?: string | null;
  } | null;
}

export interface HalaqaFilters {
  searchTerm: string;
  status?: string;
  target_audience?: string;
  teaching_type?: string;
  is_archived: boolean;
}
