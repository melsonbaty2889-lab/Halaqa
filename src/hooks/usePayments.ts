import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface PaymentRecord {
  id: string;
  academy_id: string;
  student_id: string;
  plan_id?: string;
  amount: number;
  currency?: string;
  period_start?: string;
  period_end?: string;
  due_date?: string;
  paid_at?: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  payment_method?: string;
  invoice_number?: string;
  notes?: string;
  created_at: string;
}

export interface OverduePayment {
  student_id: string;
  academy_id: string;
  student_name: Record<string, string> | string;
  parent_phone?: string;
  plan_name?: Record<string, string> | string;
  price: number;
  next_payment_date: string;
  days_overdue: number;
}

export function usePayments(academyId?: string | null) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isValidAcademyId = Boolean(
    academyId &&
    academyId !== 'undefined' &&
    typeof academyId === 'string' &&
    academyId.trim() !== ''
  );

  // جلب سجلات المدفوعات لطالب أو للأكاديمية
  const fetchPayments = useCallback(async (studentId?: string) => {
    if (!isValidAcademyId) return;
    if (isMounted.current) setLoading(true);

    try {
      let query = supabase
        .from('payments')
        .select('*')
        .eq('academy_id', academyId!)
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (isMounted.current) {
        setPayments((data as PaymentRecord[]) || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [academyId, isValidAcademyId]);

  // جلب قائمة المتأخرات المالية من الـ View الجاهز
  const fetchOverduePayments = useCallback(async () => {
    if (!isValidAcademyId) return;
    if (isMounted.current) setLoading(true);

    try {
      const { data, error } = await supabase
        .from('v_overdue_payments')
        .select('*')
        .eq('academy_id', academyId!);

      if (error) throw error;

      if (isMounted.current) {
        setOverduePayments((data as OverduePayment[]) || []);
      }
    } catch (err) {
      console.error('Error fetching overdue payments:', err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [academyId, isValidAcademyId]);

  // تسجيل دفعة جديدة
  const recordPayment = useCallback(async (paymentData: Partial<PaymentRecord>) => {
    if (!isValidAcademyId) {
      return { success: false, error: 'معرف الأكاديمية غير صالح' };
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{ ...paymentData, academy_id: academyId! }])
        .select()
        .single();

      if (error) throw error;

      if (isMounted.current) {
        setPayments((prev) => [data as PaymentRecord, ...prev]);
      }

      // تحديث قائمة المتأخرات تلقائياً عند تسجيل الدفع
      fetchOverduePayments();

      return { success: true, data };
    } catch (err) {
      console.error('Error recording payment:', err);
      return { success: false, error: err };
    }
  }, [academyId, isValidAcademyId, fetchOverduePayments]);

  return {
    payments,
    overduePayments,
    loading,
    fetchPayments,
    fetchOverduePayments,
    recordPayment,
  };
}

export default usePayments;
