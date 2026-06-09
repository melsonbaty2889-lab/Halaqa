import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, PageHeader, TH, TD, Badge, Btn } from './UI';

const DEFAULT_SUBSCRIPTION_AMOUNT = 150;

export default function Payments({ students, academyId }) {
  // كشف حجم الشاشة للتجاوب
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [paymentsData, setPaymentsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

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
    if (error) alert("حدث خطأ: " + error.message);
    else if (data) setPaymentsData(prev => ({ ...prev, [studentId]: data[0] }));
    setActionLoading(null);
  };

  const sendReminder = (student, currentRecord) => {
    if (!student.parent_phone) return alert("لا يوجد رقم هاتف.");
    const isPaid = currentRecord?.status === 'مدفوع';
    const msg = isPaid ? `شكراً لسداد ${student.name}.` : `تذكير: نرجو سداد اشتراك ${student.name}.`;
    window.open(`https://wa.me/2${student.parent_phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const total = Object.values(paymentsData).reduce((sum, r) => sum + (r.status === 'مدفوع' ? r.amount : 0), 0);

  return (
    <div>
      <PageHeader title="المالية واشتراكات الطلاب" sub="متابعة الإيرادات" />
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
        <Card style={{ padding: '15px', flex: 1, borderRight: `4px solid ${C.gold}`, width: '100%' }}>
          <h4 style={{ margin: 0, color: C.muted }}>إجمالي التحصيل</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{total} ج.م</p>
        </Card>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '10px', borderRadius: '8px', width: isMobile ? '100%' : 'auto' }} />
      </div>

      <Card style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {students.map(s => {
              const rec = paymentsData[s.id];
              const isPaid = rec?.status === 'مدفوع';
              return (
                <div key={s.id} style={{ background: C.surface, padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{s.name}</div>
                    <Badge color={isPaid ? "success" : "danger"}>{isPaid ? "مسدد" : "معلّق"}</Badge>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Btn style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleTogglePayment(s.id, rec)}>
                      {actionLoading === s.id ? "..." : isPaid ? "إلغاء" : "قبض"}
                    </Btn>
                    <Btn style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => sendReminder(s, rec)}>واتساب 💬</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: C.surface, borderRadius: '12px' }}>
            <thead><tr><TH>اسم الطالب</TH><TH>الحالة</TH><TH>الإجراءات</TH></tr></thead>
            <tbody>
              {students.map(s => {
                const rec = paymentsData[s.id];
                const isPaid = rec?.status === 'مدفوع';
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <TD>{s.name}</TD>
                    <TD><Badge color={isPaid ? "success" : "danger"}>{isPaid ? "مسدد" : "معلّق"}</Badge></TD>
                    <TD><div style={{ display: 'flex', gap: '8px' }}>
                      <Btn onClick={() => handleTogglePayment(s.id, rec)}>{actionLoading === s.id ? "..." : isPaid ? "إلغاء" : "قبض"}</Btn>
                      <Btn onClick={() => sendReminder(s, rec)}>واتساب 💬</Btn>
                    </div></TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
