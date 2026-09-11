import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface DailyProgressReport {
  id: string;
  student_id: string;
  academy_id: string;
  date: string;
  hifz_surah_id?: number;
  hifz_from_ayah?: number;
  hifz_to_ayah?: number;
  review_surah_id?: number;
  review_from_ayah?: number;
  review_to_ayah?: number;
  grade?: string;
  notes?: string;
  created_at?: string;
  [key: string]: any;
}

export interface SummaryAttendanceReport {
  student_id: string;
  student_name: any;
  halaqa_id?: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate_percentage: number;
}

// ── Main Hook ───────────────────────────────────────────────────

export const useReports = (academyId?: string | null) => {
  const [reportData, setReportData] = useState<DailyProgressReport[] | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<SummaryAttendanceReport[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isValidAcademyId = Boolean(
    academyId &&
    academyId !== 'undefined' &&
    typeof academyId === 'string' &&
    academyId.trim() !== ''
  );

  // 1. توليد تقرير الإنجاز والتسميع اليومي للطلاب
  const generateProgressReport = useCallback(
    async (studentId: string, startDate: string, endDate: string) => {
      if (!studentId) return { success: false, error: 'معرف الطالب مطلوب' };

      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      try {
        let query = supabase
          .from('daily_progress')
          .select('*')
          .eq('student_id', studentId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        if (isValidAcademyId) {
          query = query.eq('academy_id', academyId!);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const resultData = (data as DailyProgressReport[]) || [];

        if (isMounted.current) {
          setReportData(resultData);
        }

        return { success: true, data: resultData };
      } catch (err: any) {
        console.error('Progress Report Error:', err);
        const errMsg = err?.message || 'حدث خطأ أثناء جلب التقارير';
        
        if (isMounted.current) {
          setError(errMsg);
        }
        return { success: false, error: errMsg };
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [academyId, isValidAcademyId]
  );

  // 2. جلب ملخص نسب حضور وغياب طلاب حلقة أو الأكاديمية بالكامل من View
  const generateAttendanceSummary = useCallback(
    async (halaqaId?: string) => {
      if (!isValidAcademyId) {
        return { success: false, error: 'معرف الأكاديمية غير صالح' };
      }

      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      try {
        let query = supabase
          .from('v_student_attendance_summary')
          .select('*')
          .eq('academy_id', academyId!);

        if (halaqaId && halaqaId !== 'all') {
          query = query.eq('halaqa_id', halaqaId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const resultSummary = (data as SummaryAttendanceReport[]) || [];

        if (isMounted.current) {
          setAttendanceSummary(resultSummary);
        }

        return { success: true, data: resultSummary };
      } catch (err: any) {
        console.error('Attendance Summary Error:', err);
        const errMsg = err?.message || 'حدث خطأ أثناء جلب ملخص الحضور';

        if (isMounted.current) {
          setError(errMsg);
        }
        return { success: false, error: errMsg };
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [academyId, isValidAcademyId]
  );

  const resetReport = useCallback(() => {
    if (isMounted.current) {
      setReportData(null);
      setAttendanceSummary(null);
      setError(null);
    }
  }, []);

  return {
    reportData,
    attendanceSummary,
    loading,
    error,
    generateProgressReport,
    generateAttendanceSummary,
    resetReport,
  };
};

export default useReports;
