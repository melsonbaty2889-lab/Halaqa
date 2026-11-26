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
          // ==========================================
    // 1. Users, Roles & Auth
    // ==========================================
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
    // ==========================================
    // 2. Students, Parents & Guardians
    // ==========================================
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
          parents: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          phone: string;
          profile_id: string | null;
          created_at: string;
          updated_at: string | null;
          email: string | null;
          country_code: string | null;
          preferred_language: string | null;
          metadata: Json | null;
          is_active: boolean;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          phone: string;
          profile_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          email?: string | null;
          country_code?: string | null;
          preferred_language?: string | null;
          metadata?: Json | null;
          is_active?: boolean;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          phone?: string;
          profile_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
          email?: string | null;
          country_code?: string | null;
          preferred_language?: string | null;
          metadata?: Json | null;
          is_active?: boolean;
          created_by?: string | null;
        };
      };
          student_guardians: {
        Row: {
          id: string;
          student_id: string;
          parent_id: string;
          relationship_type: string;
          can_pay: boolean;
          can_view_reports: boolean;
          created_at: string;
          updated_at: string;
          can_receive_notifications: boolean;
          can_pickup_student: boolean;
          metadata: Json;
          is_primary: boolean;
        };
        Insert: {
          id?: string;
          student_id: string;
          parent_id: string;
          relationship_type?: string;
          can_pay?: boolean;
          can_view_reports?: boolean;
          created_at?: string;
          updated_at?: string;
          can_receive_notifications?: boolean;
          can_pickup_student?: boolean;
          metadata?: Json;
          is_primary?: boolean;
        };
        Update: {
          id?: string;
          student_id?: string;
          parent_id?: string;
          relationship_type?: string;
          can_pay?: boolean;
          can_view_reports?: boolean;
          created_at?: string;
          updated_at?: string;
          can_receive_notifications?: boolean;
          can_pickup_student?: boolean;
          metadata?: Json;
          is_primary?: boolean;
        };
      };


      
                // ==========================================
      // 3. Academies & Teachers
      // ==========================================
          academies: {
        Row: {
          id: string;
          name: Json;
          slug: string;
          currency: string | null;
          timezone: string | null;
          language_code: string | null;
          is_active: boolean | null;
          owner_id: string;
          logo_url: string | null;
          weekend_days: string[] | null;
          calendar_type: string | null;
          custom_domain: string | null;
          created_at: string;
          updated_at: string | null;
          my_referral_code: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          website: string | null;
          country_code: string | null;
          brand_color: string | null;
          learning_type: string | null;
          default_qiraat: string | null;
          teaching_methodology: string | null;
          tagline: string | null;
          description: string | null;
          allow_self_registration: boolean | null;
          require_approval: boolean | null;
          max_students_per_group: number | null;
          blocked_reason: string | null;
          mistake_weight: number | null;
          deleted_at: string | null;
          assignment_mode: string | null;
        };
        Insert: {
          id?: string;
          name: Json;
          slug: string;
          currency?: string | null;
          timezone?: string | null;
          language_code?: string | null;
          is_active?: boolean | null;
          owner_id: string;
          logo_url?: string | null;
          weekend_days?: string[] | null;
          calendar_type?: string | null;
          custom_domain?: string | null;
          created_at?: string;
          updated_at?: string | null;
          my_referral_code?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          website?: string | null;
          country_code?: string | null;
          brand_color?: string | null;
          learning_type?: string | null;
          default_qiraat?: string | null;
          teaching_methodology?: string | null;
          tagline?: string | null;
          description?: string | null;
          allow_self_registration?: boolean | null;
          require_approval?: boolean | null;
          max_students_per_group?: number | null;
          blocked_reason?: string | null;
          mistake_weight?: number | null;
          deleted_at?: string | null;
          assignment_mode?: string | null;
        };
        Update: {
          id?: string;
          name?: Json;
          slug?: string;
          currency?: string | null;
          timezone?: string | null;
          language_code?: string | null;
          is_active?: boolean | null;
          owner_id?: string;
          logo_url?: string | null;
          weekend_days?: string[] | null;
          calendar_type?: string | null;
          custom_domain?: string | null;
          created_at?: string;
          updated_at?: string | null;
          my_referral_code?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          website?: string | null;
          country_code?: string | null;
          brand_color?: string | null;
          learning_type?: string | null;
          default_qiraat?: string | null;
          teaching_methodology?: string | null;
          tagline?: string | null;
          description?: string | null;
          allow_self_registration?: boolean | null;
          require_approval?: boolean | null;
          max_students_per_group?: number | null;
          blocked_reason?: string | null;
          mistake_weight?: number | null;
          deleted_at?: string | null;
          assignment_mode?: string | null;
        };
      };
          teachers: {
        Row: {
          id: string;
          bio: Json | null;
          ijazas: string[] | null;
          max_halaqas: number | null;
          rating: number | null;
          employment_type: string | null;
          monthly_salary: number | null;
          hourly_rate: number | null;
          instapay_id: string | null;
          international_payout: Json | null;
          created_at: string;
          is_archived: boolean;
          country: string | null;
          timezone: string | null;
          languages: string[] | null;
          experience_years: number;
          updated_at: string | null;
          is_active: boolean;
          specialization: string | null;
          teaching_mode: string | null;
          max_students: number | null;
          metadata: Json | null;
          name: string | null;
          phone: string | null;
          user_id: string | null;
          email: string | null;
          is_teaching: boolean;
          academy_id: string | null;
          mobile_wallet: string | null;
        };
        Insert: {
          id?: string;
          bio?: Json | null;
          ijazas?: string[] | null;
          max_halaqas?: number | null;
          rating?: number | null;
          employment_type?: string | null;
          monthly_salary?: number | null;
          hourly_rate?: number | null;
          instapay_id?: string | null;
          international_payout?: Json | null;
          created_at?: string;
          is_archived?: boolean;
          country?: string | null;
          timezone?: string | null;
          languages?: string[] | null;
          experience_years?: number;
          updated_at?: string | null;
          is_active?: boolean;
          specialization?: string | null;
          teaching_mode?: string | null;
          max_students?: number | null;
          metadata?: Json | null;
          name?: string | null;
          phone?: string | null;
          user_id?: string | null;
          email?: string | null;
          is_teaching?: boolean;
          academy_id?: string | null;
          mobile_wallet?: string | null;
        };
        Update: {
          id?: string;
          bio?: Json | null;
          ijazas?: string[] | null;
          max_halaqas?: number | null;
          rating?: number | null;
          employment_type?: string | null;
          monthly_salary?: number | null;
          hourly_rate?: number | null;
          instapay_id?: string | null;
          international_payout?: Json | null;
          created_at?: string;
          is_archived?: boolean;
          country?: string | null;
          timezone?: string | null;
          languages?: string[] | null;
          experience_years?: number;
          updated_at?: string | null;
          is_active?: boolean;
          specialization?: string | null;
          teaching_mode?: string | null;
          max_students?: number | null;
          metadata?: Json | null;
          name?: string | null;
          phone?: string | null;
          user_id?: string | null;
          email?: string | null;
          is_teaching?: boolean;
          academy_id?: string | null;
          mobile_wallet?: string | null;
        };
      };




      
            // ==========================================
      // 4. Exams, Badges & Attendance
      // ==========================================
          exams: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          teacher_id: string | null;
          halaqa_id: string | null;
          exam_type: string;
          from_surah_id: number | null;
          to_surah_id: number | null;
          from_ayah: number | null;
          to_ayah: number | null;
          date: string;
          mistakes: number | null;
          prompts: number | null;
          tajweed_grade: string | null;
          final_score: number | null;
          max_score: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          curriculum_item_id: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          teacher_id?: string | null;
          halaqa_id?: string | null;
          exam_type?: string;
          from_surah_id?: number | null;
          to_surah_id?: number | null;
          from_ayah?: number | null;
          to_ayah?: number | null;
          date?: string;
          mistakes?: number | null;
          prompts?: number | null;
          tajweed_grade?: string | null;
          final_score?: number | null;
          max_score?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          curriculum_item_id?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          teacher_id?: string | null;
          halaqa_id?: string | null;
          exam_type?: string;
          from_surah_id?: number | null;
          to_surah_id?: number | null;
          from_ayah?: number | null;
          to_ayah?: number | null;
          date?: string;
          mistakes?: number | null;
          prompts?: number | null;
          tajweed_grade?: string | null;
          final_score?: number | null;
          max_score?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          curriculum_item_id?: string | null;
        };
      };
          badges: {
        Row: {
          id: string;
          academy_id: string;
          icon_url: string | null;
          points_rewarded: number | null;
          is_active: boolean;
          titles: Json;
          descriptions: Json | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          icon_url?: string | null;
          points_rewarded?: number | null;
          is_active?: boolean;
          titles?: Json;
          descriptions?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          icon_url?: string | null;
          points_rewarded?: number | null;
          is_active?: boolean;
          titles?: Json;
          descriptions?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };


      
                // ==========================================
      // 5. Curricula, Quran & Progress
      // ==========================================
          curricula: {
        Row: {
          id: string;
          academy_id: string;
          description: Json | null;
          is_active: boolean | null;
          created_at: string;
          category: string | null;
          code: string | null;
          title: Json;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          description?: Json | null;
          is_active?: boolean | null;
          created_at?: string;
          category?: string | null;
          code?: string | null;
          title?: Json;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          description?: Json | null;
          is_active?: boolean | null;
          created_at?: string;
          category?: string | null;
          code?: string | null;
          title?: Json;
          updated_at?: string | null;
        };
      };
          curriculum_items: {
        Row: {
          id: string;
          level_id: string;
          title: Json;
          item_type: string;
          reference_id: string | null;
          order_index: number;
          metadata: Json;
          content_type: string;
          surah_number: number | null;
          from_ayah: number | null;
          to_ayah: number | null;
          book_name: string | null;
          chapter_number: number | null;
          from_page: number | null;
          to_page: number | null;
          estimated_duration: number | null;
          updated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          level_id: string;
          title?: Json;
          item_type?: string;
          reference_id?: string | null;
          order_index?: number;
          metadata?: Json;
          content_type?: string;
          surah_number?: number | null;
          from_ayah?: number | null;
          to_ayah?: number | null;
          book_name?: string | null;
          chapter_number?: number | null;
          from_page?: number | null;
          to_page?: number | null;
          estimated_duration?: number | null;
          updated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          level_id?: string;
          title?: Json;
          item_type?: string;
          reference_id?: string | null;
          order_index?: number;
          metadata?: Json;
          content_type?: string;
          surah_number?: number | null;
          from_ayah?: number | null;
          to_ayah?: number | null;
          book_name?: string | null;
          chapter_number?: number | null;
          from_page?: number | null;
          to_page?: number | null;
          estimated_duration?: number | null;
          updated_at?: string | null;
          created_at?: string;
        };
      };
          curriculum_levels: {
        Row: {
          id: string;
          curriculum_id: string;
          order_index: number;
          passing_score: number;
          title: Json;
          updated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          curriculum_id: string;
          order_index?: number;
          passing_score?: number;
          title?: Json;
          updated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          curriculum_id?: string;
          order_index?: number;
          passing_score?: number;
          title?: Json;
          updated_at?: string | null;
          created_at?: string;
        };
      };




      
      notifications: {
        Row: {
          id: string;
          academy_id: string | null;
          user_id: string | null;
          title: Json;
          message: Json | null;
          is_read: boolean | null;
          notification_type: string | null;
          created_at: string;
          action_url: string | null;
          entity_type: string | null;
          entity_id: string | null;
          read_at: string | null;
          metadata: Json | null;
          is_archived: boolean;
          priority: string | null;
        };
        Insert: {
          id?: string;
          academy_id?: string | null;
          user_id?: string | null;
          title: Json;
          message?: Json | null;
          is_read?: boolean | null;
          notification_type?: string | null;
          created_at?: string;
          action_url?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          read_at?: string | null;
          metadata?: Json | null;
          is_archived?: boolean;
          priority?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string | null;
          user_id?: string | null;
          title?: Json;
          message?: Json | null;
          is_read?: boolean | null;
          notification_type?: string | null;
          created_at?: string;
          action_url?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          read_at?: string | null;
          metadata?: Json | null;
          is_archived?: boolean;
          priority?: string | null;
        };
      };
      notification_templates: {
        Row: {
          id: string;
          academy_id: string;
          trigger_event: string;
          locale_code: string | null;
          title: string | null;
          template_body: string;
          channels: string[] | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string | null;
          template_name: string | null;
          description: string | null;
          available_variables: Json | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          trigger_event: string;
          locale_code?: string | null;
          title?: string | null;
          template_body: string;
          channels?: string[] | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string | null;
          template_name?: string | null;
          description?: string | null;
          available_variables?: Json | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          trigger_event?: string;
          locale_code?: string | null;
          title?: string | null;
          template_body?: string;
          channels?: string[] | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string | null;
          template_name?: string | null;
          description?: string | null;
          available_variables?: Json | null;
        };
      };

            daily_progress: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          teacher_id: string | null;
          halaqa_id: string | null;
          date: string;
          hifz_from_ayah: number | null;
          hifz_to_ayah: number | null;
          review_from_ayah: number | null;
          review_to_ayah: number | null;
          grade: string | null;
          mistakes_count: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
          hifz_surah_id: number | null;
          review_surah_id: number | null;
          riwayah: string | null;
          system_type: string | null;
          looh_notes: string | null;
          ai_feedback_score: number | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          teacher_id?: string | null;
          halaqa_id?: string | null;
          date?: string;
          hifz_from_ayah?: number | null;
          hifz_to_ayah?: number | null;
          review_from_ayah?: number | null;
          review_to_ayah?: number | null;
          grade?: string | null;
          mistakes_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          hifz_surah_id?: number | null;
          review_surah_id?: number | null;
          riwayah?: string | null;
          system_type?: string | null;
          looh_notes?: string | null;
          ai_feedback_score?: number | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          teacher_id?: string | null;
          halaqa_id?: string | null;
          date?: string;
          hifz_from_ayah?: number | null;
          hifz_to_ayah?: number | null;
          review_from_ayah?: number | null;
          review_to_ayah?: number | null;
          grade?: string | null;
          mistakes_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          hifz_surah_id?: number | null;
          review_surah_id?: number | null;
          riwayah?: string | null;
          system_type?: string | null;
          looh_notes?: string | null;
          ai_feedback_score?: number | null;
        };
      };
      student_progress: {
        Row: {
          id: string;
          student_id: string;
          item_id: string;
          status: string | null;
          score: number | null;
          notes: string | null;
          completed_at: string | null;
          updated_at: string | null;
          academy_id: string;
          teacher_id: string | null;
          started_at: string | null;
          metadata: Json;
          is_archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          item_id: string;
          status?: string | null;
          score?: number | null;
          notes?: string | null;
          completed_at?: string | null;
          updated_at?: string | null;
          academy_id: string;
          teacher_id?: string | null;
          started_at?: string | null;
          metadata?: Json;
          is_archived?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          item_id?: string;
          status?: string | null;
          score?: number | null;
          notes?: string | null;
          completed_at?: string | null;
          updated_at?: string | null;
          academy_id?: string;
          teacher_id?: string | null;
          started_at?: string | null;
          metadata?: Json;
          is_archived?: boolean;
          created_at?: string;
        };
      };
      student_streaks: {
        Row: {
          id: string;
          student_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string;
          updated_at: string | null;
          academy_id: string;
          total_active_days: number;
          metadata: Json;
          created_at: string;
          is_archived: boolean;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string;
          updated_at?: string | null;
          academy_id: string;
          total_active_days?: number;
          metadata?: Json;
          created_at?: string;
          is_archived?: boolean;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string;
          updated_at?: string | null;
          academy_id?: string;
          total_active_days?: number;
          metadata?: Json;
          created_at?: string;
          is_archived?: boolean;
          deleted_at?: string | null;
        };
      };
      surahs: {
        Row: {
          id: number;
          number: number;
          name_ar: string;
          name_en: string;
          ayah_count: number;
          juz_number: number;
          page_start: number;
          page_end: number;
          name_uthmani: string;
          revelation_type: string;
          hizb_start: number;
          hizb_end: number;
          rub_el_hizb_start: number;
          rub_el_hizb_end: number;
          is_sajdah: boolean;
          sajdah_ayah: number | null;
          bismillah_number: number;
          names_localized: Json;
        };
        Insert: {
          id: number;
          number: number;
          name_ar: string;
          name_en: string;
          ayah_count: number;
          juz_number: number;
          page_start: number;
          page_end: number;
          name_uthmani: string;
          revelation_type: string;
          hizb_start: number;
          hizb_end: number;
          rub_el_hizb_start: number;
          rub_el_hizb_end: number;
          is_sajdah?: boolean;
          sajdah_ayah?: number | null;
          bismillah_number?: number;
          names_localized?: Json;
        };
        Update: {
          id?: number;
          number?: number;
          name_ar?: string;
          name_en?: string;
          ayah_count?: number;
          juz_number?: number;
          page_start?: number;
          page_end?: number;
          name_uthmani?: string;
          revelation_type?: string;
          hizb_start?: number;
          hizb_end?: number;
          rub_el_hizb_start?: number;
          rub_el_hizb_end?: number;
          is_sajdah?: boolean;
          sajdah_ayah?: number | null;
          bismillah_number?: number;
          names_localized?: Json;
        };
      };
      ayahs: {
        Row: {
          id: number;
          surah_id: number;
          surah_number: number;
          ayah_number_in_surah: number;
          ayah_number_global: number;
          text_uthmani: string;
          text_imlaei: string;
          page_number: number;
          juz_number: number;
          hizb_number: number;
          rub_el_hizb_number: number;
          is_sajdah: boolean;
        };
        Insert: {
          id: number;
          surah_id: number;
          surah_number: number;
          ayah_number_in_surah: number;
          ayah_number_global: number;
          text_uthmani: string;
          text_imlaei: string;
          page_number: number;
          juz_number: number;
          hizb_number: number;
          rub_el_hizb_number: number;
          is_sajdah?: boolean;
        };
        Update: {
          id?: number;
          surah_id?: number;
          surah_number?: number;
          ayah_number_in_surah?: number;
          ayah_number_global?: number;
          text_uthmani?: string;
          text_imlaei?: string;
          page_number?: number;
          juz_number?: number;
          hizb_number?: number;
          rub_el_hizb_number?: number;
          is_sajdah?: boolean;
        };
      };
      ai_recitation_logs: {
        Row: {
          id: string;
          academy_id: string | null;
          student_id: string | null;
          surah_id: number | null;
          audio_url: string | null;
          ai_transcript: string | null;
          mistakes_detected: Json | null;
          accuracy_score: number | null;
          created_at: string;
          status: string | null;
          teacher_notes: string | null;
          confidence_score: number | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id?: string | null;
          student_id?: string | null;
          surah_id?: number | null;
          audio_url?: string | null;
          ai_transcript?: string | null;
          mistakes_detected?: Json | null;
          accuracy_score?: number | null;
          created_at?: string;
          status?: string | null;
          teacher_notes?: string | null;
          confidence_score?: number | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string | null;
          student_id?: string | null;
          surah_id?: number | null;
          audio_url?: string | null;
          ai_transcript?: string | null;
          mistakes_detected?: Json | null;
          accuracy_score?: number | null;
          created_at?: string;
          status?: string | null;
          teacher_notes?: string | null;
          confidence_score?: number | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };

                // ==========================================
      // 6. Relations, Documents & Certificates
      // ==========================================
          student_halaqas: {
        Row: {
          id: string;
          academy_id: string;
          student_id: string;
          halaqa_id: string;
          joined_at: string;
          left_at: string | null;
          status: string;
          created_at: string;
          updated_at: string | null;
          leave_reason: string | null;
          changed_by: string | null;
          notes: string | null;
          is_archived: boolean;
          deleted_at: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          academy_id: string;
          student_id: string;
          halaqa_id: string;
          joined_at?: string;
          left_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          leave_reason?: string | null;
          changed_by?: string | null;
          notes?: string | null;
          is_archived?: boolean;
          deleted_at?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          academy_id?: string;
          student_id?: string;
          halaqa_id?: string;
          joined_at?: string;
          left_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          leave_reason?: string | null;
          changed_by?: string | null;
          notes?: string | null;
          is_archived?: boolean;
          deleted_at?: string | null;
          metadata?: Json;
        };
      };
          academy_teachers: {
        Row: {
          id: string;
          academy_id: string;
          teacher_id: string;
          is_active: boolean | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          teacher_id: string;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          teacher_id?: string;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
          files: {
        Row: {
          id: string;
          academy_id: string;
          file_url: string;
          file_name: string;
          file_size: number;
          created_by: string | null;
          created_at: string;
          mime_type: string;
          bucket_name: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          file_url: string;
          file_name: string;
          file_size?: number;
          created_by?: string | null;
          created_at?: string;
          mime_type?: string;
          bucket_name?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          file_url?: string;
          file_name?: string;
          file_size?: number;
          created_by?: string | null;
          created_at?: string;
          mime_type?: string;
          bucket_name?: string;
        };
      };
          academy_documents: {
        Row: {
          id: string;
          academy_id: string;
          file_url: string;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
          document_type: string;
          uploaded_by: string | null;
          uploaded_at: string | null;
          notes: string | null;
          metadata: Json;
          expires_at: string | null;
          status: string;
          updated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          file_url: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          document_type: string;
          uploaded_by?: string | null;
          uploaded_at?: string | null;
          notes?: string | null;
          metadata?: Json;
          expires_at?: string | null;
          status?: string;
          updated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          file_url?: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          document_type?: string;
          uploaded_by?: string | null;
          uploaded_at?: string | null;
          notes?: string | null;
          metadata?: Json;
          expires_at?: string | null;
          status?: string;
          updated_at?: string | null;
          created_at?: string;
        };
      };
      student_documents: {
        Row: {
          id: string;
          academy_id: string | null;
          student_id: string;
          file_url: string;
          document_type: string;
          uploaded_at: string;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
          uploaded_by: string | null;
          notes: string | null;
          metadata: Json;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id?: string | null;
          student_id: string;
          file_url: string;
          document_type: string;
          uploaded_at?: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_by?: string | null;
          notes?: string | null;
          metadata?: Json;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string | null;
          student_id?: string;
          file_url?: string;
          document_type?: string;
          uploaded_at?: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_by?: string | null;
          notes?: string | null;
          metadata?: Json;
          updated_at?: string;
          created_at?: string;
        };
      };
      teacher_documents: {
        Row: {
          id: string;
          academy_id: string;
          teacher_id: string;
          file_url: string;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
          document_type: string;
          uploaded_by: string | null;
          uploaded_at: string | null;
          notes: string | null;
          metadata: Json;
          expires_at: string | null;
          verification_status: string;
          rejection_reason: string | null;
          deleted_at: string | null;
          updated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          teacher_id: string;
          file_url: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          document_type: string;
          uploaded_by?: string | null;
          uploaded_at?: string | null;
          notes?: string | null;
          metadata?: Json;
          expires_at?: string | null;
          verification_status?: string;
          rejection_reason?: string | null;
          deleted_at?: string | null;
          updated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          teacher_id?: string;
          file_url?: string;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          document_type?: string;
          uploaded_by?: string | null;
          uploaded_at?: string | null;
          notes?: string | null;
          metadata?: Json;
          expires_at?: string | null;
          verification_status?: string;
          rejection_reason?: string | null;
          deleted_at?: string | null;
          updated_at?: string | null;
          created_at?: string;
        };
      };

                  // ==========================================
      // 7. Subscriptions, Payments & Settings
      // ==========================================
          attendance_sessions: {
        Row: {
          id: string;
          academy_id: string;
          halaqa_id: string;
          session_date: string;
          session_notes: string | null;
          created_at: string;
          created_in_timezone: string | null;
          teacher_id: string | null;
          updated_at: string | null;
          session_type: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          halaqa_id: string;
          session_date?: string;
          session_notes?: string | null;
          created_at?: string;
          created_in_timezone?: string | null;
          teacher_id?: string | null;
          updated_at?: string | null;
          session_type?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          halaqa_id?: string;
          session_date?: string;
          session_notes?: string | null;
          created_at?: string;
          created_in_timezone?: string | null;
          teacher_id?: string | null;
          updated_at?: string | null;
          session_type?: string | null;
        };
      };
      teacher_availability: {
        Row: {
          id: string;
          teacher_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          academy_id: string | null;
          is_active: boolean;
          timezone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string | null;
          is_archived: boolean;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          academy_id?: string | null;
          is_active?: boolean;
          timezone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          day_of_week?: string;
          start_time?: string;
          end_time?: string;
          academy_id?: string | null;
          is_active?: boolean;
          timezone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
        };
      };
      saas_subscriptions: {
        Row: {
          id: string;
          academy_id: string;
          payer_id: string;
          plan_duration: string;
          status: string;
          trial_ends_at: string | null;
          expires_at: string;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          payment_gateway: string | null;
          gateway_subscription_id: string | null;
          gateway_customer_id: string | null;
          created_at: string;
          updated_at: string;
          price: number;
          currency: string;
          starts_at: string;
          metadata: Json;
          last_payment_attempt_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          payer_id: string;
          plan_duration?: string;
          status?: string;
          trial_ends_at?: string | null;
          expires_at: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          payment_gateway?: string | null;
          gateway_subscription_id?: string | null;
          gateway_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
          price?: number;
          currency?: string;
          starts_at?: string;
          metadata?: Json;
          last_payment_attempt_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          payer_id?: string;
          plan_duration?: string;
          status?: string;
          trial_ends_at?: string | null;
          expires_at?: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          payment_gateway?: string | null;
          gateway_subscription_id?: string | null;
          gateway_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
          price?: number;
          currency?: string;
          starts_at?: string;
          metadata?: Json;
          last_payment_attempt_at?: string | null;
        };
      };
      saas_coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          max_uses: number | null;
          times_used: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          applicable_plan: string;
          min_purchase_amount: number;
          starts_at: string | null;
          max_uses_per_academy: number | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: string;
          discount_value: number;
          max_uses?: number | null;
          times_used?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          applicable_plan?: string;
          min_purchase_amount?: number;
          starts_at?: string | null;
          max_uses_per_academy?: number | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: string;
          discount_value?: number;
          max_uses?: number | null;
          times_used?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          applicable_plan?: string;
          min_purchase_amount?: number;
          starts_at?: string | null;
          max_uses_per_academy?: number | null;
          description?: string | null;
        };
      };
      saas_referrals: {
        Row: {
          id: string;
          referrer_academy_id: string;
          referral_code_used: string;
          referred_email: string | null;
          referred_academy_id: string | null;
          status: string | null;
          reward_details: string | null;
          created_at: string;
          updated_at: string | null;
          reward_amount: number | null;
          reward_type: string | null;
          rewarded_at: string | null;
          metadata: Json | null;
          reward_duration_months: number | null;
        };
        Insert: {
          id?: string;
          referrer_academy_id: string;
          referral_code_used: string;
          referred_email?: string | null;
          referred_academy_id?: string | null;
          status?: string | null;
          reward_details?: string | null;
          created_at?: string;
          updated_at?: string | null;
          reward_amount?: number | null;
          reward_type?: string | null;
          rewarded_at?: string | null;
          metadata?: Json | null;
          reward_duration_months?: number | null;
        };
        Update: {
          id?: string;
          referrer_academy_id?: string;
          referral_code_used?: string;
          referred_email?: string | null;
          referred_academy_id?: string | null;
          status?: string | null;
          reward_details?: string | null;
          created_at?: string;
          updated_at?: string | null;
          reward_amount?: number | null;
          reward_type?: string | null;
          rewarded_at?: string | null;
          metadata?: Json | null;
          reward_duration_months?: number | null;
        };
      };
      settings: {
        Row: {
          id: string;
          academy_id: string;
          key: string;
          value: string;
          updated_at: string | null;
          value_type: string;
          description: Json | null;
          is_public: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          key: string;
          value: string;
          updated_at?: string | null;
          value_type?: string;
          description?: Json | null;
          is_public?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          key?: string;
          value?: string;
          updated_at?: string | null;
          value_type?: string;
          description?: Json | null;
          is_public?: boolean;
          metadata?: Json;
          created_at?: string;
        };
      };

                  // ==========================================
      // 8. Notifications, Logs & System
      // ==========================================
          activity_logs: {
        Row: {
          id: string;
          academy_id: string | null;
          actor_user_id: string | null;
          actor_role: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          description: string | null;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id?: string | null;
          actor_user_id?: string | null;
          actor_role?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          description?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string | null;
          actor_user_id?: string | null;
          actor_role?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          description?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      admin_invitations: {
        Row: {
          id: string;
          academy_id: string;
          email: string;
          role: string;
          token: string;
          status: string;
          invited_by: string | null;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
          updated_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          email: string;
          role?: string;
          token: string;
          status?: string;
          invited_by?: string | null;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          email?: string;
          role?: string;
          token?: string;
          status?: string;
          invited_by?: string | null;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
          metadata?: Json | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          academy_id: string | null;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id?: string | null;
          user_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string | null;
          user_id?: string | null;
          action?: string;
          table_name?: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      notification_logs_archive: {
        Row: {
          id: string;
          academy_id: string;
          recipient_user_id: string | null;
          channel_used: string;
          status: string | null;
          sent_text: string;
          error_message: string | null;
          created_at: string;
          archived_at: string;
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
          id: string;
          academy_id: string;
          recipient_user_id?: string | null;
          channel_used: string;
          status?: string | null;
          sent_text: string;
          error_message?: string | null;
          created_at: string;
          archived_at?: string;
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
          archived_at?: string;
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
      saas_events_queue: {
        Row: {
          id: string;
          academy_id: string | null;
          event_type: string;
          payload: Json;
          status: string;
          attempts: number;
          max_attempts: number;
          last_error: string | null;
          scheduled_at: string;
          processed_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id?: string | null;
          event_type: string;
          payload?: Json;
          status?: string;
          attempts?: number;
          max_attempts?: number;
          last_error?: string | null;
          scheduled_at?: string;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string | null;
          event_type?: string;
          payload?: Json;
          status?: string;
          attempts?: number;
          max_attempts?: number;
          last_error?: string | null;
          scheduled_at?: string;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      user_consents: {
        Row: {
          id: string;
          user_id: string;
          academy_id: string | null;
          consent_type: string;
          is_granted: boolean;
          granted_at: string | null;
          revoked_at: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          academy_id?: string | null;
          consent_type: string;
          is_granted?: boolean;
          granted_at?: string | null;
          revoked_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          academy_id?: string | null;
          consent_type?: string;
          is_granted?: boolean;
          granted_at?: string | null;
          revoked_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };

                  // ==========================================
      // 9. Views & Aggregated Stats
      // ==========================================
          teachers_public_view: {
        Row: {
          id: string | null;
          academy_id: string | null;
          name: string | null;
          bio: Json | null;
          ijazas: string[] | null;
          specialization: string | null;
          teaching_mode: string | null;
          experience_years: number | null;
          languages: string[] | null;
          country: string | null;
          timezone: string | null;
          rating: number | null;
          is_active: boolean | null;
          is_teaching: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          academy_id?: string | null;
          name?: string | null;
          bio?: Json | null;
          ijazas?: string[] | null;
          specialization?: string | null;
          teaching_mode?: string | null;
          experience_years?: number | null;
          languages?: string[] | null;
          country?: string | null;
          timezone?: string | null;
          rating?: number | null;
          is_active?: boolean | null;
          is_teaching?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          academy_id?: string | null;
          name?: string | null;
          bio?: Json | null;
          ijazas?: string[] | null;
          specialization?: string | null;
          teaching_mode?: string | null;
          experience_years?: number | null;
          languages?: string[] | null;
          country?: string | null;
          timezone?: string | null;
          rating?: number | null;
          is_active?: boolean | null;
          is_teaching?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      v_academy_dashboard_stats: {
        Row: {
          academy_id: string | null;
          active_students_count: number | null;
          active_teachers_count: number | null;
          active_halaqas_count: number | null;
          total_payments_amount: number | null;
          overdue_payments_count: number | null;
          attendance_rate: number | null;
          updated_at: string | null;
        };
        Insert: {
          academy_id?: string | null;
          active_students_count?: number | null;
          active_teachers_count?: number | null;
          active_halaqas_count?: number | null;
          total_payments_amount?: number | null;
          overdue_payments_count?: number | null;
          attendance_rate?: number | null;
          updated_at?: string | null;
        };
        Update: {
          academy_id?: string | null;
          active_students_count?: number | null;
          active_teachers_count?: number | null;
          active_halaqas_count?: number | null;
          total_payments_amount?: number | null;
          overdue_payments_count?: number | null;
          attendance_rate?: number | null;
          updated_at?: string | null;
        };
      };
      v_active_teachers: {
        Row: {
          id: string | null;
          academy_id: string | null;
          user_id: string | null;
          name: string | null;
          email: string | null;
          phone: string | null;
          specialization: string | null;
          teaching_mode: string | null;
          experience_years: number | null;
          rating: number | null;
          is_active: boolean | null;
          is_teaching: boolean | null;
          active_halaqas_count: number | null;
          students_count: number | null;
        };
        Insert: {
          id?: string | null;
          academy_id?: string | null;
          user_id?: string | null;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          specialization?: string | null;
          teaching_mode?: string | null;
          experience_years?: number | null;
          rating?: number | null;
          is_active?: boolean | null;
          is_teaching?: boolean | null;
          active_halaqas_count?: number | null;
          students_count?: number | null;
        };
        Update: {
          id?: string | null;
          academy_id?: string | null;
          user_id?: string | null;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          specialization?: string | null;
          teaching_mode?: string | null;
          experience_years?: number | null;
          rating?: number | null;
          is_active?: boolean | null;
          is_teaching?: boolean | null;
          active_halaqas_count?: number | null;
          students_count?: number | null;
        };
      };
      v_curriculum_structure: {
        Row: {
          curriculum_id: string | null;
          academy_id: string | null;
          curriculum_title: Json | null;
          curriculum_category: string | null;
          level_id: string | null;
          level_title: Json | null;
          level_order: number | null;
          item_id: string | null;
          item_title: Json | null;
          item_type: string | null;
          item_order: number | null;
        };
        Insert: {
          curriculum_id?: string | null;
          academy_id?: string | null;
          curriculum_title?: Json | null;
          curriculum_category?: string | null;
          level_id?: string | null;
          level_title?: Json | null;
          level_order?: number | null;
          item_id?: string | null;
          item_title?: Json | null;
          item_type?: string | null;
          item_order?: number | null;
        };
        Update: {
          curriculum_id?: string | null;
          academy_id?: string | null;
          curriculum_title?: Json | null;
          curriculum_category?: string | null;
          level_id?: string | null;
          level_title?: Json | null;
          level_order?: number | null;
          item_id?: string | null;
          item_title?: Json | null;
          item_type?: string | null;
          item_order?: number | null;
        };
      };
      v_exam_details: {
        Row: {
          id: string | null;
          academy_id: string | null;
          student_id: string | null;
          student_name: Json | null;
          teacher_id: string | null;
          teacher_name: string | null;
          halaqa_id: string | null;
          exam_type: string | null;
          from_surah_id: number | null;
          to_surah_id: number | null;
          from_ayah: number | null;
          to_ayah: number | null;
          date: string | null;
          mistakes: number | null;
          prompts: number | null;
          tajweed_grade: string | null;
          final_score: number | null;
          max_score: number | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          academy_id?: string | null;
          student_id?: string | null;
          student_name?: Json | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          halaqa_id?: string | null;
          exam_type?: string | null;
          from_surah_id?: number | null;
          to_surah_id?: number | null;
          from_ayah?: number | null;
          to_ayah?: number | null;
          date?: string | null;
          mistakes?: number | null;
          prompts?: number | null;
          tajweed_grade?: string | null;
          final_score?: number | null;
          max_score?: number | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          academy_id?: string | null;
          student_id?: string | null;
          student_name?: Json | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          halaqa_id?: string | null;
          exam_type?: string | null;
          from_surah_id?: number | null;
          to_surah_id?: number | null;
          from_ayah?: number | null;
          to_ayah?: number | null;
          date?: string | null;
          mistakes?: number | null;
          prompts?: number | null;
          tajweed_grade?: string | null;
          final_score?: number | null;
          max_score?: number | null;
          notes?: string | null;
          created_at?: string | null;
        };
      };
      v_halaqas_with_stats: {
        Row: {
          id: string | null;
          academy_id: string | null;
          teacher_id: string | null;
          teacher_name: string | null;
          name: Json | null;
          status: string | null;
          students_count: number | null;
          max_students: number | null;
          attendance_rate: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          academy_id?: string | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          name?: Json | null;
          status?: string | null;
          students_count?: number | null;
          max_students?: number | null;
          attendance_rate?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          academy_id?: string | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          name?: Json | null;
          status?: string | null;
          students_count?: number | null;
          max_students?: number | null;
          attendance_rate?: number | null;
          created_at?: string | null;
        };
      };

            v_overdue_payments: {
        Row: {
          payment_id: string | null;
          academy_id: string | null;
          student_id: string | null;
          student_name: Json | null;
          amount: number | null;
          currency: string | null;
          due_date: string | null;
          days_overdue: number | null;
          status: string | null;
        };
        Insert: {
          payment_id?: string | null;
          academy_id?: string | null;
          student_id?: string | null;
          student_name?: Json | null;
          amount?: number | null;
          currency?: string | null;
          due_date?: string | null;
          days_overdue?: number | null;
          status?: string | null;
        };
        Update: {
          payment_id?: string | null;
          academy_id?: string | null;
          student_id?: string | null;
          student_name?: Json | null;
          amount?: number | null;
          currency?: string | null;
          due_date?: string | null;
          days_overdue?: number | null;
          status?: string | null;
        };
      };
      v_student_attendance_summary: {
        Row: {
          student_id: string | null;
          academy_id: string | null;
          halaqa_id: string | null;
          total_sessions: number | null;
          present_count: number | null;
          absent_count: number | null;
          late_count: number | null;
          excused_count: number | null;
          attendance_rate: number | null;
          avg_grade: number | null;
        };
        Insert: {
          student_id?: string | null;
          academy_id?: string | null;
          halaqa_id?: string | null;
          total_sessions?: number | null;
          present_count?: number | null;
          absent_count?: number | null;
          late_count?: number | null;
          excused_count?: number | null;
          attendance_rate?: number | null;
          avg_grade?: number | null;
        };
        Update: {
          student_id?: string | null;
          academy_id?: string | null;
          halaqa_id?: string | null;
          total_sessions?: number | null;
          present_count?: number | null;
          absent_count?: number | null;
          late_count?: number | null;
          excused_count?: number | null;
          attendance_rate?: number | null;
          avg_grade?: number | null;
        };
      };
      v_student_badges_details: {
        Row: {
          id: string | null;
          student_id: string | null;
          student_name: Json | null;
          badge_id: string | null;
          badge_titles: Json | null;
          badge_descriptions: Json | null;
          icon_url: string | null;
          points_rewarded: number | null;
          unlocked_at: string | null;
          academy_id: string | null;
        };
        Insert: {
          id?: string | null;
          student_id?: string | null;
          student_name?: Json | null;
          badge_id?: string | null;
          badge_titles?: Json | null;
          badge_descriptions?: Json | null;
          icon_url?: string | null;
          points_rewarded?: number | null;
          unlocked_at?: string | null;
          academy_id?: string | null;
        };
        Update: {
          id?: string | null;
          student_id?: string | null;
          student_name?: Json | null;
          badge_id?: string | null;
          badge_titles?: Json | null;
          badge_descriptions?: Json | null;
          icon_url?: string | null;
          points_rewarded?: number | null;
          unlocked_at?: string | null;
          academy_id?: string | null;
        };
      };
      v_student_details: {
        Row: {
          id: string | null;
          academy_id: string | null;
          student_code: string | null;
          name: Json | null;
          birth_date: string | null;
          gender: string | null;
          nationality: string | null;
          country: string | null;
          halaqa_id: string | null;
          halaqa_name: Json | null;
          parent_id: string | null;
          parent_name: string | null;
          parent_phone: string | null;
          points: number | null;
          status: string | null;
          payment_status: string | null;
          current_juz: number | null;
          current_surah_id: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          academy_id?: string | null;
          student_code?: string | null;
          name?: Json | null;
          birth_date?: string | null;
          gender?: string | null;
          nationality?: string | null;
          country?: string | null;
          halaqa_id?: string | null;
          halaqa_name?: Json | null;
          parent_id?: string | null;
          parent_name?: string | null;
          parent_phone?: string | null;
          points?: number | null;
          status?: string | null;
          payment_status?: string | null;
          current_juz?: number | null;
          current_surah_id?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          academy_id?: string | null;
          student_code?: string | null;
          name?: Json | null;
          birth_date?: string | null;
          gender?: string | null;
          nationality?: string | null;
          country?: string | null;
          halaqa_id?: string | null;
          halaqa_name?: Json | null;
          parent_id?: string | null;
          parent_name?: string | null;
          parent_phone?: string | null;
          points?: number | null;
          status?: string | null;
          payment_status?: string | null;
          current_juz?: number | null;
          current_surah_id?: number | null;
          created_at?: string | null;
        };
      };
      vw_coupon_usage_summary: {
        Row: {
          coupon_id: string | null;
          code: string | null;
          discount_type: string | null;
          discount_value: number | null;
          times_used: number | null;
          max_uses: number | null;
          total_discount_given: number | null;
          is_active: boolean | null;
          expires_at: string | null;
        };
        Insert: {
          coupon_id?: string | null;
          code?: string | null;
          discount_type?: string | null;
          discount_value?: number | null;
          times_used?: number | null;
          max_uses?: number | null;
          total_discount_given?: number | null;
          is_active?: boolean | null;
          expires_at?: string | null;
        };
        Update: {
          coupon_id?: string | null;
          code?: string | null;
          discount_type?: string | null;
          discount_value?: number | null;
          times_used?: number | null;
          max_uses?: number | null;
          total_discount_given?: number | null;
          is_active?: boolean | null;
          expires_at?: string | null;
        };
      };
      vw_teacher_availability_details: {
        Row: {
          id: string | null;
          teacher_id: string | null;
          teacher_name: string | null;
          academy_id: string | null;
          day_of_week: string | null;
          start_time: string | null;
          end_time: string | null;
          timezone: string | null;
          is_active: boolean | null;
          notes: string | null;
        };
        Insert: {
          id?: string | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          academy_id?: string | null;
          day_of_week?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          timezone?: string | null;
          is_active?: boolean | null;
          notes?: string | null;
        };
        Update: {
          id?: string | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          academy_id?: string | null;
          day_of_week?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          timezone?: string | null;
          is_active?: boolean | null;
          notes?: string | null;
        };
      };
      vw_teacher_documents_summary: {
        Row: {
          id: string | null;
          academy_id: string | null;
          teacher_id: string | null;
          teacher_name: string | null;
          document_type: string | null;
          file_name: string | null;
          verification_status: string | null;
          expires_at: string | null;
          uploaded_at: string | null;
        };
        Insert: {
          id?: string | null;
          academy_id?: string | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          document_type?: string | null;
          file_name?: string | null;
          verification_status?: string | null;
          expires_at?: string | null;
          uploaded_at?: string | null;
        };
        Update: {
          id?: string | null;
          academy_id?: string | null;
          teacher_id?: string | null;
          teacher_name?: string | null;
          document_type?: string | null;
          file_name?: string | null;
          verification_status?: string | null;
          expires_at?: string | null;
          uploaded_at?: string | null;
        };
      };
      vw_top_achievers: {
        Row: {
          student_id: string | null;
          academy_id: string | null;
          student_name: Json | null;
          avatar_url: string | null;
          points: number | null;
          current_juz: number | null;
          halaqa_id: string | null;
          halaqa_name: Json | null;
          rank: number | null;
        };
        Insert: {
          student_id?: string | null;
          academy_id?: string | null;
          student_name?: Json | null;
          avatar_url?: string | null;
          points?: number | null;
          current_juz?: number | null;
          halaqa_id?: string | null;
          halaqa_name?: Json | null;
          rank?: number | null;
        };
        Update: {
          student_id?: string | null;
          academy_id?: string | null;
          student_name?: Json | null;
          avatar_url?: string | null;
          points?: number | null;
          current_juz?: number | null;
          halaqa_id?: string | null;
          halaqa_name?: Json | null;
          rank?: number | null;
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

    
