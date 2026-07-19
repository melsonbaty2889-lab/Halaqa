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

  // أنظمة الفلترة والبحث المتقدمة
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | paid | pending

  // نظام التنبيهات الذكي (Toast) بديل الـ alert التقليدي
  const [toast, setToast] = useState({ message: '', type: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 4000);
  };

  // نافذة التحصيل المنبثقة الاحترافية (Collection Modal) بديل الـ prompt التقليدي
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectStudent, setCollectStudent] = useState(null);
  const [collectAmount, setCollectAmount] = useState('');

  // نافذة الواتساب الاحترافية ونبرة الرسائل الدولية
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [msgTone, setMsgTone] = useState('friendly'); // friendly | official

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

  // فتح نافذة التحصيل وإعداد البيانات الخاصة بالطالب
  const openCollectModal = (student, currentRecord, expectedAmount) => {
    setCollectStudent({
      id: student.id,
      name: student.name,
      expectedAmount: expectedAmount,
      currentRecord: currentRecord
    });
    // افتراضياً يوضع المبلغ الحالي المسدد أو القيمة الكاملة المطلوبة تسهيلاً للمستخدم
    setCollectAmount(currentRecord ? currentRecord.amount.toString() : expectedAmount.toString());
    setIsCollectModalOpen(true);
  };

  // معالجة وحفظ عملية التحصيل من النافذة المنبثقة المخصصة
  const handleConfirmPayment = async () => {
    if (!collectStudent) return;
    setActionLoading(collectStudent.id);
    setIsCollectModalOpen(false);

    const parsedAmount = parseFloat(collectAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      showToast(translateText('invalidAmount', 'الرجاء إدخال مبلغ صحيح', 'Please enter a valid amount'), 'error');
      setActionLoading(null);
      return;
    }

    let status = 'غير مدفوع';
    if (parsedAmount >= collectStudent.expectedAmount) {
      status = 'مدفوع';
    } else if (parsedAmount > 0) {
      status = 'مدفوع جزئياً';
    }

    const payload = {
      ...(collectStudent.currentRecord?.id ? { id: collectStudent.currentRecord.id } : {}),
      student_id: collectStudent.id,
      academy_id: academyId,
      month: selectedMonth,
      amount: parsedAmount,
      status: status
    };

    const { data, error } = await supabase.from('payments').upsert(payload).select();
    if (error) {
      showToast(translateText('errorOccurred', 'حدث خطأ: ', 'An error occurred: ') + error.message, 'error');
    } else if (data) {
      setPaymentsData(prev => ({ ...prev, [collectStudent.id]: data[0] }));
      showToast(translateText('saveSuccess', 'تم تحديث حالة الدفع بنجاح ✨', 'Payment updated successfully ✨'), 'success');
    }
    setActionLoading(null);
    setCollectStudent(null);
  };

  // محرك إنشاء رسائل الواتساب متعدد الأنماط والنبرات دولياً
  const generateWhatsAppMessage = (student, currentRecord, tone, lang) => {
    const isRtlLang = lang === 'ar';
    const [year, month] = selectedMonth.split('-');
    const formattedMonth = `${month}/${year}`;
    const expectedAmount = student.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;
    const currency = student.currency || (isRtlLang ? 'ج.م' : 'EGP');
    
    const isPaid = currentRecord?.status === 'مدفوع';
    const isPartial = currentRecord?.status === 'مدفوع جزئياً';
    const paidAmount = currentRecord?.amount || 0;
    const remainingAmount = expectedAmount - paidAmount;

    if (isPaid) {
      return isRtlLang
        ? `السلام عليكم ورحمة الله وبركاته،\nنود أن نشكركم على سداد اشتراك الطالب (${student.name}) لشهر (${formattedMonth}).\nبارك الله فيكم وفي جهودكم مكللة بالنجاح. ✨\n— إدارة الأكاديمية`
        : `Peace be upon you,\nWe would like to thank you for paying the subscription for student (${student.name}) for the month of (${formattedMonth}).\nThank you for your support! ✨\n— Academy Management`;
    }

    if (isPartial) {
      return isRtlLang
        ? `السلام عليكم ورحمة الله وبركاته،\nنود تذكيركم بخصوص المتبقي من اشتراك الطالب (${student.name}) لشهر (${formattedMonth}). تم سداد (${paidAmount} ${currency}) والمتبقي المستحق هو (${remainingAmount} ${currency}).\nشاكرين ومقدرين حسن تعاونكم. 🙏\n— إدارة الأكاديمية`
        : `Peace be upon you,\nThis is a friendly reminder regarding the remaining fee for student (${student.name}) for the month of (${formattedMonth}). Paid: (${paidAmount} ${currency}), Remaining due: (${remainingAmount} ${currency}).\nThank you for your cooperation! 🙏\n— Academy Management`;
    }

    if (isRtlLang) {
      if (tone === 'official') {
        return `إشعار رسمي السادة أولياء الأمور الكرام،\nيرجى التكرم بالعلم أن اشتراك الطالب (${student.name}) لشهر (${formattedMonth}) مستحق السداد بمبلغ (${expectedAmount} ${currency}).\nالرجاء المسارعة بالتسوية المالية لضمان استمرارية العملية التعليمية بانتظام.\n— الشؤون المالية للأكاديمية`;
      }
      return `السلام عليكم ورحمة الله وبركاته،\nنود تذكيركم الكريم بخصوص استحقاق اشتراك الطالب (${student.name}) لشهر (${formattedMonth}) بمبلغ (${expectedAmount} ${currency}).\nشاكرين ومقدرين حسن تعاونكم وحرصكم الدائم. 🙏\n— إدارة الحلقة`;
    } else {
      if (tone === 'official') {
        return `Official Notice to respected parents,\nPlease be informed that the subscription fee for student (${student.name}) for (${formattedMonth}) is due. Amount: (${expectedAmount} ${currency}).\nPlease settle the payment promptly to ensure continuous classes.\n— Finance Department`;
      }
      return `Peace be upon you,\nThis is a friendly reminder regarding the subscription for student (${student.name}) for the month of (${formattedMonth}) amounting to (${expectedAmount} ${currency}).\nThank you for your cooperation! 🙏\n— Center Management`;
    }
  };

  const openReminderModal = (student, currentRecord) => {
    if (!student.parent_phone) {
      return showToast(translateText('noPhone', 'لا يوجد رقم هاتف مسجل لولي الأمر.', 'No phone number registered for the parent.'), 'error');
    }
    setSelectedStudentForModal(student);
    setMsgTone('friendly');
    const defaultMsg = generateWhatsAppMessage(student, currentRecord, 'friendly', currentLang);
    setModalMessage(defaultMsg);
    setIsModalOpen(true);
  };

  const handleToneChange = (newTone) => {
    setMsgTone(newTone);
    if (selectedStudentForModal) {
      const rec = paymentsData[selectedStudentForModal.id];
      const updatedMsg = generateWhatsAppMessage(selectedStudentForModal, rec, newTone, currentLang);
      setModalMessage(updatedMsg);
    }
  };

  const handleConfirmWhatsAppSend = () => {
    if (!selectedStudentForModal) return;

    let cleanPhone = selectedStudentForModal.parent_phone.trim().replace(/[^\d]/g, '');
    
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '2' + cleanPhone;
    } else if (cleanPhone.startsWith('00')) {
      cleanPhone = cleanPhone.substring(2);
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(modalMessage)}`, "_blank");
    setIsModalOpen(false);
  };

  // الحساب المتقدم للمؤشرات الثلاثية
  let totalCollected = 0;
  let totalPending = 0;

  students?.forEach(s => {
    const rec = paymentsData[s.id];
    const expected = s.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;
    if (rec?.status === 'مدفوع') {
      totalCollected += rec.amount || expected;
    } else if (rec?.status === 'مدفوع جزئياً') {
      totalCollected += rec.amount || 0;
      totalPending += Math.max(0, expected - (rec.amount || 0));
    } else {
      totalPending += expected;
    }
  });

  const totalTarget = totalCollected + totalPending;
  const collectionRate = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  // محرك الفلترة المحلي المزدوج
  const filteredStudents = students?.filter(s => {
    const rec = paymentsData[s.id];
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.parent_phone && s.parent_phone.includes(searchTerm));
    
    const isPaid = rec?.status === 'مدفوع';
    const isPartial = rec?.status === 'مدفوع جزئياً';

    if (activeTab === 'paid') return matchesSearch && (isPaid || isPartial);
    if (activeTab === 'pending') return matchesSearch && !isPaid;
    return matchesSearch;
  });

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif", minHeight: '100vh', paddingBottom: '40px' }}>
      
      {/* نظام التنبيهات المخصص العائم (Toast CSS Component) */}
      {toast.message && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#fff',
          padding: '12px 24px', borderRadius: '10px', zIndex: 10000, fontWeight: '700',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.3s ease-in-out', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <PageHeader 
        title={translateText('financialTitle', 'المالية واشتراكات الطلاب', 'Financials & Student Subscriptions')} 
        sub={translateText('financialSub', 'متابعة الإيرادات والتحصيل', 'Revenue & Collection Tracking')} 
      />
      
      {/* لوحة المؤشرات الثلاثية */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexDirection: isMobile ? 'column' : 'row' }}>
        <Card style={{ padding: '20px', flex: 1, borderRight: isRtl ? `4px solid #10b981` : 'none', borderLeft: !isRtl ? `4px solid #10b981` : 'none', width: '100%', boxSizing: 'border-box' }}>
          <h4 style={{ margin: 0, color: C.muted, fontSize: '14px' }}>{translateText('totalCollected', 'إجمالي التحصيل الفعلي', 'Total Collected')}</h4>
          <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '8px 0 0 0', color: '#10b981' }}>
            {totalCollected} <span style={{ fontSize: '14px', color: C.muted }}>{translateText('currency', 'ج.م', 'EGP')}</span>
          </p>
        </Card>

        <Card style={{ padding: '20px', flex: 1, borderRight: isRtl ? `4px solid #f59e0b` : 'none', borderLeft: !isRtl ? `4px solid #f59e0b` : 'none', width: '100%', boxSizing: 'border-box' }}>
          <h4 style={{ margin: 0, color: C.muted, fontSize: '14px' }}>{translateText('totalPending', 'المبالغ المعلقة/المتأخرة', 'Pending Balance')}</h4>
          <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '8px 0 0 0', color: '#f59e0b' }}>
            {totalPending} <span style={{ fontSize: '14px', color: C.muted }}>{translateText('currency', 'ج.م', 'EGP')}</span>
          </p>
        </Card>

        <Card style={{ padding: '20px', flex: 1, borderRight: isRtl ? `4px solid ${C.gold}` : 'none', borderLeft: !isRtl ? `4px solid ${C.gold}` : 'none', width: '100%', boxSizing: 'border-box' }}>
          <h4 style={{ margin: 0, color: C.muted, fontSize: '14px' }}>{translateText('collectionRate', 'نسبة إنجاز التحصيل', 'Collection Rate')}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>{collectionRate}%</p>
            <div style={{ flex: 1, height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${collectionRate}%`, height: '100%', background: C.gold, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </Card>
      </div>

      {/* قسم أدوات التحكم (البحث والفلترة والشهور) */}
      <div style={{ 
        display: 'flex', gap: '16px', marginBottom: '20px', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row'
      }}>
        <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('all')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'all' ? C.gold : '#162030', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
          >
            {translateText('tabAll', 'الكل', 'All')} ({students?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('paid')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'paid' ? '#10b981' : '#162030', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
          >
            {translateText('tabPaid', 'مسدد ✅', 'Paid')}
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'pending' ? '#ef4444' : '#162030', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
          >
            {translateText('tabPending', 'معلّق ⏳', 'Pending')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
          <input 
            type="text"
            placeholder={translateText('searchPlaceholder', 'بحث باسم الطالب أو الهاتف...', 'Search by student or phone...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 16px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: '14px', width: isMobile ? '100%' : '240px'
            }}
          />
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            style={{ padding: '10px 16px', borderRadius: '10px', background: '#162030', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: '14px', fontWeight: '600' }} 
          />
        </div>
      </div>

      {/* جدول البيانات واستعراض الطلاب */}
      <Card style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredStudents?.map(s => {
              const rec = paymentsData[s.id];
              const isPaid = rec?.status === 'مدفوع';
              const isPartial = rec?.status === 'مدفوع جزئياً';
              const expectedAmount = s.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;
              const currency = s.currency || (isRtl ? 'ج.م' : 'EGP');

              return (
                <div key={s.id} style={{ 
                  background: C.surface, padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: isRtl ? 'row' : 'row-reverse', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)', boxSizing: 'border-box'
                }}>
                  <div style={{ textAlign: isRtl ? 'right' : 'left', flex: 1 }}>
                    <div style={{ fontWeight: '700', marginBottom: '6px', color: '#fff', fontSize: '15px' }}>{s.name}</div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Badge color={isPaid ? "success" : isPartial ? "warning" : "danger"}>
                        {isPaid ? translateText('paidStatus', 'مسدد', 'Paid') : isPartial ? translateText('partialStatus', 'جزئي', 'Partial') : translateText('unpaidStatus', 'معلّق', 'Pending')}
                      </Badge>
                      {isPartial && <span style={{ fontSize: '12px', color: C.muted }}>({rec.amount} / {expectedAmount} {currency})</span>}
                      {!isPaid && !isPartial && <span style={{ fontSize: '12px', color: C.muted }}>({expectedAmount} {currency})</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '90px' }}>
                    <Btn style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 'bold' }} onClick={() => openCollectModal(s, rec, expectedAmount)}>
                      {actionLoading === s.id ? "..." : isPaid || isPartial ? translateText('cancelAction', 'تعديل/إلغاء', 'Edit/Cancel') : translateText('payAction', 'قبض', 'Collect')}
                    </Btn>
                    <Btn style={{ padding: '8px 14px', fontSize: '13px', background: '#128C7E', color: '#fff', fontWeight: 'bold' }} onClick={() => openReminderModal(s, rec)}>
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
                <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('expectedFee', 'الاشتراك المطلوب', 'Required Subscription')}</TH>
                <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('statusLabel', 'الحالة', 'Status')}</TH>
                <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('actionsLabel', 'الإجراءات', 'Actions')}</TH>
              </tr>
            </thead>
            <tbody>
              {filteredStudents?.map(s => {
                const rec = paymentsData[s.id];
                const isPaid = rec?.status === 'مدفوع';
                const isPartial = rec?.status === 'مدفوع جزئياً';
                const expectedAmount = s.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;
                const currency = s.currency || (isRtl ? 'ج.م' : 'EGP');

                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'all 0.2s' }}>
                    <TD style={{ color: '#fff', fontWeight: '500', textAlign: isRtl ? 'right' : 'left' }}>{s.name}</TD>
                    <TD style={{ color: '#94a3b8', textAlign: isRtl ? 'right' : 'left' }}>{expectedAmount} {currency}</TD>
                    <TD style={{ textAlign: isRtl ? 'right' : 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge color={isPaid ? "success" : isPartial ? "warning" : "danger"}>
                          {isPaid ? translateText('paidStatus', 'مسدد بالكامل', 'Fully Paid') : isPartial ? translateText('partialStatus', 'مسدد جزئياً', 'Partially Paid') : translateText('unpaidStatus', 'معلّق', 'Pending')}
                        </Badge>
                        {isPartial && <span style={{ fontSize: '13px', color: '#94a3b8' }}>({translateText('collectedLabel', 'المحصل', 'Collected')}: {rec.amount} {currency})</span>}
                      </div>
                    </TD>
                    <TD style={{ textAlign: isRtl ? 'right' : 'left' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Btn style={{ fontWeight: '600' }} onClick={() => openCollectModal(s, rec, expectedAmount)}>
                          {actionLoading === s.id ? "..." : isPaid || isPartial ? translateText('cancelAction', 'تعديل / إلغاء', 'Edit / Cancel') : translateText('payAction', 'قبض', 'Collect')}
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

      {/* نافذة تحصيل الاشتراكات المنبثقة والمخصصة (Collection Modal) */}
      {isCollectModalOpen && collectStudent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#162030', borderRadius: '16px', width: '100%', maxWidth: '440px',
            border: '1px solid #334155', padding: '24px', boxSizing: 'border-box',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '18px', fontWeight: '700', textAlign: isRtl ? 'right' : 'left' }}>
              {translateText('collectTitle', 'تسجيل وتحصيل المبالغ والاشتراكات', 'Collect Subscription Fee')}
            </h3>
            
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0', textAlign: isRtl ? 'right' : 'left' }}>
              {translateText('studentLabel', 'الطالب:', 'Student:')} <span style={{ color: C.gold, fontWeight: '700' }}>{collectStudent.name}</span>
            </p>

            <div style={{ marginBottom: '16px', textAlign: isRtl ? 'right' : 'left' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '13px', marginBottom: '8px', fontWeight: '600' }}>
                {translateText('amountFieldLabel', 'المبلغ المستلم للتحصيل:', 'Amount to Collect:')}
              </label>
              <input
                type="number"
                value={collectAmount}
                onChange={(e) => setCollectAmount(e.target.value)}
                style={{
                  width: '100%', background: '#0f172a', border: '1px solid #334155',
                  borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '16px',
                  outline: 'none', boxSizing: 'border-box', fontWeight: '700', textAlign: 'center'
                }}
              />
            </div>

            {/* أزرار تسريع التعبئة الذكية */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button
                onClick={() => setCollectAmount(collectStudent.expectedAmount.toString())}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#10b981', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}
              >
                💰 {translateText('fullAmountBtn', 'كامل المبلغ', 'Full Fee')}
              </button>
              <button
                onClick={() => setCollectAmount('0')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}
              >
                🔄 {translateText('resetAmountBtn', 'تصفير / إلغاء السداد', 'Reset Payment')}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <button 
                onClick={() => setIsCollectModalOpen(false)}
                style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '10px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                {translateText('cancelModal', 'إلغاء', 'Cancel')}
              </button>
              <button 
                onClick={handleConfirmPayment}
                style={{ background: C.gold, border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                {translateText('savePaymentBtn', 'تأكيد وحفظ 💾', 'Confirm & Save 💾')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* النافذة المنبثقة للمراجعة واختيار النبرة للواتساب */}
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
              {translateText('reviewTitle', 'مراجعة وتعديل نص الرسالة التذكيرية', 'Review & Edit Message')}
            </h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
              <button 
                onClick={() => handleToneChange('friendly')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: msgTone === 'friendly' ? C.gold : '#1e293b', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
              >
                😊 {translateText('toneFriendly', 'ودية', 'Friendly')}
              </button>
              <button 
                onClick={() => handleToneChange('official')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: msgTone === 'official' ? C.gold : '#1e293b', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
              >
                🏛️ {translateText('toneOfficial', 'رسمية حازمة', 'Official')}
              </button>
            </div>

            <textarea
              value={modalMessage}
              onChange={(e) => setModalMessage(e.target.value)}
              rows={7}
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
                style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '10px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                {translateText('cancelModal', 'إلغاء', 'Cancel')}
              </button>
              <button 
                onClick={handleConfirmWhatsAppSend}
                style={{
                  background: '#128C7E', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
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
