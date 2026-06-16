import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, PageHeader, TH, TD, Badge, Btn } from './UI';
import { useTranslation } from 'react-i18next'; // 🌐 استيراد مكتبة الترجمة العالمية

const DEFAULT_SUBSCRIPTION_AMOUNT = 150;

export default function Payments({ students, academyId }) {
  // 🌐 استخراج تابع الترجمة والتحكم باللغات
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

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

  // 🧠 دالة الترجمة الذكية المنسجمة مع بقية صفحات الموقع
  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

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
    if (error) alert(translateText('errorOccurred', 'حدث خطأ: ', 'An error occurred: ') + error.message);
    else if (data) setPaymentsData(prev => ({ ...prev, [studentId]: data[0] }));
    setActionLoading(null);
  };

  // 💬 دالة إرسال التذكير الذكية متعددة اللغات والقابلة للتخصيص الفوري من المعلم
  const sendReminder = (student, currentRecord) => {
    if (!student.parent_phone) {
      return alert(translateText('noPhone', 'لا يوجد رقم هاتف مسجل لولي الأمر.', 'No phone number registered for the parent.'));
    }

    const isPaid = currentRecord?.status === 'مدفوع';
    
    // تنسيق عرض الشهر بشكل مقروء (مثال: 2026-06)
    const [year, month] = selectedMonth.split('-');
    const formattedMonth = `${month}/${year}`;

    // 1️⃣ صياغة قوالب الرسائل الاحترافية الفخمة بناءً على حالة الدفع واللغة الحالية
    let defaultMsg = "";
    if (isRtl) {
      defaultMsg = isPaid 
        ? `السلام عليكم ورحمة الله وبركاته،\nنود أن نشكركم على سداد اشتراك الطالب (${student.name}) لشهر (${formattedMonth}).\nبارك الله فيكم وفي جهودكم مكللة بالنجاح. ✨\n— إدارة الحلقة الذكية`
        : `السلام عليكم ورحمة الله وبركاته،\nنود تذكيركم الكريم بخصوص استحقاق اشتراك الطالب (${student.name}) لشهر (${formattedMonth}) بمبلغ (${DEFAULT_SUBSCRIPTION_AMOUNT} ج.م).\nشاكرين ومقدرين حسن تعاونكم وحرصكم الدائم. 🙏\n— إدارة الحلقة الذكية`;
    } else {
      defaultMsg = isPaid
        ? `Peace be upon you,\nWe would like to thank you for paying the subscription for student (${student.name}) for the month of (${formattedMonth}).\nThank you for your support! ✨\n— Smart Halaqa Management`
        : `Peace be upon you,\nThis is a friendly reminder regarding the subscription for student (${student.name}) for the month of (${formattedMonth}) amounting to (${DEFAULT_SUBSCRIPTION_AMOUNT} EGP).\nThank you for your cooperation! 🙏\n— Smart Halaqa Management`;
    }

    // 2️⃣ تمكين ميزة تخصيص الرسالة: تفتح للمعلم نافذة منبثقة لتعديل النص قبل الإرسال
    const userCustomMessage = prompt(
      translateText(
        'customizePrompt', 
        'يمكنك مراجعة وتعديل نص الرسالة لولي الأمر قبل فتح الواتساب:', 
        'You can review and edit the message text before opening WhatsApp:'
      ), 
      defaultMsg
    );

    // إذا ضغط المعلم "إلغاء" (Cancel) لا يتم فتح الواتساب
    if (userCustomMessage === null) return;

    // تنظيف رقم الهاتف والتأكد من إضافة رمز الدولة (مصر 2 كمثال افتراضي، ويمكن تعديلها لتكون مرنة دولياً)
    let cleanPhone = student.parent_phone.trim().replace(/[^\d]/g, '');
    if (!cleanPhone.startsWith('2') && cleanPhone.length === 11) {
      cleanPhone = '2' + cleanPhone; // إضافة رمز مصر إذا كان الرقم 11 خانة ولا يبدأ بـ 2
    }

    // فتح الرابط بشكل آمن وعالمي
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(userCustomMessage)}`, "_blank");
  };

  const total = Object.values(paymentsData).reduce((sum, r) => sum + (r.status === 'مدفوع' ? r.amount : 0), 0);

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif" }}>
      <PageHeader 
        title={translateText('financialTitle', 'المالية واشتراكات الطلاب', 'Financials & Student Subscriptions')} 
        sub={translateText('financialSub', 'متابعة الإيرادات والتحصيل', 'Revenue & Collection Tracking')} 
      />
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px', 
        alignItems: 'center', 
        flexDirection: isMobile ? 'column' : 'row' 
      }}>
        <Card style={{ padding: '15px', flex: 1, borderRight: isRtl ? `4px solid ${C.gold}` : 'none', borderLeft: !isRtl ? `4px solid ${C.gold}` : 'none', width: '100%' }}>
          <h4 style={{ margin: 0, color: C.muted }}>{translateText('totalCollected', 'إجمالي التحصيل', 'Total Collected')}</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#fff' }}>
            {total} {translateText('currency', 'ج.م', 'EGP')}
          </p>
        </Card>
        
        {/* 🎨 تحديث حقل اختيار الشهر ليناسب الطابع المظلم الفخم الفاخر للموقع */}
        <input 
          type="month" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)} 
          style={{ 
            padding: '12px 16px', 
            borderRadius: '12px', 
            width: isMobile ? '100%' : 'auto',
            background: '#162030',
            border: '1px solid #334155',
            color: '#fff',
            outline: 'none',
            boxSizing: 'border-box',
            fontSize: '14px',
            fontWeight: '600'
          }} 
        />
      </div>

      <Card style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {students?.map(s => {
              const rec = paymentsData[s.id];
              const isPaid = rec?.status === 'مدفوع';
              return (
                <div key={s.id} style={{ background: C.surface, padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>{s.name}</div>
                    <Badge color={isPaid ? "success" : "danger"}>
                      {isPaid ? translateText('paidStatus', 'مسدد', 'Paid') : translateText('unpaidStatus', 'معلّق', 'Pending')}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Btn style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 'bold' }} onClick={() => handleTogglePayment(s.id, rec)}>
                      {actionLoading === s.id ? "..." : isPaid ? translateText('cancelAction', 'إلغاء', 'Cancel') : translateText('payAction', 'قبض', 'Collect')}
                    </Btn>
                    <Btn style={{ padding: '8px 16px', fontSize: '12px', background: '#128C7E', color: '#fff', fontWeight: 'bold' }} onClick={() => sendReminder(s, rec)}>
                      {translateText('whatsappBtn', 'واتساب 💬', 'WhatsApp 💬')}
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: C.surface, borderRadius: '12px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('studentName', 'اسم الطالب', 'Student Name')}</TH>
                <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('statusLabel', 'الحالة', 'Status')}</TH>
                <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('actionsLabel', 'الإجراءات', 'Actions')}</TH>
              </tr>
            </thead>
            <tbody>
              {students?.map(s => {
                const rec = paymentsData[s.id];
                const isPaid = rec?.status === 'مدفوع';
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'all 0.2s' }}>
                    <TD style={{ color: '#fff', fontWeight: '500' }}>{s.name}</TD>
                    <TD>
                      <Badge color={isPaid ? "success" : "danger"}>
                        {isPaid ? translateText('paidStatus', 'مسدد', 'Paid') : translateText('unpaidStatus', 'معلّق', 'Pending')}
                      </Badge>
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Btn style={{ fontWeight: '600' }} onClick={() => handleTogglePayment(s.id, rec)}>
                          {actionLoading === s.id ? "..." : isPaid ? translateText('cancelAction', 'إلغاء', 'Cancel') : translateText('payAction', 'قبض', 'Collect')}
                        </Btn>
                        <Btn style={{ background: '#128C7E', color: '#fff', fontWeight: '600' }} onClick={() => sendReminder(s, rec)}>
                          {translateText('whatsappBtn', 'واتساب 💬', 'WhatsApp 💬')}
                        </Btn>
                      </div>
                    </TD>
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
