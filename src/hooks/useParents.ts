import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Parent, ParentFilters } from '@/types/parent';
import { normalizePhone } from '@/utils/formatters';

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

  // 1. جلب أولياء الأمور
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
          students (
            id,
            name,
            gender,
            status
          )
        `)
        .eq('academy_id', academyId);

      if (filters.preferred_language && filters.preferred_language !== 'all') {
        query = query.eq('preferred_language', filters.preferred_language);
      }

      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const rawTerm = filters.searchTerm.trim();
        const term = `%${rawTerm}%`;
        const normalizedTerm = normalizePhone(rawTerm);

        query = query.or(`name.ilike.${term},phone.ilike.%${normalizedTerm}%,email.ilike.${term}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Parent[]) || [];
    },
    enabled: !!academyId && enabled,
  });

  // 2. إنشاء / العثور على ولي أمر برقم الهاتف الموحد
  const upsertParentMutation = useMutation({
    mutationFn: async (parentData: {
      name: string;
      phone: string;
      email?: string;
      country_code?: string;
    }) => {
      const countryCode = parentData.country_code || 'EG';
      const normalizedPhone = normalizePhone(parentData.phone, countryCode);

      // أ) البحث أولاً بـ Phone الموحد
      const { data: existingParent } = await supabase
        .from('parents')
        .select('*')
        .eq('academy_id', academyId)
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (existingParent) {
        return existingParent;
      }

      // ب) إن لم يوجد، إنشاء سجل جديد
      const { data: newParent, error } = await supabase
        .from('parents')
        .insert([{
          academy_id: academyId,
          name: parentData.name,
          phone: normalizedPhone,
          email: parentData.email || null,
          country_code: countryCode,
        }])
        .select()
        .single();

      if (error) throw error;
      return newParent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents', academyId] });
    },
  });

  // 3. حذف ولي أمر
  const deleteMutation = useMutation({
    mutationFn: async (parentId: string) => {
      const { error } = await supabase.from('parents').delete().eq('id', parentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents', academyId] });
    },
  });

  const upsertParent = useCallback(
    async (parentData: { name: string; phone: string; email?: string; country_code?: string }) => {
      try {
        const result = await upsertParentMutation.mutateAsync(parentData);
        return { success: true, data: result };
      } catch (err: any) {
        return { success: false, error: err?.message || 'فشلت عملية حفظ بيانات ولي الأمر' };
      }
    },
    [upsertParentMutation]
  );

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
    upsertParent,
    deleteParent,
  };
};

export default useParents;
