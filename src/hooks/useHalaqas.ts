/* src/hooks/useHalaqas.ts */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Halaqa, HalaqaFilters } from '@/types/halaqa';
import { formatTimeForDb } from '@/utils/dateUtils';

export interface UseHalaqasOptions {
  academyId?: string | null;
  initialFilters?: Partial<HalaqaFilters>;
  enabled?: boolean;
}

export const useHalaqas = ({
  academyId: propAcademyId,
  initialFilters,
  enabled = true,
}: UseHalaqasOptions = {}) => {
  const queryClient = useQueryClient();

  // 🛡️ حل جذري: جلب الـ academyId تلقائياً من الـ LocalStorage لو البروب وصل فارغاً أثناء الـ Refresh
  const getResolvedAcademyId = () => {
    if (propAcademyId && propAcademyId !== 'undefined' && propAcademyId !== 'null') {
      return propAcademyId;
    }
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('active_academy_id') ||
        localStorage.getItem('academy_id') ||
        null
      );
    }
    return null;
  };

  const academyId = getResolvedAcademyId();

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

  const queryKey = ['halaqas', academyId || 'no-academy'];

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
        const { data: { user } } = await supabase.auth.getUser();
        let userRole = 'admin';
        let currentTeacherRecordId: string | null = null;

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role) {
            userRole = profile.role.toLowerCase().trim();
          }

          if (userRole === 'teacher') {
            const { data: teacherRec } = await supabase
              .from('teachers')
              .select('id')
              .or(`user_id.eq.${user.id},email.eq.${user.email}`)
              .maybeSingle();

            if (teacherRec?.id) {
              currentTeacherRecordId = teacherRec.id;
            }
          }
        }

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
          .eq('academy_id', academyId!);

        if (userRole === 'teacher' && currentTeacherRecordId) {
          query = query.eq('teacher_id', currentTeacherRecordId);
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.target_audience && filters.target_audience !== 'all') {
          query = query.eq('target_audience', filters.target_audience);
        }

        if (filters.teaching_type && filters.teaching_type !== 'all') {
          query = query.eq('teaching_type', filters.teaching_type);
        }

        if (filters.searchTerm && filters.searchTerm.trim() !== '') {
          const term = `%${filters.searchTerm.trim()}%`;
          query = query.or(
            `name->>ar.ilike.${term},name->>en.ilike.${term},name->>tr.ilike.${term},name->>fr.ilike.${term},name->>ur.ilike.${term},name->>id.ilike.${term},code.ilike.${term}`
          );
        }

        const { data: halaqasData, error: halaqasError } = await query.order('created_at', { ascending: false });
        if (halaqasError) throw halaqasError;

        if (!halaqasData || halaqasData.length === 0) return [];

        const halaqaIds = halaqasData.map((h: any) => h.id);

        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, status, halaqa_id')
          .in('halaqa_id', halaqaIds);

        if (studentsError) {
          console.warn('Error fetching students count:', studentsError.message);
        }

        const halaqasWithStudents = halaqasData.map((halaqa: any) => {
          const halaqaStudents = (studentsData || []).filter(
            (s: any) => s.halaqa_id === halaqa.id && (!s.status || s.status === 'active')
          );

          return {
            ...halaqa,
            students: halaqaStudents,
            students_count: halaqaStudents.length,
          };
        });

        return halaqasWithStudents as Halaqa[];
      } catch (err: any) {
        console.warn('Halaqas Query Error:', err?.message || err);
        return [];
      }
    },
    enabled: isValidAcademyId && enabled,
    retry: 1,
  });

  const sanitizeHalaqaPayload = (data: Partial<Halaqa>) => {
    const cleaned = { ...data };
    delete cleaned.id;
    delete cleaned.academyId;
    delete cleaned.track;
    delete cleaned.type;
    delete cleaned.timezone;
    delete cleaned.selectedDays;
    delete cleaned.name_text;
    delete cleaned.teachers;
    delete cleaned.curricula;
    delete cleaned.student_halaqas;
    delete cleaned.students;
    delete cleaned.students_count;
    delete cleaned.student_count;
    delete cleaned.created_at;
    return cleaned;
  };

  const createHalaqaMutation = useMutation({
    mutationFn: async (halaqaData: Partial<Halaqa>) => {
      const currentAcademyId = academyId || localStorage.getItem('active_academy_id') || localStorage.getItem('academy_id');
      
      const isCurrentValid = Boolean(
        currentAcademyId &&
        currentAcademyId !== 'undefined' &&
        typeof currentAcademyId === 'string' &&
        currentAcademyId.trim() !== ''
      );

      if (!isCurrentValid) {
        throw new Error('معرف الأكاديمية غير صالح أو غير موجود في الجلسة');
      }

      const cleanedData = sanitizeHalaqaPayload(halaqaData);

      const payload = {
        ...cleanedData,
        academy_id: currentAcademyId,
        start_time: formatTimeForDb(halaqaData.start_time),
        end_time: formatTimeForDb(halaqaData.end_time),
      };

      const { data, error } = await supabase
        .from('halaqas')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halaqas'] });
    },
  });

  const updateHalaqaMutation = useMutation({
    mutationFn: async ({ id, ...halaqaData }: Partial<Halaqa> & { id: string }) => {
      const cleanedData = sanitizeHalaqaPayload(halaqaData);

      const payload: any = {
        ...cleanedData,
        updated_at: new Date().toISOString(),
      };

      if (halaqaData.start_time) payload.start_time = formatTimeForDb(halaqaData.start_time);
      if (halaqaData.end_time) payload.end_time = formatTimeForDb(halaqaData.end_time);

      const { data, error } = await supabase
        .from('halaqas')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halaqas'] });
    },
  });

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
    onMutate: async ({ halaqaId, currentArchived }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousHalaqas = queryClient.getQueryData<Halaqa[]>(queryKey);

      if (previousHalaqas) {
        queryClient.setQueryData<Halaqa[]>(queryKey, (old = []) =>
          old.map((item) =>
            item.id === halaqaId ? { ...item, is_archived: !currentArchived } : item
          )
        );
      }

      return { previousHalaqas };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousHalaqas) {
        queryClient.setQueryData(queryKey, context.previousHalaqas);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const createHalaqa = useCallback(
    async (data: Partial<Halaqa>) => {
      try {
        const result = await createHalaqaMutation.mutateAsync(data);
        return { success: true, data: result };
      } catch (err: any) {
        return { success: false, error: err?.message || 'فشلت عملية إنشاء الحلقة' };
      }
    },
    [createHalaqaMutation]
  );

  const updateHalaqa = useCallback(
    async (data: Partial<Halaqa> & { id: string }) => {
      try {
        const result = await updateHalaqaMutation.mutateAsync(data);
        return { success: true, data: result };
      } catch (err: any) {
        return { success: false, error: err?.message || 'فشلت عملية تعديل الحلقة' };
      }
    },
    [updateHalaqaMutation]
  );

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
    createHalaqa,
    updateHalaqa,
    toggleArchiveHalaqa,
    isCreating: createHalaqaMutation.isPending,
    isUpdating: updateHalaqaMutation.isPending,
    academyId, // 👈 تم إضافتها لمنع أي خطأ destructuring نهائياً
  };
};

export default useHalaqas;
