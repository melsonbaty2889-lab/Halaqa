export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          gender: string | null;
          preferred_language: string | null;
          is_activated: boolean | null;
          role: string | null;
          created_at: string;
          last_login_at: string | null;
          is_online: boolean;
          timezone: string | null;
          is_deleted: boolean;
          email: string | null;
          country_code: string | null;
          updated_at: string | null;
          metadata: Json | null;
          academy_id: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          gender?: string | null;
          preferred_language?: string | null;
          is_activated?: boolean | null;
          role?: string | null;
          created_at?: string;
          last_login_at?: string | null;
          is_online?: boolean;
          timezone?: string | null;
          is_deleted?: boolean;
          email?: string | null;
          country_code?: string | null;
          updated_at?: string | null;
          metadata?: Json | null;
          academy_id?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          gender?: string | null;
          preferred_language?: string | null;
          is_activated?: boolean | null;
          role?: string | null;
          created_at?: string;
          last_login_at?: string | null;
          is_online?: boolean;
          timezone?: string | null;
          is_deleted?: boolean;
          email?: string | null;
          country_code?: string | null;
          updated_at?: string | null;
          metadata?: Json | null;
          academy_id?: string | null;
        };
      };

          students: {
        Row: {
          id: string;
          student_code: string | null;
          academy_id: string;
          name: Json;
          birth_date: string | null;
          gender: string | null;
          nationality: string | null;
          parent_id: string | null;
          last_test_score: number | null;
          level_score: number | null;
          plan_id: string | null;
          last_payment_date: string | null;
          next_payment_date: string | null;
          payment_status: string | null;
          status: string;
          is_archived: boolean;
          notes: Json;
          added_by: string | null;
          created_at: string;
          updated_at: string | null;
          current_surah_id: number | null;
          avatar_url: string | null;
          current_quarter_index: number | null;
          current_juz: number | null;
          country: string | null;
          subscription_system: string | null;
          halaqa_id: string | null;
          points: number;
          last_activity_date: string | null;
          preferred_riwayah: string | null;
          memorization_system: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          student_code?: string | null;
          academy_id: string;
          name?: Json;
          birth_date?: string | null;
          gender?: string | null;
          nationality?: string | null;
          parent_id?: string | null;
          last_test_score?: number | null;
          level_score?: number | null;
          plan_id?: string | null;
          last_payment_date?: string | null;
          next_payment_date?: string | null;
          payment_status?: string | null;
          status?: string;
          is_archived?: boolean;
          notes?: Json;
          added_by?: string | null;
          created_at?: string;
          updated_at?: string | null;
          current_surah_id?: number | null;
          avatar_url?: string | null;
          current_quarter_index?: number | null;
          current_juz?: number | null;
          country?: string | null;
          subscription_system?: string | null;
          halaqa_id?: string | null;
          points?: number;
          last_activity_date?: string | null;
          preferred_riwayah?: string | null;
          memorization_system?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          student_code?: string | null;
          academy_id?: string;
          name?: Json;
          birth_date?: string | null;
          gender?: string | null;
          nationality?: string | null;
          parent_id?: string | null;
          last_test_score?: number | null;
          level_score?: number | null;
          plan_id?: string | null;
          last_payment_date?: string | null;
          next_payment_date?: string | null;
          payment_status?: string | null;
          status?: string;
          is_archived?: boolean;
          notes?: Json;
          added_by?: string | null;
          created_at?: string;
          updated_at?: string | null;
          current_surah_id?: number | null;
          avatar_url?: string | null;
          current_quarter_index?: number | null;
          current_juz?: number | null;
          country?: string | null;
          subscription_system?: string | null;
          halaqa_id?: string | null;
          points?: number;
          last_activity_date?: string | null;
          preferred_riwayah?: string | null;
          memorization_system?: string | null;
          user_id?: string | null;
        };
      };

          halaqas: {
        Row: {
          id: string;
          academy_id: string;
          teacher_id: string | null;
          description: Json | null;
          days_of_week: string[] | null;
          start_time: string;
          end_time: string;
          max_students: number | null;
          meeting_url: string | null;
          status: string | null;
          target_audience: string | null;
          teaching_type: string | null;
          educational_track: string | null;
          created_at: string;
          updated_at: string | null;
          is_archived: boolean;
          code: string | null;
          language_code: string | null;
          curriculum_id: string | null;
          min_students: number | null;
          meeting_platform: string | null;
          name: Json;
        };
        Insert: {
          id?: string;
          academy_id: string;
          teacher_id?: string | null;
          description?: Json | null;
          days_of_week?: string[] | null;
          start_time: string;
          end_time: string;
          max_students?: number | null;
          meeting_url?: string | null;
          status?: string | null;
          target_audience?: string | null;
          teaching_type?: string | null;
          educational_track?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_archived?: boolean;
          code?: string | null;
          language_code?: string | null;
          curriculum_id?: string | null;
          min_students?: number | null;
          meeting_platform?: string | null;
          name?: Json;
        };
        Update: {
          id?: string;
          academy_id?: string;
          teacher_id?: string | null;
          description?: Json | null;
          days_of_week?: string[] | null;
          start_time?: string;
          end_time?: string;
          max_students?: number | null;
          meeting_url?: string | null;
          status?: string | null;
          target_audience?: string | null;
          teaching_type?: string | null;
          educational_track?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_archived?: boolean;
          code?: string | null;
          language_code?: string | null;
          curriculum_id?: string | null;
          min_students?: number | null;
          meeting_platform?: string | null;
          name?: Json;
        };
      };

          attendance: {
        Row: {
          id: string;
          academy_id: string;
          halaqa_id: string;
          student_id: string;
          teacher_id: string | null;
          date: string;
          status: string;
          retention_assignment: string | null;
          new_memorization: string | null;
          session_grade: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string | null;
          quarter_index: number | null;
          juz: number | null;
          quarter_in_hizb: number | null;
          lesson_activity: string | null;
          session_id: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          halaqa_id: string;
          student_id: string;
          teacher_id?: string | null;
          date?: string;
          status: string;
          retention_assignment?: string | null;
          new_memorization?: string | null;
          session_grade?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
          quarter_index?: number | null;
          juz?: number | null;
          quarter_in_hizb?: number | null;
          lesson_activity?: string | null;
          session_id?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          halaqa_id?: string;
          student_id?: string;
          teacher_id?: string | null;
          date?: string;
          status?: string;
          retention_assignment?: string | null;
          new_memorization?: string | null;
          session_grade?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
          quarter_index?: number | null;
          juz?: number | null;
          quarter_in_hizb?: number | null;
          lesson_activity?: string | null;
          session_id?: string | null;
        };
      };

          certificates: {
        Row: {
          id: string;
          student_id: string;
          curriculum_id: string;
          verification_code: string;
          issued_at: string | null;
          pdf_url: string | null;
          issued_by: string | null;
          metadata: Json | null;
          certificate_type: string | null;
          qr_hash: string | null;
          verified_url: string | null;
          updated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          curriculum_id: string;
          verification_code: string;
          issued_at?: string | null;
          pdf_url?: string | null;
          issued_by?: string | null;
          metadata?: Json | null;
          certificate_type?: string | null;
          qr_hash?: string | null;
          verified_url?: string | null;
          updated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          curriculum_id?: string;
          verification_code?: string;
          issued_at?: string | null;
          pdf_url?: string | null;
          issued_by?: string | null;
          metadata?: Json | null;
          certificate_type?: string | null;
          qr_hash?: string | null;
          verified_url?: string | null;
          updated_at?: string | null;
          created_at?: string;
        };
      };

        payments: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          plan_id: string | null;
          amount: number;
          currency: string;
          period_start: string | null;
          period_end: string | null;
          due_date: string;
          paid_at: string | null;
          status: string;
          payment_method: string | null;
          gateway_ref: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          invoice_number: string | null;
          metadata: Json | null;
          created_by: string | null;
          month: string | null;
          receipt_url: string | null;
          exchange_rate: number;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          plan_id?: string | null;
          amount?: number;
          currency?: string;
          period_start?: string | null;
          period_end?: string | null;
          due_date?: string;
          paid_at?: string | null;
          status?: string;
          payment_method?: string | null;
          gateway_ref?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          invoice_number?: string | null;
          metadata?: Json | null;
          created_by?: string | null;
          month?: string | null;
          receipt_url?: string | null;
          exchange_rate?: number;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          plan_id?: string | null;
          amount?: number;
          currency?: string;
          period_start?: string | null;
          period_end?: string | null;
          due_date?: string;
          paid_at?: string | null;
          status?: string;
          payment_method?: string | null;
          gateway_ref?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          invoice_number?: string | null;
          metadata?: Json | null;
          created_by?: string | null;
          month?: string | null;
          receipt_url?: string | null;
          exchange_rate?: number;
        };
      };

            payment_plans: {
        Row: {
          id: string;
          academy_id: string;
          name: Json;
          price: number;
          currency: string;
          duration_days: number;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
          is_archived: boolean;
          color: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: Json;
          price?: number;
          currency?: string;
          duration_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
          is_archived?: boolean;
          color?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: Json;
          price?: number;
          currency?: string;
          duration_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
          is_archived?: boolean;
          color?: string | null;
          metadata?: Json | null;
        };
      };

            notification_logs: {
        Row: {
          id: string;
          academy_id: string;
          recipient_user_id: string | null;
          channel_used: string;
          status: string | null;
          sent_text: string;
          error_message: string | null;
          created_at: string;
          template_id: string | null;
          provider_message_id: string | null;
          provider: string | null;
          delivered_at: string | null;
          metadata: Json | null;
          rendered_content: string | null;
          template_data: Json | null;
          error_code: string | null;
          retry_count: number;
          priority: string;
          message_cost: number | null;
          read_at: string | null;
          locale_code: string | null;
          idempotency_key: string | null;
          student_id: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          recipient_user_id?: string | null;
          channel_used: string;
          status?: string | null;
          sent_text: string;
          error_message?: string | null;
          created_at?: string;
          template_id?: string | null;
          provider_message_id?: string | null;
          provider?: string | null;
          delivered_at?: string | null;
          metadata?: Json | null;
          rendered_content?: string | null;
          template_data?: Json | null;
          error_code?: string | null;
          retry_count?: number;
          priority?: string;
          message_cost?: number | null;
          read_at?: string | null;
          locale_code?: string | null;
          idempotency_key?: string | null;
          student_id?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          recipient_user_id?: string | null;
          channel_used?: string;
          status?: string | null;
          sent_text?: string;
          error_message?: string | null;
          created_at?: string;
          template_id?: string | null;
          provider_message_id?: string | null;
          provider?: string | null;
          delivered_at?: string | null;
          metadata?: Json | null;
          rendered_content?: string | null;
          template_data?: Json | null;
          error_code?: string | null;
          retry_count?: number;
          priority?: string;
          message_cost?: number | null;
          read_at?: string | null;
          locale_code?: string | null;
          idempotency_key?: string | null;
          student_id?: string | null;
        };
      };


            saas_coupon_redemptions: {
        Row: {
          id: string;
          coupon_id: string;
          academy_id: string;
          subscription_id: string | null;
          discount_applied: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          coupon_id: string;
          academy_id: string;
          subscription_id?: string | null;
          discount_applied: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          coupon_id?: string;
          academy_id?: string;
          subscription_id?: string | null;
          discount_applied?: number;
          created_at?: string;
        };
      };


            student_badges: {
        Row: {
          id: string;
          student_id: string;
          badge_id: string;
          unlocked_at: string | null;
          academy_id: string | null;
          awarded_by: string | null;
          reason: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          is_archived: boolean;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          badge_id: string;
          unlocked_at?: string | null;
          academy_id?: string | null;
          awarded_by?: string | null;
          reason?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          is_archived?: boolean;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          badge_id?: string;
          unlocked_at?: string | null;
          academy_id?: string | null;
          awarded_by?: string | null;
          reason?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          is_archived?: boolean;
          deleted_at?: string | null;
        };
      };
    };
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

    
