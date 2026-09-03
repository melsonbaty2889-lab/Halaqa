import { useState } from 'react';
import { supabase } from '@/lip/supabase';

export const useReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (studentId, startDate, endDate) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('student_id', studentId)
        .gte('date', startDate)
        .lte('date', endDate);

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
