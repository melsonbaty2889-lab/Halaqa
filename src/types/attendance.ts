/* src/types/attendance.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type AttendanceRow = Tables<'attendance'>;
export type AttendanceInsert = InsertTables<'attendance'>;
export type AttendanceUpdate = UpdateTables<'attendance'>;

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance extends Omit<AttendanceRow, 'status'> {
  status: AttendanceStatus | string;

  // العلاقات المجلوبة (Joined Relations)
  students?: {
    id: string;
    name?: Json | string | null;
  } | null;
  halaqas?: {
    id: string;
    name?: Json | null;
  } | null;
  teachers?: {
    id: string;
    name?: string | null;
  } | null;
}

export interface AttendanceFilters {
  halaqa_id?: string;
  student_id?: string;
  status?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}
