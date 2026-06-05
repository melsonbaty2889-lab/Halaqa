import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, PageHeader, TH, TD, Badge, Btn } from './UI';

export default function Payments({ students, academyId }) {
  // الحصول على الشهر والسنة الحاليين كقيمة افتراضية (مثال: 2026-06)
  const getCurrentMonth = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [paymentsData, setPaymentsData] = useState({}); // { student_id: { paid, amount, id } }
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // لتحديد الزر الذي يتم تحميله حالياً

  // 📡 جلب سجلات المدفوعات للشهر المحدد من السيرفر
  useEffect(() => {
    const fetchPaymentsForMonth = async () => {
      if (!academyId || !selectedMonth) return;
      setLoadingRecords(true);
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('id, student_id, amount, status')
          .eq('month', selectedMonth);

        if (error) throw error;

        const mappedPayments = {};
        data.forEach(record => {
          mappedPayments[record.student_id] = {
            id: record.id,
            amount: record.amount,
            status: record.status // 'مدفوع' أو 'غير مدفوع'
          };
        });
        setPaymentsData(mappedPayments);
      } catch (err) {
        console.error("خطأ في جلب سجلات المالية:", err.message);
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchPaymentsForMonth();
  }, [selectedMonth, academyId]);

  // 💰 دالة رصد السداد السريع لطالب محدد أو تحديث حالته المادية سحابياً
  const handleTogglePayment = async (studentId, currentRecord) => {
    if (!academyId) return alert("خطأ في صلاحيات الحساب.");
    
    setActionLoading(studentId);
    
    const isPaid = currentRecord?.status === 'مدفوع';
    const nextStatus = isPaid ? 'غير مدفوع' : 'مدفوع';
    const defaultAmount = 150; // يمكنك جعل الاشتراك الافتراضي ديناميكي لاحقاً من الإعدادات

    const payload = {
      ...(currentRecord?.id ? { id: currentRecord.id } : {}),
      student_id: studentId,
      academy_id: academyId,
      month: selectedMonth,
      amount: isPaid ? 0 : defaultAmount,
      status: nextStatus
    };

    try {
      const { data, error } = await supabase
        .from('payments')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) throw error;

      if (data) {
        setPaymentsData(prev => ({
          ...prev,
          [studentId]: {
            id: data[0].id,
            amount: data[0].amount,
            status: data[0].status
          }
        }));
      }
    } catch (err) {
      alert("فشل تحديث الحالة المالية: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 💬 إرسال تذكير مالي احترافي ومخصص لولي الأمر عبر الواتساب
  const sendFinancialReminder = (student, currentRecord) => {
    const isPaid = currentRecord?.status === 'مدفوع';
    if (isPaid) {
      // رسالة شكر في حال السداد
      const thankYouMsg = `🎯 *إيصال سداد رقمي - الحلقة الذكية*\n\nالمحترم ولي أمر الطالب: *${student.name}*\n\nنشكركم على سداد اشتراك حلقة القرآن الكريم لشهر (${selectedMonth}).\nنسأل الله أن يبارك لكم في أولادكم وأن يرزقهم حفظ كتابه الكريم والعمل به. 🌸`;
      window.open(`https://wa.me/2${student.phone}?text=${encodeURIComponent(thankYouMsg)}`, "_blank");
    } else {
      // رسالة تذكير مهذبة وقوية في حال عدم السداد
      const reminderMsg = `🕌 *تذكير راقي - منصة الحلقة الذكية*\n\nالمحترم ولي أمر الطالب الكريم: *${student.name}*\n\nنود تذكير سيادتكم بلطف بموعد سداد اشتراك الحلقة المخصص للابن لشهر (${selectedMonth}). \n\nشاكرين لكم جداً حسن تعاونكم وحرصكم الدائم على دعم استمرار مسيرة الأبناء في رحلتهم المباركة مع القرآن الكريم. ✨`;
      window.open(`https://wa.me/2${student.phone}?text=${encodeURIComponent(reminderMsg)}`, "_blank");
    }
  };

  // حساب إحصائيات سريعة للشهر الحالي بالواجهة
  const totalCollected = Object.values(paymentsData).reduce((sum, rec) => sum + (rec.status === 'مدفوع' ? rec.amount : 0), 0);
  const paidCount = Object.values(paymentsData).filter(rec => rec.status === 'مدفوع').length;

  return (
    <div>
      <PageHeader
        title="الخزينة والمالية واشتراكات الطلاب"
        sub="إدارة الإيرادات الشهرية ومتابعة المتأخرات بحلقاتك"
      />

      {/* لوحة التحكم المصغرة بالمالية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 16, borderRight: `4px solid ${C.gold}` }}>
          <h4 style={{ margin: 0, color: C.muted, fontSize: '0.85rem' }}>إجمالي المقبوضات لشهر ({selectedMonth})</h4>
          <p style={{ margin: '8px 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: C.gold }}>{totalCollected} ج.م</p>
        </Card>
        <Card style={{ padding: 16, borderRight: `4px solid #10B981` }}>
          <h4 style={{ margin: 0, color: C.muted, fontSize: '0.85rem' }}>عدد الاشتراكات المسددة</h4>
          <p style={{ margin: '8px 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>{paidCount} من {students.length}</p>
        </Card>
      </div>

      {/* شريط اختيار الشهر المالي */}
      <Card style={{ marginBottom: 20, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: C.text, fontSize: '0.9rem' }}>الدورة المالية المستهدفة:</span>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: C.bg,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontFamily: "'Cairo'",
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </Card>

      {/* كشف الطلاب المالي تفصيلياً */}
      {loadingRecords ? (
        <div style={{ color: C.gold, textAlign: 'center', padding: 40 }}>جاري جلب ومزامنة الحسابات المالية للسيرفر السحابي... ⏳</div>
      ) : students.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40, color: C.muted }}>لا يوجد طلاب مقيدين حالياً لعرض حساباتهم المالية.</Card>
      ) : (
        <Card style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                <TH>اسم الطالب</TH>
                <TH>حالة السداد</TH>
                <TH>المبلغ المستحق</TH>
                <TH style={{ textAlign: 'center' }}>إجراءات مالية وتذكيرات</TH>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const currentRecord = paymentsData[student.id] || null;
                const isPaid = currentRecord?.status === 'مدفوع';

                return (
                  <tr key={student.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <TD style={{ fontWeight: 700, color: C.text }}>{student.name}</TD>
                    <TD>
                      <Badge color={isPaid ? "success" : "danger"}>
                        {isPaid ? "✓ تم السداد" : "⚠️ معلّق الحساب"}
                      </Badge>
                    </TD>
                    <TD style={{ fontWeight: 'bold', color: isPaid ? '#10B981' : C.muted }}>
                      {isPaid ? `${currentRecord.amount} ج.م` : "150 ج.م"}
                    </TD>
                    <TD>
                      <div style={{ display: "flex", gap: 8, justifyContent: 'center' }}>
                        <Btn 
                          size="sm" 
                          variant={isPaid ? "secondary" : "success"}
                          disabled={actionLoading === student.id}
                          onClick={() => handleTogglePayment(student.id, currentRecord)}
                        >
                          {actionLoading === student.id ? "جاري..." : isPaid ? "إلغاء السداد 🔄" : "قبض الاشتراك 💵"}
                        </Btn>
                        <Btn 
                          size="sm" 
                          variant="secondary"
                          onClick={() => sendFinancialReminder(student, currentRecord)}
                        >
                          {isPaid ? "إرسال إيصال شكراً ✉️" : "تذكير بالواتساب 💬"}
                        </Btn>
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
