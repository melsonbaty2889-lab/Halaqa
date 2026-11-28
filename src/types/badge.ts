/* src/types/badge.ts */

import type { Tables, InsertTables, UpdateTables } from './database.types';

export type BadgeRow = Tables<'badges'>;
export type BadgeInsert = InsertTables<'badges'>;
export type BadgeUpdate = UpdateTables<'badges'>;

export type StudentBadgeRow = Tables<'student_badges'>;
export type StudentBadgeInsert = InsertTables<'student_badges'>;
export type StudentBadgeUpdate = UpdateTables<'student_badges'>;

export type Badge = BadgeRow;
export type StudentBadge = StudentBadgeRow;
