import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface ExamRecord {
  id: string;
  academy_id: string;
  student_id: string;
  teacher_id?: string;
  halaqa_id?: string;
  exam_type: string;
  from_surah_id?: number;
  to_surah_id?: number;
  from_ayah?: number;
  to_ayah?: number;
  date: string;
  mistakes?: number;
  prompts?: number;
  tajweed_grade?: string;
  final_score: number;
  max_score?: number;
  notes?: string;
  created_at: string;
}

export function useExams(academyId?: string) {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // جلب اختبارات طالب محدد أو حلقة معينة
  const fetchExams = useCallback(async (studentId?: string, halaqaId?: string) => {
    if (!academyId) return;
    setLoading(true);

    try {
      let query = supabase
        .from('exams')
        .select('*')
        .eq('academy_id', academyId)
        .order('date', { ascending: false });

      if (studentId) query = query.eq('student_id', studentId);
      if (halaqaId) query = query.eq('halaqa_id', halaqaId);

      const { data, error } = await query;
      if (error) throw error;
      setExams(data as ExamRecord[]);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  // إضافة نتيجة اختبار جديدة
  const addExamResult = useCallback(async (examData: Omit<ExamRecord, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([{ ...examData, academy_id: academyId }])
        .select()
        .single();

      if (error) throw error;
      setExams((prev) => [data as ExamRecord, ...prev]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding exam result:', err);
      return { success: false, error: err };
    }
  }, [academyId]);

  return {
    exams,
    loading,
    fetchExams,
    addExamResult,
  };
}

export default useExams;
