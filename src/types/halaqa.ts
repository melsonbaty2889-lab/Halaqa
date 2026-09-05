export type HalaqaStatus = 'active' | 'paused';
export type TargetAudience = 'all' | 'kids' | 'males' | 'females';
export type TeachingType = 'online' | 'offline';

export interface Halaqa {
  id: string;
  academy_id: string;
  teacher_id?: string | null;
  description?: Record<string, any> | null; // JSONB للوصف
  days_of_week?: string[] | null;
  start_time: string; // time without time zone
  end_time: string;   // time without time zone
  max_students?: number | null;
  meeting_url?: string | null;
  status?: HalaqaStatus | string | null;
  target_audience?: TargetAudience | string | null;
  teaching_type?: TeachingType | string | null;
  educational_track?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_archived: boolean;
  code?: string | null;
  language_code?: string | null;
  curriculum_id?: string | null;
  min_students?: number | null;
  meeting_platform?: string | null;
  name: Record<string, any>; // JSONB لاسم الحلقة بلغات متعددة

  // العلاقات المجلوبة (Joined Relations)
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
