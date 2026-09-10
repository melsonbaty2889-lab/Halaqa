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

export const useQuranProgress = (studentId?: string, academyId?: string) => {
  const queryClient = useQueryClient();

  // 1. جلب سجل التسميع اليومي للطالب باستخدام React Query
  const {
    data: progressHistory = [],
    isLoading: loadingHistory,
    error: historyError,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ['quran-progress', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
  });

  // 2. Mutation لتسجيل/تحديث التسميع اليومي
  const recordMutation = useMutation({
    mutationFn: async (payload: DailyProgressPayload) => {
      const recordDate = payload.date || new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_progress')
        .upsert(
          [
            {
              ...payload,
              date: recordDate,
              riwayah: payload.riwayah || 'hafs_an_asem',
              system_type: payload.system_type || 'ayah',
              mistakes_count: payload.mistakes_count || 0,
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
      // إبطال كاش التسميع للطالب
      queryClient.invalidateQueries({ queryKey: ['quran-progress', variables.student_id] });
      // إبطال كاش قائمة الطلاب لإنعاش الإحصائيات النقاط والسلسلة
      if (academyId || variables.academy_id) {
        queryClient.invalidateQueries({ queryKey: ['students', academyId || variables.academy_id] });
      }
    },
  });

  const recordProgress = useCallback(
    async (payload: DailyProgressPayload) => {
      try {
        const data = await recordMutation.mutateAsync(payload);
        return { success: true, data };
      } catch (err: any) {
        return { success: false, error: err?.message || 'حدث خطأ أثناء حفظ التسميع اليومي' };
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
