import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useHalaqas = (academyId: string) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // 1️⃣ جلب الحلقات مع دعم الكاش
  const {
    data: halaqas = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['halaqas', academyId],
    queryFn: async () => {
      if (!academyId) return [];

      const { data, error } = await supabase
        .from('halaqas')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!academyId,
  });

  // 2️⃣ إضافة حلقة جديدة وتحديث الكاش تلقائياً
  const addHalaqaMutation = useMutation({
    mutationFn: async (newHalaqa: any) => {
      const { data, error } = await supabase
        .from('halaqas')
        .insert([{ ...newHalaqa, academy_id: academyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halaqas', academyId] });
    },
  });

  // 3️⃣ حذف حلقة وتحديث الكاش
  const deleteHalaqaMutation = useMutation({
    mutationFn: async (halaqaId: string) => {
      const { error } = await supabase
        .from('halaqas')
        .delete()
        .eq('id', halaqaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halaqas', academyId] });
    },
  });

  // فلترة قائمة الحلقات بالبحث بالاسم
  const filteredHalaqas = halaqas.filter((h: any) => {
    const name = h.name_ar || h.name_en || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const addHalaqa = async (data: any) => {
    try {
      await addHalaqaMutation.mutateAsync(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteHalaqa = async (id: string) => {
    try {
      await deleteHalaqaMutation.mutateAsync(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    halaqas: filteredHalaqas,
    loading,
    error: queryError ? (queryError as Error).message : null,
    searchTerm,
    setSearchTerm,
    refetch,
    addHalaqa,
    deleteHalaqa,
  };
};
