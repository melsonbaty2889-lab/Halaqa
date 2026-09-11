import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useQuranProgress = (studentId?: string | null, academyId?: string | null) => {
  const queryClient = useQueryClient();

  const isValidStudentId = Boolean(
    studentId &&
    studentId !== 'undefined' &&
    typeof studentId === 'string' &&
    studentId.trim() !== ''
  );

  const isValidAcademyId = Boolean(
    academyId &&
    academyId !== 'undefined' &&
    typeof academyId === 'string' &&
    academyId.trim() !== ''
  );

  // 1. جلب سجل التسميع اليومي للطالب باستخدام React Query
  const {
    data: progressHistory = [],
    isLoading: loadingHistory,
    error: historyError,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ['quran-progress', academyId, studentId],
    queryFn: async () => {
      if (!isValidStudentId) return [];

      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('student_id', studentId!)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    },
    enabled: isValidStudentId,
  });

  // 2. Mutation لتسجيل/تحديث التسميع اليومي
  const recordMutation = useMutation({
    mutationFn: async (payload: DailyProgressPayload) => {
      const targetAcademyId = payload.academy_id || academyId;
      if (!targetAcademyId) throw new Error('معرف الأكاديمية غير صالح');
      if (!payload.student_id) throw new Error('معرف الطالب غير صالح');

      const recordDate = payload.date || new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_progress')
        .upsert(
          [
            {
              ...payload,
              academy_id: targetAcademyId,
              date: recordDate,
              riwayah: payload.riwayah || 'hafs_an_asem',
              system_type: payload.system_type || 'ayah',
              mistakes_count: payload.mistakes_count ?? 0,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'student_id,date' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      const activeAcademyId = variables.academy_id || academyId;

      // إبطال كاش التسميع للطالب
      queryClient.invalidateQueries({
        queryKey: ['quran-progress', activeAcademyId, variables.student_id],
      });

      // إبطال كاش قائمة الطلاب لإنعاش الإحصائيات النقاط والسلسلة
      if (activeAcademyId) {
        queryClient.invalidateQueries({
          queryKey: ['students', activeAcademyId],
        });
      }
    },
  });

  const recordProgress = useCallback(
    async (payload: DailyProgressPayload) => {
      try {
        const data = await recordMutation.mutateAsync(payload);
        return { success: true, data };
      } catch (err: any) {
        console.error('Error recording Quran progress:', err);
        return {
          success: false,
          error: err?.message || 'حدث خطأ أثناء حفظ التسميع اليومي',
        };
      }
    },
    [recordMutation]
  );

  return {
    progressHistory,
    loadingHistory,
    error: historyError ? (historyError as Error).message : null,
    recordProgress,
    refetchProgress,
    isSubmitting: recordMutation.isPending,
  };
};

export default useQuranProgress;
