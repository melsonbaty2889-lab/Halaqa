// Src/types/halaqa.ts

export type HalaqaStatus = 'active' | 'paused';
export type TargetAudience = 'all' | 'kids' | 'males' | 'females';
export type TeachingType = 'online' | 'offline';
export type EducationalTrack = 'hifz' | 'muraja' | 'tilawa' | 'tajweed' | string;

export interface LocalizedText {
  ar?: string;
  en?: string;
  [key: string]: string | undefined;
}

export interface Halaqa {
  id: string;
  academy_id: string;
  teacher_id?: string | null;
  name: LocalizedText | Record<string, any>; // JSONB لاسم الحلقة بلغات متعددة
  description?: LocalizedText | Record<string, any> | null; // JSONB للوصف
  days_of_week?: string[] | null;
  start_time: string; // time without time zone
  end_time: string;   // time without time zone
  max_students?: number | null;
  min_students?: number | null;
  meeting_url?: string | null;
  meeting_platform?: string | null;
  status?: HalaqaStatus | string | null;
  target_audience?: TargetAudience | string | null;
  teaching_type?: TeachingType | string | null;
  educational_track?: EducationalTrack | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_archived: boolean;
  code?: string | null;
  language_code?: string | null;
  curriculum_id?: string | null;

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
