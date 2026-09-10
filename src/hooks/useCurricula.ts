import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Curriculum, CurriculumFilters } from '@/types/curriculum';

export interface UseCurriculaOptions {
  academyId: string;
  initialFilters?: Partial<CurriculumFilters>;
  enabled?: boolean;
}

export const useCurricula = ({ academyId, initialFilters, enabled = true }: UseCurriculaOptions) => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<CurriculumFilters>({
    searchTerm: '',
    category: 'all',
    is_active: 'all',
    ...initialFilters,
  });

  const queryKey = ['curricula', academyId, filters];

  // 1. جلب المناهج
  const {
    data: curricula = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Curriculum[]> => {
      if (!academyId) return [];

      let query = supabase
        .from('curricula')
        .select('*')
        .eq('academy_id', academyId);

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.is_active !== 'all' && typeof filters.is_active === 'boolean') {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const term = `%${filters.searchTerm.trim()}%`;
        query = query.or(`title->>ar.ilike.${term},title->>en.ilike.${term},code.ilike.${term}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Curriculum[]) || [];
    },
    enabled: !!academyId && enabled,
  });

  // 2. Mutation لتغيير حالة التفعيل
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ curriculumId, currentActive }: { curriculumId: string; currentActive: boolean }) => {
      const { error } = await supabase
        .from('curricula')
        .update({ is_active: !currentActive })
        .eq('id', curriculumId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curricula', academyId] });
    },
  });

  // 3. Mutation لحذف منهج
  const deleteMutation = useMutation({
    mutationFn: async (curriculumId: string) => {
      const { error } = await supabase
        .from('curricula')
        .delete()
        .eq('id', curriculumId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curricula', academyId] });
    },
  });

  const toggleActiveCurriculum = useCallback(
    async (curriculumId: string, currentActive: boolean) => {
      try {
        await toggleActiveMutation.mutateAsync({ curriculumId, currentActive });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'فشلت عملية التحديث' };
      }
    },
    [toggleActiveMutation]
  );

  const deleteCurriculum = useCallback(
    async (curriculumId: string) => {
      try {
        await deleteMutation.mutateAsync(curriculumId);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'فشلت عملية الحذف' };
      }
    },
    [deleteMutation]
  );

  return {
    curricula,
    loading,
    error: queryError ? (queryError as Error).message : null,
    filters,
    setFilters,
    refetch,
    toggleActiveCurriculum,
    deleteCurriculum,
  };
};

export default useCurricula;
