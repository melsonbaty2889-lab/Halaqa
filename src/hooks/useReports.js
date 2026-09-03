// src/hooks/useReports.js
import { useState } from 'react';
import { supabase } from '../lib/supabase'; // تعديل المسار ليتوافق مع باقي المشروع

export const useReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (studentId, startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);

      // تطبيق المبدأ المتوازن: جلب كافة حقول جدول التقييم/الإنجاز اليومي الرئيسي
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
