import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  academy_id: string;
  academy_name: Record<string, string> | string;
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
  student_name: Record<string, string> | string;
  halaqa_id?: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate_percentage: number;
}

export function useAnalytics(academyId?: string) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [attendanceSummaries, setAttendanceSummaries] = useState<StudentAttendanceSummary[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);

  // 1. جلب إحصائيات لوحة التحكم للأكاديمية من الـ View الجاهز
  const fetchDashboardStats = useCallback(async () => {
    if (!academyId) return;
    setLoadingStats(true);

    try {
      const { data, error } = await supabase
        .from('v_academy_dashboard_stats')
        .select('*')
        .eq('academy_id', academyId)
        .single();

      if (error) throw error;
      setDashboardStats(data as DashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [academyId]);

  // 2. جلب ملخص حضور الطلاب للأكاديمية أو لحلقة معينة
  const fetchAttendanceSummary = useCallback(
    async (halaqaId?: string) => {
      if (!academyId) return;
      setLoadingAttendance(true);

      try {
        let query = supabase
          .from('v_student_attendance_summary')
          .select('*')
          .eq('academy_id', academyId);

        if (halaqaId) {
          query = query.eq('halaqa_id', halaqaId);
        }

        const { data, error } = await query;
        if (error) throw error;

        setAttendanceSummaries(data as StudentAttendanceSummary[]);
      } catch (err) {
        console.error('Error fetching attendance summary:', err);
      } finally {
        setLoadingAttendance(false);
      }
    },
    [academyId]
  );

  useEffect(() => {
    if (academyId) {
      fetchDashboardStats();
    }
  }, [academyId, fetchDashboardStats]);

  return {
    dashboardStats,
    attendanceSummaries,
    loadingStats,
    loadingAttendance,
    fetchDashboardStats,
    fetchAttendanceSummary,
  };
}

export default useAnalytics;
