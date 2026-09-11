import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Halaqa, HalaqaFilters } from '@/types/halaqa';

export interface UseHalaqasOptions {
  academyId?: string | null;
  initialFilters?: Partial<HalaqaFilters>;
  enabled?: boolean;
}

export const useHalaqas = ({
  academyId,
  initialFilters,
  enabled = true,
}: UseHalaqasOptions = {}) => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<HalaqaFilters>({
    searchTerm: '',
    status: 'all',
    target_audience: 'all',
    teaching_type: 'all',
    is_archived: false,
    ...initialFilters,
  });

  const isValidAcademyId = Boolean(
    academyId &&
    academyId !== 'undefined' &&
    typeof academyId === 'string' &&
    academyId.trim() !== ''
  );

  const queryKey = ['halaqas', academyId || 'no-academy', filters];

  // 1. جلب بيانات الحلقات بأمان
  const {
    data: halaqas = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Halaqa[]> => {
      if (!isValidAcademyId) return [];

      try {
        let query = supabase
          .from('halaqas')
          .select(`
            *,
            teachers (
              id,
              name,
              email,
              phone
            ),
            curricula (
              id,
              title
            )
          `)
          .eq('academy_id', academyId!)
          .eq('is_archived', filters.is_archived);

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.target_audience && filters.target_audience !== 'all') {
          query = query.eq('target_audience', filters.target_audience);
        }

        if (filters.teaching_type && filters.teaching_type !== 'all') {
          query = query.eq('teaching_type', filters.teaching_type);
        }

        // البحث عبر ألسنة اللغات في JSONB وبدلالة الكود
        if (filters.searchTerm && filters.searchTerm.trim() !== '') {
          const term = `%${filters.searchTerm.trim()}%`;
          query = query.or(`name->>ar.ilike.${term},name->>en.ilike.${term},code.ilike.${term}`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return (data as Halaqa[]) || [];
      } catch (err: any) {
        console.warn('Halaqas Query Error:', err?.message || err);
        return [];
      }
    },
    enabled: isValidAcademyId && enabled,
    retry: 1,
  });

  // 2. Mutation لإسناد / تغيير المعلم للحلقة
  const assignTeacherMutation = useMutation({
    mutationFn: async ({ halaqaId, teacherId }: { halaqaId: string; teacherId: string | null }) => {
      const { error } = await supabase
        .from('halaqas')
        .update({
          teacher_id: teacherId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', halaqaId);

      if (error) throw error;
    },
    onSuccess: () => {
      if (isValidAcademyId) {
        queryClient.invalidateQueries({ queryKey: ['halaqas', academyId] });
      }
    },
  });

  // 3. Mutation للأرشفة
  const archiveMutation = useMutation({
    mutationFn: async ({ halaqaId, currentArchived }: { halaqaId: string; currentArchived: boolean }) => {
      const { error } = await supabase
        .from('halaqas')
        .update({
          is_archived: !currentArchived,
          updated_at: new Date().toISOString(),
        })
        .eq('id', halaqaId);

      if (error) throw error;
    },
    onSuccess: () => {
      if (isValidAcademyId) {
        queryClient.invalidateQueries({ queryKey: ['halaqas', academyId] });
      }
    },
  });

  // دالة إسناد المعلم
  const assignTeacherToHalaqa = useCallback(
    async (halaqaId: string, teacherId: string | null) => {
      try {
        await assignTeacherMutation.mutateAsync({ halaqaId, teacherId });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'فشلت عملية إسناد المعلم' };
      }
    },
    [assignTeacherMutation]
  );

  // دالة الأرشفة
  const toggleArchiveHalaqa = useCallback(
    async (halaqaId: string, currentArchived: boolean) => {
      try {
        await archiveMutation.mutateAsync({ halaqaId, currentArchived });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'فشلت عملية الأرشفة' };
      }
    },
    [archiveMutation]
  );

  return {
    halaqas,
    loading,
    error: queryError ? (queryError as Error).message : null,
    filters,
    setFilters,
    refetch,
    assignTeacherToHalaqa,
    toggleArchiveHalaqa,
  };
};

export default useHalaqas;
