// src/hooks/useStudents.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 
import { Student, StudentFilters } from '../types/student';

export const useStudents = (academyId: string, initialFilters?: Partial<StudentFilters>) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // إدارة حالة الفلاتر
  const [filters, setFilters] = useState<StudentFilters>({
    searchTerm: '',
    gender: 'all',
    halaqaId: 'all',
    isArchived: false,
    ...initialFilters,
  });

  // حالة كلمة البحث المؤجلة لتخفيف الطلبات (Debounce)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [filters.searchTerm]);

  // دالة جلب البيانات المباشرة من Supabase
  const fetchStudents = useCallback(async () => {
    if (!academyId) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('students')
        .select(`
          *,
          halaqas (
            id,
            name_ar,
            name_en,
            target_audience
          )
        `)
        .eq('academy_id', academyId)
        .eq('is_archived', filters.isArchived);

      // 1. فلترة الجنس
      if (filters.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }

      // 2. فلترة الحلقة
      if (filters.halaqaId && filters.halaqaId !== 'all') {
        if (filters.halaqaId === 'none') {
          query = query.is('halaqa_id', null);
        } else {
          query = query.eq('halaqa_id', filters.halaqaId);
        }
      }

      // 3. البحث بالاسم أو كود الطالب أو رقم ولي الأمر
      if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
        const term = `%${debouncedSearchTerm.trim()}%`;
        query = query.or(`name.ilike.${term},student_code.ilike.${term},parent_phone.ilike.${term}`);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setStudents(data as Student[]);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message || 'حدث خطأ أثناء جلب بيانات الطلاب');
    } finally {
      setLoading(false);
    }
  }, [academyId, filters.gender, filters.halaqaId, filters.isArchived, debouncedSearchTerm]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // دالة أرشفة أو إلغاء أرشفة طالب
  const toggleArchiveStudent = async (studentId: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('students')
        .update({ is_archived: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', studentId);

      if (updateError) throw updateError;
      
      await fetchStudents();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // دالة حذف طالب من قاعدة البيانات
  const deleteStudent = async (studentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (deleteError) throw deleteError;

      await fetchStudents();
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting student:', err);
      return { success: false, error: err.message || 'فشلت عملية الحذف' };
    }
  };

  return {
    students,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchStudents,
    toggleArchiveStudent,
    deleteStudent,
  };
};
