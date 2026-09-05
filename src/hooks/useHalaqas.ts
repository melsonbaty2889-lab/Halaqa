import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface Halaqa {
  id: string;
  academy_id: string;
  name_ar?: string;
  name_en?: string;
  teacher_id?: string | null;
  description?: string;
  gender_restriction?: 'males_only' | 'females_only' | 'mixed' | 'all';
  max_capacity?: number;
  status?: 'active' | 'inactive' | 'archived';
  created_at?: string;
  updated_at?: string;
  teacher?: {
    id: string;
    full_name?: string;
  };
}

export type CreateHalaqaInput = Omit<Halaqa, 'id' | 'created_at' | 'updated_at'>;
export type UpdateHalaqaInput = Partial<CreateHalaqaInput> & { id: string };

// ── Main Hook ───────────────────────────────────────────────────

export const useHalaqas = (academyId?: string | null) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isValidAcademy = Boolean(
    academyId && 
    academyId !== 'undefined' && 
    typeof academyId === 'string' && 
    academyId.trim() !== ''
  );

  // 1️⃣ جلب الحلقات مع دعم الكاش
  const {
    data: halaqas = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<Halaqa[]>({
    queryKey: ['halaqas', academyId],
    queryFn: async () => {
      if (!isValidAcademy) return [];

      const { data, error } = await supabase
        .from('halaqas')
        .select('*')
        .eq('academy_id', academyId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Halaqa[];
    },
    enabled: isValidAcademy,
  });

  // 2️⃣ إضافة حلقة جديدة
  const addHalaqaMutation = useMutation({
    mutationFn: async (newHalaqa: CreateHalaqaInput) => {
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

  // 3️⃣ تعديل حلقة موجودة
  const updateHalaqaMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateHalaqaInput) => {
      const { data, error } = await supabase
        .from('halaqas')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halaqas', academyId] });
    },
  });

  // 4️⃣ حذف حلقة
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

  // فلترة قائمة الحلقات بالبحث بالاسم العربي أو الإنجليزي
  const filteredHalaqas = halaqas.filter((h) => {
    const name = h.name_ar || h.name_en || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const addHalaqa = async (data: CreateHalaqaInput) => {
    try {
      const result = await addHalaqaMutation.mutateAsync(data);
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ أثناء إدراج الحلقة' };
    }
  };

  const updateHalaqa = async (data: UpdateHalaqaInput) => {
    try {
      const result = await updateHalaqaMutation.mutateAsync(data);
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ أثناء تعديل الحلقة' };
    }
  };

  const deleteHalaqa = async (id: string) => {
    try {
      await deleteHalaqaMutation.mutateAsync(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ أثناء حذف الحلقة' };
    }
  };

  return {
    halaqas: filteredHalaqas,
    rawHalaqas: halaqas,
    loading,
    error: queryError ? (queryError as Error).message : null,
    searchTerm,
    setSearchTerm,
    refetch,
    addHalaqa,
    updateHalaqa,
    deleteHalaqa,
    isAdding: addHalaqaMutation.isPending,
    isUpdating: updateHalaqaMutation.isPending,
    isDeleting: deleteHalaqaMutation.isPending,
  };
};
