/* src/types/badge.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type BadgeRow = Tables<'badges'>;
export type BadgeInsert = InsertTables<'badges'>;
export type BadgeUpdate = UpdateTables<'badges'>;

export type StudentBadgeRow = Tables<'student_badges'>;
export type StudentBadgeInsert = InsertTables<'student_badges'>;
export type StudentBadgeUpdate = UpdateTables<'student_badges'>;

export interface Badge extends Omit<BadgeRow, 'titles' | 'descriptions'> {
  titles: Json;
  descriptions?: Json | null;
}

export interface StudentBadge extends Omit<StudentBadgeRow, 'metadata'> {
  metadata: Json;
}
