export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  academy_id: string;
  halaqa_id: string;
  student_id: string;
  teacher_id?: string | null;
  date: string; // date format YYYY-MM-DD
  status: AttendanceStatus | string;
  retention_assignment?: string | null;
  new_memorization?: string | null;
  session_grade?: number | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  quarter_index?: number | null;
  juz?: number | null;
  quarter_in_hizb?: number | null;

  // العلاقات المجلوبة (Joined Relations)
  students?: {
    id: string;
    name?: Record<string, any> | string | null;
  } | null;
  halaqas?: {
    id: string;
    name?: Record<string, any> | null;
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
