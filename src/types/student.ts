import { Json } from './database.types';

export type StudentGender = 'male' | 'female';
export type StudentStatus = 'active' | 'inactive' | 'paused' | 'graduated';

export interface Student {
  id: string;
  student_code?: string | null;
  academy_id: string;
  name: Json; // دعم اللغات المتعددة (JSONB)
  birth_date?: string | null;
  gender?: StudentGender | null;
  nationality?: string | null;
  country?: string | null;

  // بيانات التقدم والتسميع
  current_juz?: number | null;
  current_quarter?: number | null;
  current_quarter_index?: number | null;
  current_surah_id?: number | null;
  points?: number | null;
  level_score?: number | null;
  last_test_score?: number | null;

  // بيانات التواصل وولي الأمر
  parent_id?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;

  // بيانات الحلقة والحالة
  halaqa_id?: string | null;
  status?: StudentStatus | null;
  is_archived?: boolean | null;
  avatar_url?: string | null;
  notes?: Json | null;

  // بيانات مالية
  plan_id?: string | null;
  payment_status?: string | null;
  subscription_system?: string | null;
  last_payment_date?: string | null;
  next_payment_date?: string | null;

  added_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface StudentFilters {
  searchTerm?: string;
  gender?: 'all' | StudentGender;
  halaqaId?: string;
  status?: 'all' | StudentStatus;
  isArchived?: boolean;
}
