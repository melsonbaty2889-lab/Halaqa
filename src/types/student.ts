// src/types/student.ts

/**
 * الأنواع المحددة للجنس والحالة بناءً على قيود قاعدة البيانات (Supabase Constraints)
 */
export type StudentGender = 'male' | 'female';
export type StudentStatus = 'active' | 'inactive' | 'paused' | 'graduated';

/**
 * إعدادات الأكاديمية والخصوصية
 */
export interface AcademySettings {
  id: string;
  name: string;
  currency: string;
  calendar_type?: 'gregorian' | 'hijri';
  metadata?: {
    gender_policy?: 'separated' | 'mixed'; // سياسة الفصل بين الجنسين
    default_gender_view?: 'all' | 'male' | 'female'; // العرض الافتراضي للمركز
  };
}

/**
 * بيانات الحلقة المنسوب إليها الطالب (من جدول halaqas)
 */
export interface StudentHalaqa {
  id: string;
  name_ar: string;
  name_en?: string;
  target_audience: 'all' | 'kids' | 'males' | 'females';
}

/**
 * الواجهة الموحدة الشاملة لبيانات الطالب (Student Type)
 * مطابقة 100% لأعمدة جدول public.students في Supabase
 */
export interface Student {
  id: string;
  student_code?: string;
  academy_id: string;
  name: string;
  birth_date?: string;
  gender?: StudentGender;
  nationality?: string;
  country?: string;
  
  // بيانات التقدم والتسميع (Gamification & Progress)
  current_juz: number;
  current_quarter: number;
  current_quarter_index: number;
  points: number;
  level_score: number;
  last_test_score: number;
  
  // بيانات التواصل وولي الأمر
  parent_id?: string;
  parent_name?: string;
  parent_phone?: string;
  
  // بيانات الحلقة والحالة
  halaqa_id?: string;
  halaqas?: StudentHalaqa | null; // العلاقة المسترجعة من Supabase
  status: StudentStatus;
  is_archived: boolean;
  avatar_url?: string;
  notes?: string;
  
  // بيانات مالية خفيفة للعرض
  payment_status?: string;
  subscription_system?: string;
  
  created_at: string;
  updated_at?: string;
}

/**
 * شروط الفلترة والبحث لصفحة الطلاب (Filter Payload)
 */
export interface StudentFilters {
  searchTerm?: string;
  gender?: 'all' | 'male' | 'female';
  halaqaId?: string; // 'all' | 'none' | ID الحلقة
  status?: StudentStatus | 'all';
  isArchived: boolean;
}
