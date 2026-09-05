export type EmploymentType = 'salary' | 'hourly';
export type TeachingMode = 'online' | 'offline' | 'hybrid';
export type SalarySystem = 'monthly' | 'hourly' | 'per_student' | string;

export interface InternationalPayout {
  bank_name?: string;
  iban?: string;
  swift_code?: string;
  account_holder?: string;
  [key: string]: any;
}

export interface Teacher {
  id: string; // references profiles(id)
  user_id?: string | null; // references auth.users(id)
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  bio?: Record<string, any> | string | null;
  ijazas?: string[] | null;
  specialization?: string | null;
  experience_years: number;
  rating?: number | null;
  
  max_halaqas?: number | null;
  max_students?: number | null;
  teaching_mode?: TeachingMode | string | null;
  is_teaching?: boolean | null;
  is_active: boolean;
  is_archived: boolean;
  
  employment_type?: EmploymentType | string | null;
  salary_system?: SalarySystem | null;
  monthly_salary?: number | null;
  hourly_rate?: number | null;
  vodafone_cash?: string | null;
  instapay_id?: string | null;
  international_payout?: InternationalPayout | Record<string, any> | null;
  
  country?: string | null;
  timezone?: string | null;
  languages?: string[] | null;
  metadata?: Record<string, any> | null;
  
  created_at: string;
  updated_at?: string | null;

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
