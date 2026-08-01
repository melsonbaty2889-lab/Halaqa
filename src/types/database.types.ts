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
          my_referral_code: string | null
          contact_email: string | null
          contact_phone: string | null
          website: string | null
          country_code: string | null
        }
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
          international_payout: Json | null
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
      }
      payments: {
        Row: {
          id: string
          academy_id: string
          student_id: string
          plan_id: string | null
          amount: number
          currency: string
          period_start: string | null
          period_end: string | null
          due_date: string
          paid_at: string | null
          status: string
          payment_method: string | null
          gateway_ref: string | null
          notes: string | null
          created_at: string
          updated_at: string
          invoice_number: string | null
          metadata: Json | null
          created_by: string | null
        }
      }
      attendance: {
        Row: {
          id: string
          academy_id: string
          halaqa_id: string
          student_id: string
          teacher_id: string | null
          date: string
          status: string
          retention_assignment: string | null
          new_memorization: string | null
          session_grade: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
          quarter_index: number | null
          juz: number | null
          quarter_in_hizb: number | null
        }
      }
    }
  }
}
