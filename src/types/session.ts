/* src/types/session.ts */

import type { Tables, InsertTables, UpdateTables } from './database.types';

export type AttendanceSessionRow = Tables<'attendance_sessions'>;
export type AttendanceSessionInsert = InsertTables<'attendance_sessions'>;
export type AttendanceSessionUpdate = UpdateTables<'attendance_sessions'>;

export type TeacherAvailabilityRow = Tables<'teacher_availability'>;
export type TeacherAvailabilityInsert = InsertTables<'teacher_availability'>;
export type TeacherAvailabilityUpdate = UpdateTables<'teacher_availability'>;
