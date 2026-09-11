import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface CertificateLog {
  id: string;
  academy_id: string;
  student_id: string;
  certificate_type: string;
  qr_hash: string;
  issued_date: string;
  verified_url?: string;
  metadata?: Record<string, any>;
}

export type IssueCertificateInput = Omit<CertificateLog, 'id' | 'issued_date'> & {
  qr_hash?: string;
};

// ── Main Hook ───────────────────────────────────────────────────

export function useCertificates(academyId?: string | null) {
  const [certificates, setCertificates] = useState<CertificateLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isValidAcademyId = Boolean(
    academyId &&
    academyId !== 'undefined' &&
    typeof academyId === 'string' &&
    academyId.trim() !== ''
  );

  // 1. جلب الشهادات الخاصة بطالب أو بالأكاديمية
  const fetchCertificates = useCallback(
    async (studentId?: string) => {
      if (!isValidAcademyId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let query = supabase
          .from('certificates_log')
          .select('*')
          .eq('academy_id', academyId!)
          .order('issued_date', { ascending: false });

        if (studentId) {
          query = query.eq('student_id', studentId);
        }

        const { data, error } = await query;
        if (error) throw error;

        setCertificates((data as CertificateLog[]) || []);
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    },
    [academyId, isValidAcademyId]
  );

  // 2. إصدار شهادة جديدة وتسجيلها
  const issueCertificate = useCallback(
    async (certData: IssueCertificateInput) => {
      if (!isValidAcademyId) {
        return { success: false, error: new Error('Invalid or missing academy ID') };
      }

      try {
        const now = new Date().toISOString();
        
        // توليد QR Hash افتراضي فريد في حال عدم تمريره (لأن العامود NOT NULL في قاعدة البيانات)
        const generatedQrHash =
          certData.qr_hash ||
          `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        const payload = {
          ...certData,
          academy_id: academyId!,
          qr_hash: generatedQrHash,
          issued_date: now,
          metadata: certData.metadata || {},
        };

        const { data, error } = await supabase
          .from('certificates_log')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        const newCertificate = data as CertificateLog;
        setCertificates((prev) => [newCertificate, ...prev]);

        return { success: true, data: newCertificate };
      } catch (err: any) {
        console.error('Error issuing certificate:', err?.message || err);
        return { success: false, error: err };
      }
    },
    [academyId, isValidAcademyId]
  );

  return {
    certificates,
    loading,
    fetchCertificates,
    issueCertificate,
  };
}

export default useCertificates;
