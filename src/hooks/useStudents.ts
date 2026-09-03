// src/hooks/useStudents.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; 
import { Student, StudentFilters } from '@/types/student';

export const useStudents = (academyId: string, initialFilters?: Partial<StudentFilters>) => {
  const queryClient = useQueryClient();

  // 1. إدارة حالة الفلاتر
  const [filters, setFilters] = useState<StudentFilters>({
    searchTerm: '',
    gender: 'all',
    halaqaId: 'all',
    isArchived: false,
    ...initialFilters,
  });

  // 2. حالة كلمة البحث المؤجلة لتخفيف الطلبات (Debounce)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [filters.searchTerm]);

  // 3. مفتاح الكاش الموحد بناءً على المتغيرات
  const queryKey = ['students', academyId, filters.gender, filters.halaqaId, filters.isArchived, debouncedSearchTerm];

  // 4. جلب البيانات باستخدام React Query
  const {
    data: students = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!academyId) return [];

      let query = supabase
        .from('students')
        .select(`
          id,
          academy_id,
          name,
          student_code,
          gender,
          halaqa_id,
          parent_phone,
          is_archived,
          created_at,
          updated_at,
          halaqas (
            id,
            name_ar,
            name_en,
            target_audience
          )
        `)
        .eq('academy_id', academyId)
        .eq('is_archived', filters.isArchived);

      // فلترة الجنس
      if (filters.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }

      // فلترة الحلقة
      if (filters.halaqaId && filters.halaqaId !== 'all') {
        if (filters.halaqaId === 'none') {
          query = query.is('halaqa_id', null);
        } else {
          query = query.eq('halaqa_id', filters.halaqaId);
        }
      }

      // البحث بالاسم أو الكود أو الهاتف
      if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
        const term = `%${debouncedSearchTerm.trim()}%`;
        query = query.or(`name.ilike.${term},student_code.ilike.${term},parent_phone.ilike.${term}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Student[];
    },
    enabled: !!academyId, // العزل: يشتغل فقط عند توفر ID الأكاديمية
  });

  // 5. Mutation الأرشفة مع تحديث الكاش تلقائياً
  const archiveMutation = useMutation({
    mutationFn: async ({ studentId, currentStatus }: { studentId: string; currentStatus: boolean }) => {
      const { error } = await supabase
        .from('students')
        .update({ is_archived: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      // تفريغ كاش الطلاب لتنعكس التغييرات فوراً في جميع الشاشات
      queryClient.invalidateQueries({ queryKey: ['students', academyId] });
    },
  });

  // 6. Mutation الحذف مع تحديث الكاش تلقائياً
  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', academyId] });
    },
  });

  // دالة أرشفة أو إلغاء أرشفة
  const toggleArchiveStudent = async (studentId: string, currentStatus: boolean) => {
    try {
      await archiveMutation.mutateAsync({ studentId, currentStatus });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // دالة الحذف
  const deleteStudent = async (studentId: string) => {
    try {
      await deleteMutation.mutateAsync(studentId);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'فشلت عملية الحذف' };
    }
  };

  const error = queryError ? (queryError as Error).message : null;

  return {
    students,
    loading,
    error,
    filters,
    setFilters,
    refetch,
    toggleArchiveStudent,
    deleteStudent,
  };
};
