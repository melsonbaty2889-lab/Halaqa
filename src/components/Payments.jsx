import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { Card, PageHeader, TH, TD, Badge, Btn } from './UI';
import { useTranslation } from 'react-i18next';

const DEFAULT_SUBSCRIPTION_AMOUNT = 150;

export default function Payments({ students, academyId }) {
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

  // States الخاصة بنافذة الواتساب الاحترافية الجديدة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

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

  // تحضير فتح النافذة المنبثقة المخصصة للواتساب بدلاً من Prompt المتصفح
  const openReminderModal = (student, currentRecord) => {
    if (!student.parent_phone) {
      return alert(translateText('noPhone', 'لا يوجد رقم هاتف مسجل لولي الأمر.', 'No phone number registered for the parent.'));
    }

    const isPaid = currentRecord?.status === 'مدفوع';
    const [year, month] = selectedMonth.split('-');
    const formattedMonth = `${month}/${year}`;

    let defaultMsg = "";
    if (isRtl) {
      defaultMsg = isPaid 
        ? `السلام عليكم ورحمة الله وبركاته،\nنود أن نشكركم على سداد اشتراك الطالب (${student.name}) لشهر (${formattedMonth}).\nبارك الله فيكم وفي جهودكم مكللة بالنجاح. ✨\n— إدارة الحلقة الذكية`
        : `السلام عليكم ورحمة الله وبركاته،\nنود تذكيركم الكريم بخصوص استحقاق اشتراك الطالب (${student.name}) لشهر (${formattedMonth}) بمبلغ (${DEFAULT_SUBSCRIPTION_AMOUNT} ج.م).\nشاكرين ومقرارين حسن تعاونكم وحرصكم الدائم. 🙏\n— إدارة الحلقة الذكية`;
    } else {
      defaultMsg = isPaid
        ? `Peace be upon you,\nWe would like to thank you for paying the subscription for student (${student.name}) for the month of (${formattedMonth}).\nThank you for your support! ✨\n— Smart Halaqa Management`
        : `Peace be upon you,\nThis is a friendly reminder regarding the subscription for student (${student.name}) for the month of (${formattedMonth}) amounting to (${DEFAULT_SUBSCRIPTION_AMOUNT} EGP).\nThank you for your cooperation! 🙏\n— Smart Halaqa Management`;
    }

    setSelectedStudentForModal(student);
    setModalMessage(defaultMsg);
    setIsModalOpen(true);
  };

  // التنفيذ الفعلي للإرسال بعد المراجعة والتعديل داخل الـ Modal
  const handleConfirmWhatsAppSend = () => {
    if (!selectedStudentForModal) return;

    let cleanPhone = selectedStudentForModal.parent_phone.trim().replace(/[^\d]/g, '');
    if (!cleanPhone.startsWith('2') && cleanPhone.length === 11) {
      cleanPhone = '2' + cleanPhone;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(modalMessage)}`, "_blank");
    setIsModalOpen(false);
  };

  const total = Object.values(paymentsData).reduce((sum, r) => sum + (r.status === 'مدفوع' ? r.amount : 0), 0);

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif", minHeight: '100vh' }}>
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
        <Card style={{ padding: '15px', flex: 1, borderRight: isRtl ? `4px solid ${C.gold}` : 'none', borderLeft: !isRtl ? `4px solid ${C.gold}` : 'none', width: '100%', boxSizing: 'border-box' }}>
          <h4 style={{ margin: 0, color: C.muted, textAlign: isRtl ? 'right' : 'left' }}>{translateText('totalCollected', 'إجمالي التحصيل', 'Total Collected')}</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#fff', textAlign: isRtl ? 'right' : 'left' }}>
            {total} {translateText('currency', 'ج.م', 'EGP')}
          </p>
        </Card>
        
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {students?.map(s => {
              const rec = paymentsData[s.id];
              const isPaid = rec?.status === 'مدفوع';
              return (
                <div key={s.id} style={{ 
                  background: C.surface, 
                  padding: '16px', 
                  borderRadius: '14px', 
                  display: 'flex', 
                  flexDirection: isRtl ? 'row' : 'row-reverse', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ textAlign: isRtl ? 'right' : 'left', flex: 1, paddingLeft: isRtl ? '0' : '8px', paddingRight: isRtl ? '8px' : '0' }}>
                    <div style={{ fontWeight: '700', marginBottom: '6px', color: '#fff', fontSize: '15px', lineHeight: '1.4' }}>{s.name}</div>
                    <Badge color={isPaid ? "success" : "danger"}>
                      {isPaid ? translateText('paidStatus', 'مسدد', 'Paid') : translateText('unpaidStatus', 'معلّق', 'Pending')}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '90px' }}>
                    <Btn style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 'bold', width: '100%' }} onClick={() => handleTogglePayment(s.id, rec)}>
                      {actionLoading === s.id ? "..." : isPaid ? translateText('cancelAction', 'إلغاء', 'Cancel') : translateText('payAction', 'قبض', 'Collect')}
                    </Btn>
                    <Btn style={{ padding: '8px 14px', fontSize: '13px', background: '#128C7E', color: '#fff', fontWeight: 'bold', width: '100%' }} onClick={() => openReminderModal(s, rec)}>
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
                    <TD style={{ color: '#fff', fontWeight: '500', textAlign: isRtl ? 'right' : 'left' }}>{s.name}</TD>
                    <TD style={{ textAlign: isRtl ? 'right' : 'left' }}>
                      <Badge color={isPaid ? "success" : "danger"}>
                        {isPaid ? translateText('paidStatus', 'مسدد', 'Paid') : translateText('unpaidStatus', 'معلّق', 'Pending')}
                      </Badge>
                    </TD>
                    <TD style={{ textAlign: isRtl ? 'right' : 'left' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Btn style={{ fontWeight: '600' }} onClick={() => handleTogglePayment(s.id, rec)}>
                          {actionLoading === s.id ? "..." : isPaid ? translateText('cancelAction', 'إلغاء', 'Cancel') : translateText('payAction', 'قبض', 'Collect')}
                        </Btn>
                        <Btn style={{ background: '#128C7E', color: '#fff', fontWeight: '600' }} onClick={() => openReminderModal(s, rec)}>
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

      {/* 🌟 النافذة المنبثقة الاحترافية الفاخرة للتحكم الكامل بنص الواتساب قبل الإرسال */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#162030', borderRadius: '16px', width: '100%', maxWidth: '500px',
            border: '1px solid #334155', padding: '24px', boxSizing: 'border-box',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '18px', fontWeight: '700', textAlign: isRtl ? 'right' : 'left' }}>
              {translateText('reviewTitle', 'مراجعة وتعديل نص الرسالة', 'Review & Edit Message')}
            </h3>
            <p style={{ margin: '0 0 16px 0', color: C.muted, fontSize: '13px', textAlign: isRtl ? 'right' : 'left', lineHeight: '1.5' }}>
              {translateText('reviewSub', 'يمكنك تعديل الرسالة أدناه بحرية قبل الانتقال للواتساب لإرسالها لولي الأمر:', 'You can freely edit the message below before opening WhatsApp:')}
            </p>
            
            <textarea
              value={modalMessage}
              onChange={(e) => setModalMessage(e.target.value)}
              rows={6}
              style={{
                width: '100%', background: '#0f172a', border: '1px solid #334155',
                borderRadius: '12px', padding: '12px', color: '#fff', fontSize: '14px',
                fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box',
                lineHeight: '1.6', textAlign: isRtl ? 'right' : 'left'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
                  padding: '10px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {translateText('cancelModal', 'إلغاء', 'Cancel')}
              </button>
              <button 
                onClick={handleConfirmWhatsAppSend}
                style={{
                  background: '#128C7E', border: 'none', color: '#fff',
                  padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}
              >
                {translateText('sendModal', 'فتح الواتساب وإرسال 🚀', 'Open WhatsApp & Send 🚀')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
