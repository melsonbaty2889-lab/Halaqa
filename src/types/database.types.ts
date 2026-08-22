export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      academies: {
        Row: {
          id: string
          name: Json
          slug: string
          currency: string | null
          timezone: string | null
          language_code: string | null
          is_active: boolean | null
          owner_id: string | null
          trial_ends_at: string | null
          logo_url: string | null
          weekend_days: string[] | null
          calendar_type: string | null
          custom_domain: string | null
          metadata: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['academies']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['academies']['Row']>
      }
      students: {
        Row: {
          id: string
          student_code: string | null
          academy_id: string
          name: Json
          birth_date: string | null
          gender: string | null
          nationality: string | null
          parent_id: string | null
          current_quarter: number | null
          last_test_score: number | null
          level_score: number | null
          plan_id: string | null
          last_payment_date: string | null
          next_payment_date: string | null
          payment_status: string | null
          status: string | null
          is_archived: boolean | null
          notes: Json | null
          added_by: string | null
          created_at: string
          updated_at: string | null
          current_surah_id: number | null
          avatar_url: string | null
          current_quarter_index: number | null
          current_juz: number | null
          parent_name: string | null
          parent_phone: string | null
          country: string | null
          subscription_system: string | null
          halaqa_id: string | null
          points: number | null
        }
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['students']['Row']>
      }
      teachers: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          bio: Json | null
          ijazas: string[] | null
          max_halaqas: number | null
          rating: number | null
          employment_type: string | null
          monthly_salary: number | null
          hourly_rate: number | null
          vodafone_cash: string | null
          instapay_id: string | null
          created_at: string
          is_archived: boolean
          country: string | null
          timezone: string | null
          languages: string[] | null
          experience_years: number
          updated_at: string | null
          is_active: boolean
          specialization: string | null
          teaching_mode: string | null
          max_students: number | null
          metadata: Json | null
          salary_system: string | null
        }
        Insert: Omit<Database['public']['Tables']['teachers']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['teachers']['Row']>
      }
      halaqas: {
        Row: {
          id: string
          academy_id: string
          teacher_id: string | null
          name: Json
          description: Json | null
          days_of_week: string[] | null
          start_time: string
          end_time: string
          max_students: number | null
          meeting_url: string | null
          status: string | null
          target_audience: string | null
          teaching_type: string | null
          educational_track: string | null
          created_at: string | null
          updated_at: string | null
          is_archived: boolean
          code: string | null
          language_code: string | null
          curriculum_id: string | null
          min_students: number | null
          meeting_platform: string | null
        }
        Insert: Omit<Database['public']['Tables']['halaqas']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string | null
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['halaqas']['Row']>
      }
      profiles: {
        Row: {
          id: string
          full_name: Json
          phone: string | null
          avatar_url: string | null
          gender: string | null
          preferred_language: string | null
          is_activated: boolean | null
          role: string | null
          created_at: string | null
          last_login_at: string | null
          is_online: boolean
          timezone: string | null
          is_deleted: boolean
          email: string | null
          country_code: string | null
          updated_at: string | null
          metadata: Json | null
          academy_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string | null
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
    }
  }
}

// Helper Types للاستيراد المباشر للأنواع
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']> = Database['public'];
