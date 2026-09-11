import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { normalizePhone } from '@/utils/formatters';

// ── Types & Interfaces ──────────────────────────────────────────

export interface Teacher {
  id: string;
  user_id?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  title?: string | null;
  specialization?: string | null;
  bio?: Record<string, any> | null;
  ijazas?: string[];
  teaching_mode?: string;
  employment_type?: string;
  monthly_salary?: number;
  hourly_rate?: number;
  vodafone_cash?: string | null;
  instapay_id?: string | null;
  max_halaqas?: number;
  max_students?: number;
  experience_years?: number;
  is_active?: boolean;
  is_teaching?: boolean;
  is_archived?: boolean;
  country?: string | null;
  created_at?: string;
  updated_at?: string;
  country_code?: string;
  [key: string]: any;
}

export interface UseTeachersProps {
  academyId?: string | null;
}

export interface UseTeachersReturn {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTeacher: (teacherData: Partial<Teacher>) => Promise<Teacher | null>;
  updateTeacher: (id: string, teacherData: Partial<Teacher>) => Promise<boolean>;
}

// ── Main Hook ───────────────────────────────────────────────────

export const useTeachers = ({ academyId }: UseTeachersProps = {}): UseTeachersReturn => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchTeachers = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      let query = supabase
        .from('teachers')
        .select('*, academy_teachers!inner(academy_id, is_active)')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (academyId) {
        query = query.eq('academy_teachers.academy_id', academyId);
      } else {
        query = supabase
          .from('teachers')
          .select('*')
          .eq('is_archived', false)
          .order('created_at', { ascending: false });
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      const cleanedTeachers: Teacher[] = (data || []).map((item: any) => {
        const { academy_teachers, ...teacherData } = item;
        return teacherData as Teacher;
      });

      if (isMountedRef.current) {
        setTeachers(cleanedTeachers);
      }
    } catch (err: any) {
      console.error('🚨 Error fetching teachers:', err);
      if (isMountedRef.current) {
        setError(err?.message || 'حدث خطأ أثناء جلب بيانات المعلمين');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [academyId]);

  const sanitizePayload = (data: Partial<Teacher>) => {
    const payload = { ...data };
    delete payload.country_code;
    delete payload.academy_teachers;
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;
    return payload;
  };

  const addTeacher = async (teacherData: Partial<Teacher>): Promise<Teacher | null> => {
    try {
      if (isMountedRef.current) setError(null);

      const countryCode = teacherData.country_code || teacherData.country || 'EG';
      const normalizedPhone = teacherData.phone
        ? normalizePhone(teacherData.phone, countryCode)
        : null;

      const payload = sanitizePayload({
        ...teacherData,
        phone: normalizedPhone,
      });

      const { data: newTeacher, error: insertError } = await supabase
        .from('teachers')
        .insert([payload])
        .select()
        .single();

      if (insertError) throw insertError;

      if (academyId && newTeacher) {
        const { error: relError } = await supabase
          .from('academy_teachers')
          .insert([{ academy_id: academyId, teacher_id: newTeacher.id, is_active: true }]);

        if (relError) throw relError;
      }

      await fetchTeachers();
      return newTeacher as Teacher;
    } catch (err: any) {
      console.error('🚨 Error adding teacher:', err);
      if (isMountedRef.current) {
        setError(err?.message || 'حدث خطأ أثناء إضافة المعلم');
      }
      return null;
    }
  };

  const updateTeacher = async (id: string, teacherData: Partial<Teacher>): Promise<boolean> => {
    try {
      if (isMountedRef.current) setError(null);

      const countryCode = teacherData.country_code || teacherData.country || 'EG';
      const normalizedPhone = teacherData.phone
        ? normalizePhone(teacherData.phone, countryCode)
        : teacherData.phone;

      const payload = sanitizePayload({
        ...teacherData,
        ...(teacherData.phone && { phone: normalizedPhone }),
      });

      const { error: updateError } = await supabase
        .from('teachers')
        .update(payload)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchTeachers();
      return true;
    } catch (err: any) {
      console.error('🚨 Error updating teacher:', err);
      if (isMountedRef.current) {
        setError(err?.message || 'حدث خطأ أثناء تحديث بيانات المعلم');
      }
      return false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchTeachers();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchTeachers]);

  return { teachers, loading, error, refetch: fetchTeachers, addTeacher, updateTeacher };
};

export default useTeachers;
