/* src/types/quran.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type SurahRow = Tables<'surahs'>;
export type SurahInsert = InsertTables<'surahs'>;
export type SurahUpdate = UpdateTables<'surahs'>;

export type AyahRow = Tables<'ayahs'>;
export type AyahInsert = InsertTables<'ayahs'>;
export type AyahUpdate = UpdateTables<'ayahs'>;

export type AiRecitationLogRow = Tables<'ai_recitation_logs'>;
export type AiRecitationLogInsert = InsertTables<'ai_recitation_logs'>;
export type AiRecitationLogUpdate = UpdateTables<'ai_recitation_logs'>;

export interface Surah extends Omit<SurahRow, 'names_localized'> {
  names_localized: Json;
}

export interface Ayah extends AyahRow {}

export interface AiRecitationLog
  extends Omit<AiRecitationLogRow, 'mistakes_detected'> {
  mistakes_detected?: Json | null;
    }
