import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, PageHeader, TH, TD, Badge, Btn } from './UI';

// 1. ثوابت النظام (Configuration)
const DEFAULT_SUBSCRIPTION_AMOUNT = 150;

export default function Payments({ students, academyId }) {
  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [paymentsData, setPaymentsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // 📡 جلب البيانات المالية
  useEffect(() => {
    const fetchPayments = async () => {
      if (!academyId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('id, student_id, amount, status')
        .eq('month', selectedMonth)
        .eq('academy_id', academyId);

      if (!error && data) {
        const mapped = {};
        data.forEach(r => mapped[r.student_id] = r);
        setPaymentsData(mapped);
      }
      setLoading(false);
    };
    fetchPayments();
  }, [selectedMonth, academyId]);

  // 💰 تحديث الحالة المالية (Upsert)
  const handleTogglePayment = async (studentId, currentRecord) => {
    setActionLoading(studentId);
    const isPaid = currentRecord?.status === 'مدفوع';
    
    const payload = {
      ...(currentRecord?.id ? { id: currentRecord.id } : {}),
      student_id: studentId,
      academy_id: academyId,
      month: selectedMonth,
      amount: isPaid ? 0 : DEFAULT_SUBSCRIPTION_AMOUNT,
      status: isPaid ? 'غير مدفوع' : 'مدفوع'
    };

    const { data, error } = await supabase.from('payments').upsert(payload).select();
    
    if (error) {
      alert("حدث خطأ: " + error.message);
    } else if (data) {
      setPaymentsData(prev => ({ ...prev, [studentId]: data[0] }));
    }
    setActionLoading(null);
  };

  // 💬 تذكير الواتساب (مع التحقق من وجود الهاتف)
  const sendReminder = (student, currentRecord) => {
    const phone = student.parent_phone;
    if (!phone) return alert("عذراً، لا يوجد رقم هاتف مسجل لهذا الطالب.");

    const isPaid = currentRecord?.status === 'مدفوع';
    const msg = isPaid 
      ? `نشكركم على سداد اشتراك ${student.name} لشهر ${selectedMonth}.`
      : `تذكير بلطف: نرجو سداد اشتراك ${student.name} لشهر ${selectedMonth}.`;
      
    window.open(`https://wa.me/2${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // 📊 حسابات سريعة
  const total = Object.values(paymentsData).reduce((sum, r) => sum + (r.status === 'مدفوع' ? r.amount : 0), 0);

  return (
    <div>
      <PageHeader title="المالية واشتراكات الطلاب" sub="متابعة الإيرادات وتذكير أولياء الأمور" />

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
        <Card style={{ padding: '15px', flex: 1, borderRight: `4px solid ${C.gold}` }}>
          <h4 style={{ margin: 0, color: C.muted }}>إجمالي التحصيل</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{total} ج.م</p>
        </Card>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '10px', borderRadius: '8px' }} />
      </div>

      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <TH>اسم الطالب</TH>
              <TH>الحالة</TH>
              <TH>الإجراءات</TH>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const rec = paymentsData[s.id];
              const isPaid = rec?.status === 'مدفوع';
              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <TD>{s.name}</TD>
                  <TD><Badge color={isPaid ? "success" : "danger"}>{isPaid ? "مسدد" : "معلّق"}</Badge></TD>
                  <TD>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Btn onClick={() => handleTogglePayment(s.id, rec)} disabled={actionLoading === s.id}>
                        {actionLoading === s.id ? "..." : isPaid ? "إلغاء" : "قبض"}
                      </Btn>
                      <Btn onClick={() => sendReminder(s, rec)}>واتساب 💬</Btn>
                    </div>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
