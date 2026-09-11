import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface ExamRecord {
  id: string;
  academy_id: string;
  student_id: string;
  teacher_id?: string | null;
  halaqa_id?: string | null;
  exam_type: string;
  from_surah_id?: number | null;
  to_surah_id?: number | null;
  from_ayah?: number | null;
  to_ayah?: number | null;
  date: string;
  mistakes?: number;
  prompts?: number;
  tajweed_grade?: string | null;
  final_score: number;
  max_score?: number;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export type AddExamInput = Omit<ExamRecord, 'id' | 'created_at' | 'updated_at'> & {
  academy_id?: string;
};

// ── Main Hook ───────────────────────────────────────────────────

export function useExams(academyId?: string | null) {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isValidAcademyId = Boolean(
    academyId &&
    academyId !== 'undefined' &&
    typeof academyId === 'string' &&
    academyId.trim() !== ''
  );

  // 1. جلب اختبارات طالب محدد أو حلقة معينة
  const fetchExams = useCallback(
    async (studentId?: string, halaqaId?: string) => {
      if (!isValidAcademyId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let query = supabase
          .from('exams')
          .select('*')
          .eq('academy_id', academyId!)
          .order('date', { ascending: false });

        if (studentId) query = query.eq('student_id', studentId);
        if (halaqaId) query = query.eq('halaqa_id', halaqaId);

        const { data, error } = await query;
        if (error) throw error;

        setExams((data as ExamRecord[]) || []);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setExams([]);
      } finally {
        setLoading(false);
      }
    },
    [academyId, isValidAcademyId]
  );

  // 2. إضافة نتيجة اختبار جديدة
  const addExamResult = useCallback(
    async (examData: AddExamInput) => {
      if (!isValidAcademyId) {
        return { success: false, error: new Error('Invalid or missing academy ID') };
      }

      try {
        const payload = {
          ...examData,
          academy_id: academyId!,
          date: examData.date || new Date().toISOString().split('T')[0],
          mistakes: examData.mistakes ?? 0,
          prompts: examData.prompts ?? 0,
          final_score: examData.final_score ?? 0,
          max_score: examData.max_score ?? 100,
        };

        const { data, error } = await supabase
          .from('exams')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        const newExam = data as ExamRecord;
        setExams((prev) => [newExam, ...prev]);

        return { success: true, data: newExam };
      } catch (err: any) {
        console.error('Error adding exam result:', err?.message || err);
        return { success: false, error: err };
      }
    },
    [academyId, isValidAcademyId]
  );

  return {
    exams,
    loading,
    fetchExams,
    addExamResult,
  };
}

export default useExams;
