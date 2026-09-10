import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface CertificateLog {
  id: string;
  academy_id: string;
  student_id: string;
  certificate_type: string;
  qr_hash?: string;
  issued_date: string;
  verified_url?: string;
  metadata?: Record<string, any>;
}

export function useCertificates(academyId?: string) {
  const [certificates, setCertificates] = useState<CertificateLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // جلب الشهادات الخاصة بطالب أو بالأكاديمية
  const fetchCertificates = useCallback(async (studentId?: string) => {
    if (!academyId) return;
    setLoading(true);

    try {
      let query = supabase
        .from('certificates_log')
        .select('*')
        .eq('academy_id', academyId)
        .order('issued_date', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCertificates(data as CertificateLog[]);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  // إصدار شهادة جديدة وتسجيلها
  const issueCertificate = useCallback(async (certData: Omit<CertificateLog, 'id' | 'issued_date'>) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('certificates_log')
        .insert([{ ...certData, academy_id: academyId, issued_date: now }])
        .select()
        .single();

      if (error) throw error;
      setCertificates((prev) => [data as CertificateLog, ...prev]);
      return { success: true, data };
    } catch (err) {
      console.error('Error issuing certificate:', err);
      return { success: false, error: err };
    }
  }, [academyId]);

  return {
    certificates,
    loading,
    fetchCertificates,
    issueCertificate,
  };
}

export default useCertificates;
