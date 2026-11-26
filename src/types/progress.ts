/* src/types/progress.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type DailyProgressRow = Tables<'daily_progress'>;
export type DailyProgressInsert = InsertTables<'daily_progress'>;
export type DailyProgressUpdate = UpdateTables<'daily_progress'>;

export type StudentProgressRow = Tables<'student_progress'>;
export type StudentProgressInsert = InsertTables<'student_progress'>;
export type StudentProgressUpdate = UpdateTables<'student_progress'>;

export type StudentStreakRow = Tables<'student_streaks'>;
export type StudentStreakInsert = InsertTables<'student_streaks'>;
export type StudentStreakUpdate = UpdateTables<'student_streaks'>;

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export interface DailyProgress extends DailyProgressRow {}

export interface StudentProgress
  extends Omit<StudentProgressRow, 'status' | 'metadata'> {
  status?: ProgressStatus | string | null;
  metadata: Json;
}

export interface StudentStreak extends Omit<StudentStreakRow, 'metadata'> {
  metadata: Json;
}
