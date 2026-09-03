// src/hooks/useReports.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (studentId, startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('student_id', studentId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { reportData, loading, error, generateReport };
};
