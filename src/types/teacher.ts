export type EmploymentType = 'salary' | 'hourly';
export type TeachingMode = 'online' | 'offline' | 'hybrid';

export interface Teacher {
  id: string; // references profiles(id)
  bio?: Record<string, any> | null;
  ijazas?: string[] | null;
  max_halaqas?: number | null;
  rating?: number | null;
  employment_type?: EmploymentType | string | null;
  monthly_salary?: number | null;
  hourly_rate?: number | null;
  vodafone_cash?: string | null;
  instapay_id?: string | null;
  international_payout?: Record<string, any> | null;
  created_at: string;
  is_archived: boolean;
  country?: string | null;
  timezone?: string | null;
  languages?: string[] | null;
  experience_years: number;
  updated_at?: string | null;
  is_active: boolean;
  specialization?: string | null;
  teaching_mode?: TeachingMode | string | null;
  max_students?: number | null;
  metadata?: Record<string, any> | null;
  name?: string | null;
  phone?: string | null;
  salary_system?: string | null;
  user_id?: string | null; // references auth.users(id)
  email?: string | null;
  title?: string | null;
  is_teaching?: boolean | null;

  // Foreign key relation from profiles
  profiles?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

export interface TeacherFilters {
  searchTerm: string;
  is_active?: boolean | 'all';
  is_archived: boolean;
  teaching_mode?: string;
  specialization?: string;
}
