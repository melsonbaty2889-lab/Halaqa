import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Student, StudentFilters } from '@/types/student';
import { normalizePhone } from '@/utils/formatters';

export interface OperationResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export const useStudents = (
  academyId: string,
  initialFilters?: Partial<StudentFilters>
) => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<StudentFilters>({
    searchTerm: '',
    gender: 'all',
    halaqaId: 'all',
    isArchived: false,
    ...initialFilters,
  });

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(
    filters.searchTerm
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [filters.searchTerm]);

  const queryKey = [
    'students',
    academyId,
    filters.gender,
    filters.halaqaId,
    filters.isArchived,
    debouncedSearchTerm,
  ];

  // 1. جلب الطلاب
  const {
    data: students = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Student[]> => {
      if (!academyId) return [];

      let query = supabase
        .from('students')
        .select(`
          *,
          halaqas (
            id,
            name,
            target_audience
          ),
          parents (
            id,
            name,
            phone,
            email
          )
        `)
        .eq('academy_id', academyId)
        .eq('is_archived', filters.isArchived);

      if (filters.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }

      if (filters.halaqaId && filters.halaqaId !== 'all') {
        if (filters.halaqaId === 'none') {
          query = query.is('halaqa_id', null);
        } else {
          query = query.eq('halaqa_id', filters.halaqaId);
        }
      }

      if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
        const rawTerm = debouncedSearchTerm.trim();
        const term = `%${rawTerm}%`;
        const normalizedTerm = normalizePhone(rawTerm);

        query = query.or(
          `name->>ar.ilike.${term},name->>en.ilike.${term},student_code.ilike.${term},parent_phone.ilike.%${normalizedTerm}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Student[]) || [];
    },
    enabled: !!academyId,
  });

  // 2. إلحاق أو نقل طالب إلى حلقة وتحديث جدول التتبع student_halaqas
  const assignHalaqaMutation = useMutation({
    mutationFn: async ({
      studentId,
      halaqaId,
      notes,
    }: {
      studentId: string;
      halaqaId: string | null;
      notes?: string;
    }) => {
      // أ) إغلاق الحركة القديمة إن وجدت في student_halaqas
      await supabase
        .from('student_halaqas')
        .update({ left_at: new Date().toISOString(), status: 'transferred' })
        .eq('student_id', studentId)
        .is('left_at', null);

      // ب) تحديث جدول الطالب الرئيسي
      const { error: studentError } = await supabase
        .from('students')
        .update({ halaqa_id: halaqaId, updated_at: new Date().toISOString() })
        .eq('id', studentId);

      if (studentError) throw studentError;

      // جـ) تسجيل الحركة الجديدة إن تم تحديد حلقة
      if (halaqaId) {
        const { error: historyError } = await supabase
          .from('student_halaqas')
          .insert([{
            academy_id: academyId,
            student_id: studentId,
            halaqa_id: halaqaId,
            status: 'active',
            notes,
          }]);

        if (historyError) throw historyError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', academyId] });
      queryClient.invalidateQueries({ queryKey: ['halaqas', academyId] });
    },
  });

  // 3. أرشفة وتفعيل
  const archiveMutation = useMutation({
    mutationFn: async ({ studentId, currentStatus }: { studentId: string; currentStatus: boolean }) => {
      const { error } = await supabase
        .from('students')
        .update({
          is_archived: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', academyId] });
    },
  });

  // 4. حذف طالب
  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase.from('students').delete().eq('id', studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', academyId] });
    },
  });

  const assignStudentToHalaqa = useCallback(
    async (studentId: string, halaqaId: string | null, notes?: string): Promise<OperationResponse> => {
      try {
        await assignHalaqaMutation.mutateAsync({ studentId, halaqaId, notes });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'فشلت عملية تسكين الطالب بالحلقة' };
      }
    },
    [assignHalaqaMutation]
  );

  const toggleArchiveStudent = async (studentId: string, currentStatus: boolean): Promise<OperationResponse> => {
    try {
      await archiveMutation.mutateAsync({ studentId, currentStatus });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشلت عملية الأرشفة' };
    }
  };

  const deleteStudent = async (studentId: string): Promise<OperationResponse> => {
    try {
      await deleteMutation.mutateAsync(studentId);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'فشلت عملية الحذف' };
    }
  };

  return {
    students,
    loading,
    error: queryError ? (queryError as Error).message : null,
    filters,
    setFilters,
    refetch,
    assignStudentToHalaqa,
    toggleArchiveStudent,
    deleteStudent,
  };
};

export default useStudents;
