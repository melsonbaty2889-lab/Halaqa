import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Parent, ParentFilters } from '@/types/parent';

export interface UseParentsOptions {
  academyId: string;
  initialFilters?: Partial<ParentFilters>;
  enabled?: boolean;
}

export const useParents = ({ academyId, initialFilters, enabled = true }: UseParentsOptions) => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ParentFilters>({
    searchTerm: '',
    preferred_language: 'all',
    ...initialFilters,
  });

  const queryKey = ['parents', academyId, filters];

  const {
    data: parents = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Parent[]> => {
      if (!academyId) return [];

      let query = supabase
        .from('parents')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('academy_id', academyId);

      if (filters.preferred_language && filters.preferred_language !== 'all') {
        query = query.eq('preferred_language', filters.preferred_language);
      }

      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const term = `%${filters.searchTerm.trim()}%`;
        query = query.or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Parent[]) || [];
    },
    enabled: !!academyId && enabled,
  });

  const deleteMutation = useMutation({
    mutationFn: async (parentId: string) => {
      const { error } = await supabase
        .from('parents')
        .delete()
        .eq('id', parentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents', academyId] });
    },
  });

  const deleteParent = useCallback(
    async (parentId: string) => {
      try {
        await deleteMutation.mutateAsync(parentId);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'فشلت عملية الحذف' };
      }
    },
    [deleteMutation]
  );

  return {
    parents,
    loading,
    error: queryError ? (queryError as Error).message : null,
    filters,
    setFilters,
    refetch,
    deleteParent,
  };
};

export default useParents;
