import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SupportedLanguage, MultiLangName } from '@/constants/academySettingsI18n';

// ── Interfaces ──────────────────────────────────────────────────

export interface DashboardStats {
  academy_id: string;
  academy_name: MultiLangName | string | null;
  active_students_count: number;
  active_teachers_count: number;
  active_halaqas_count: number;
  today_present_students_count: number;
  today_recitation_sessions_count: number;
  overdue_payments_count: number;
}

export interface StudentAttendanceSummary {
  student_id: string;
  academy_id: string;
  student_name: MultiLangName | string | null;
  halaqa_id?: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate_percentage: number;
}

// ── Helper Function ─────────────────────────────────────────────

export function getLocalizedName(
  name: MultiLangName | string | null | undefined,
  currentLang: SupportedLanguage = 'ar'
): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  
  return name[currentLang] || name.ar || name.en || Object.values(name).find(Boolean) || '';
}

// ── Main Hook ───────────────────────────────────────────────────

export function useAnalytics(academyId?: string | null) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [attendanceSummaries, setAttendanceSummaries] = useState<StudentAttendanceSummary[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);

  const isValidAcademyId = Boolean(
    academyId && 
    academyId !== 'undefined' && 
    typeof academyId === 'string' && 
    academyId.trim() !== ''
  );

  // 1. جلب إحصائيات لوحة التحكم للأكاديمية
  const fetchDashboardStats = useCallback(async () => {
    if (!isValidAcademyId) {
      setLoadingStats(false);
      return;
    }

    setLoadingStats(true);

    try {
      const { data, error } = await supabase
        .from('v_academy_dashboard_stats')
        .select('*')
        .eq('academy_id', academyId!)
        .maybeSingle(); // استخدام maybeSingle لتفادي الخطأ عند عدم وجود صفوف

      if (error) throw error;
      setDashboardStats((data as DashboardStats) || null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [academyId, isValidAcademyId]);

  // 2. جلب ملخص حضور الطلاب للأكاديمية أو لحلقة معينة
  const fetchAttendanceSummary = useCallback(
    async (halaqaId?: string) => {
      if (!isValidAcademyId) return;
      setLoadingAttendance(true);

      try {
        let query = supabase
          .from('v_student_attendance_summary')
          .select('*')
          .eq('academy_id', academyId!);

        if (halaqaId) {
          query = query.eq('halaqa_id', halaqaId);
        }

        const { data, error } = await query;
        if (error) throw error;

        setAttendanceSummaries((data as StudentAttendanceSummary[]) || []);
      } catch (err) {
        console.error('Error fetching attendance summary:', err);
      } finally {
        setLoadingAttendance(false);
      }
    },
    [academyId, isValidAcademyId]
  );

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    dashboardStats,
    attendanceSummaries,
    loadingStats,
    loadingAttendance,
    fetchDashboardStats,
    fetchAttendanceSummary,
    getLocalizedName,
  };
}

export default useAnalytics;
