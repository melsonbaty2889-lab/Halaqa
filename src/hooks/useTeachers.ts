import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface Teacher {
  id: string;
  academy_id?: string | null;
  user_id?: string | null;
  name: string | { ar?: string; en?: string };
  phone?: string | null;
  email?: string | null;
  gender?: 'male' | 'female' | string;
  specialization?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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
}

// ── Main Hook ───────────────────────────────────────────────────

export const useTeachers = ({ academyId }: UseTeachersProps = {}): UseTeachersReturn => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (academyId) {
        query = query.eq('academy_id', academyId);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;
      setTeachers((data as Teacher[]) || []);
    } catch (err: any) {
      console.error('Error fetching teachers:', err);
      setError(err?.message || 'حدث خطأ أثناء جلب بيانات المعلمين');
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return { teachers, loading, error, refetch: fetchTeachers };
};

export default useTeachers;
