import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DailyProgressPayload {
  academy_id: string;
  student_id: string;
  teacher_id?: string;
  halaqa_id?: string;
  date?: string;
  hifz_surah_id?: number;
  hifz_from_ayah?: number;
  hifz_to_ayah?: number;
  review_surah_id?: number;
  review_from_ayah?: number;
  review_to_ayah?: number;
  grade?: string;
  mistakes_count?: number;
  notes?: string;
  looh_notes?: string;
  riwayah?: string;
  system_type?: 'ayah' | 'page' | 'juz' | 'quarter';
}

export const useQuranProgress = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // تسجيل متابعة يومية جديدة لحفظ/مراجعة الطالب
  const recordProgress = useCallback(async (payload: DailyProgressPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await supabase
        .from('daily_progress')
        .insert([{
          ...payload,
          date: payload.date || new Date().toISOString().split('T')[0],
          riwayah: payload.riwayah || 'hafs_an_asem',
          system_type: payload.system_type || 'ayah',
          mistakes_count: payload.mistakes_count || 0
        }])
        .select()
        .single();

      if (apiError) throw apiError;
      return { success: true, data };
    } catch (err: any) {
      const message = err.message || 'حدث خطأ أثناء حفظ التسميع اليومي';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب السجل اليومي لشاشة الطالب
  const fetchStudentProgress = useCallback(async (studentId: string, limit = 30) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(limit);

      if (apiError) throw apiError;
      return { success: true, data };
    } catch (err: any) {
      const message = err.message || 'حدث خطأ أثناء جلب سجل الطالب';
      setError(message);
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recordProgress,
    fetchStudentProgress,
    loading,
    error
  };
};
