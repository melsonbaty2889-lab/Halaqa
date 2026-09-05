import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface DailyProgressReport {
  id: string;
  student_id: string;
  date: string;
  surah?: string;
  from_ayah?: number;
  to_ayah?: number;
  rating?: string;
  notes?: string;
  created_at?: string;
  [key: string]: any;
}

// ── Main Hook ───────────────────────────────────────────────────

export const useReports = () => {
  const [reportData, setReportData] = useState<DailyProgressReport[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (
    studentId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('student_id', studentId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (fetchError) throw fetchError;

      setReportData(data as DailyProgressReport[]);
    } catch (err: any) {
      console.error('Report Generation Error:', err);
      setError(err.message || 'حدث خطأ أثناء جلب التقارير');
    } finally {
      setLoading(false);
    }
  };

  const resetReport = () => {
    setReportData(null);
    setError(null);
  };

  return { 
    reportData, 
    loading, 
    error, 
    generateReport,
    resetReport 
  };
};

export default useReports;
