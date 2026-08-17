import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { C } from '@/theme/colors';
import { Card, PageHeader, TH, TD, Badge, Btn } from '@/components/UI/UI.jsx';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Building2, 
  Sparkles, 
  Target, 
  Banknote, 
  RotateCcw, 
  Save, 
  Send 
} from 'lucide-react';

const DEFAULT_SUBSCRIPTION_AMOUNT = 150;

const checkIsPaid = (status) => status === 'paid' || status === 'مدفوع';
const checkIsPartial = (status) => status === 'partially_paid' || status === 'مدفوع جزئياً';

export default function Payments({ students, academyId, academyCurrency = 'EGP' }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  const getCurrencySymbol = () => {
    if (academyCurrency === 'EGP') return isRtl ? 'ج.م' : 'EGP';
    if (academyCurrency === 'USD') return isRtl ? '$' : 'USD';
    if (academyCurrency === 'SAR') return isRtl ? 'ر.س' : 'SAR';
    if (academyCurrency === 'AED') return isRtl ? 'د.إ' : 'AED';
    if (academyCurrency === 'QAR') return isRtl ? 'ر.ق' : 'QAR';
    return academyCurrency;
  };

  const currencySymbol = getCurrencySymbol();

  const getStudentName = (student) => {
    if (!student || !student.name) return '';
    if (typeof student.name === 'object') {
      return student.name[currentLang] || student.name.ar || student.name.en || '';
    }
    return String(student.name);
  };

  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [paymentsData, setPaymentsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); 
  const [toast, setToast] = useState({ message: '', type: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 4000);
  };

  const formatMoney = (amount) => {
    const locale = isRtl ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const changeMonth = (delta) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  const formatMonthDisplay = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
  };

  // نافذة التحصيل المتقدمة
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectStudent, setCollectStudent] = useState(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); 
  const [paymentNotes, setPaymentNotes] = useState('');

  // نافذة الواتساب الذكية
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [msgTone, setMsgTone] = useState('encouraging');

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
        .select('id, student_id, amount, status, notes, payment_method')
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

  const openCollectModal = (student, currentRecord, expectedAmount) => {
    setCollectStudent({
      id: student.id,
      name: getStudentName(student),
      expectedAmount: expectedAmount,
      currentRecord: currentRecord
    });
    setCollectAmount(currentRecord ? currentRecord.amount.toString() : expectedAmount.toString());
    setPaymentNotes(currentRecord?.notes || '');
    setPaymentMethod(currentRecord?.payment_method || 'cash');
    setIsCollectModalOpen(true);
  };

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

    let status = 'pending';
    if (parsedAmount >= collectStudent.expectedAmount) {
      status = 'paid';
    } else if (parsedAmount > 0) {
      status = 'partially_paid';
    }

    const payload = {
      ...(collectStudent.currentRecord?.id ? { id: collectStudent.currentRecord.id } : {}),
      student_id: collectStudent.id,
      academy_id: academyId,
      month: selectedMonth,
      amount: parsedAmount,
      status: status,
      payment_method: paymentMethod,
      notes: paymentNotes
    };

    const { data, error } = await supabase.from('payments').upsert(payload).select();
    if (error) {
      showToast(translateText('errorOccurred', 'حدث خطأ: ', 'An error occurred: ') + error.message, 'error');
    } else if (data) {
      setPaymentsData(prev => ({ ...prev, [collectStudent.id]: data[0] }));
      showToast(translateText('saveSuccess', 'تم تسجيل عملية التحصيل بنجاح', 'Payment updated successfully'), 'success');
    }
    setActionLoading(null);
    setCollectStudent(null);
  };

  const generateWhatsAppMessage = (student, currentRecord, tone, lang) => {
    const isRtlLang = lang === 'ar';
    const monthDisplay = formatMonthDisplay(selectedMonth);
    const expectedAmount = student.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;
    const currency = student.currency || currencySymbol;
    const studentName = getStudentName(student);
    
    const isPaid = checkIsPaid(currentRecord?.status);
    const isPartial = checkIsPartial(currentRecord?.status);
    const paidAmount = currentRecord?.amount || 0;
    const remainingAmount = expectedAmount - paidAmount;

    if (isPaid) {
      return isRtlLang
        ? `السلام عليكم ورحمة الله وبركاته،\nنود أن نشكركم على سداد اشتراك الطالب/ة (${studentName}) لشهر (${monthDisplay}).\nنسأل الله له التوفيق والنجاح الدائم.\n— إدارة الأكاديمية`
        : `Greetings,\nThank you for settling the subscription for (${studentName}) for (${monthDisplay}).\nWe appreciate your support.\n— Academy Management`;
    }

    if (isPartial) {
      return isRtlLang
        ? `السلام عليكم ورحمة الله وبركاته،\nتذكير بشأن المتبقي من اشتراك الطالب/ة (${studentName}) لشهر (${monthDisplay}).\nالمبلغ المسدد: (${formatMoney(paidAmount)} ${currency})\nالمتبقي المستحق: (${formatMoney(remainingAmount)} ${currency})\nشاكرين ومقدرين حسن تعاونكم.\n— إدارة الأكاديمية`
        : `Hello,\nA friendly reminder regarding the remaining fee for (${studentName}) for (${monthDisplay}). Paid: (${formatMoney(paidAmount)} ${currency}), Remaining: (${formatMoney(remainingAmount)} ${currency}).\nThank you for your cooperation.\n— Management`;
    }

    if (isRtlLang) {
      if (tone === 'official') {
        return `إشعار مالـي رسمـي\nالسادة أولياء الأمور الكرام،\nيرجى التكرم بالعلم أن اشتراك الطالب/ة (${studentName}) لشهر (${monthDisplay}) مستحق السداد بمبلغ (${formatMoney(expectedAmount)} ${currency}).\nنأمل التسوية المالية في أقرب وقت لضمان انتظام الطالب.\n— الشؤون المالية للأكاديمية`;
      }
      if (tone === 'direct') {
        return `مرحباً بك،\nتذكير باشتراك شهر (${monthDisplay}) الخاص بك/بالطالب (${studentName}) بمبلغ (${formatMoney(expectedAmount)} ${currency}).\nيرجى التواصل لمعاد السداد أو التحويل.\nشكراً لك.`;
      }
      return `السلام عليكم ورحمة الله وبركاته،\nنود تذكيركم الكريمة باستحقاق اشتراك الطالب/ة (${studentName}) لشهر (${monthDisplay}) بمبلغ (${formatMoney(expectedAmount)} ${currency}).\nحرصكم واستمراركم يسعدنا دائماً.\n— إدارة الحلقة`;
    } else {
      if (tone === 'official') {
        return `Official Notice\nDear parents, please be informed that the subscription for (${studentName}) for (${monthDisplay}) is due. Amount: (${formatMoney(expectedAmount)} ${currency}).\nPlease process payment at your earliest convenience.\n— Finance Dept.`;
      }
      return `Greetings,\nThis is a friendly reminder regarding the subscription for (${studentName}) for (${monthDisplay}) amounting to (${formatMoney(expectedAmount)} ${currency}).\nThank you for your continued partnership.\n— Management`;
    }
  };

  const openReminderModal = (student, currentRecord) => {
    if (!student.parent_phone) {
      return showToast(translateText('noPhone', 'لا يوجد رقم هاتف مسجل لولي الأمر.', 'No phone number registered.'), 'error');
    }
    setSelectedStudentForModal(student);
    setMsgTone('encouraging');
    const defaultMsg = generateWhatsAppMessage(student, currentRecord, 'encouraging', currentLang);
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

    let cleanPhone = String(selectedStudentForModal.parent_phone || '').trim().replace(/[^\d]/g, '');
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '2' + cleanPhone;
    } else if (cleanPhone.startsWith('00')) {
      cleanPhone = cleanPhone.substring(2);
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(modalMessage)}`, "_blank");
    setIsModalOpen(false);
  };

  let totalCollected = 0;
  let totalPending = 0;

  students?.forEach(s => {
    const rec = paymentsData[s.id];
    const expected = s.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;
    if (checkIsPaid(rec?.status)) {
      totalCollected += rec.amount || expected;
    } else if (checkIsPartial(rec?.status)) {
      totalCollected += rec.amount || 0;
      totalPending += Math.max(0, expected - (rec.amount || 0));
    } else {
      totalPending += expected;
    }
  });

  const totalTarget = totalCollected + totalPending;
  const collectionRate = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  const filteredStudents = students?.filter(s => {
    const rec = paymentsData[s.id];
    const studentName = getStudentName(s);
    const parentPhone = String(s.parent_phone || '');
    
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          parentPhone.includes(searchTerm);
    
    const isPaid = checkIsPaid(rec?.status);
    const isPartial = checkIsPartial(rec?.status);

    if (activeTab === 'paid') return matchesSearch && (isPaid || isPartial);
    if (activeTab === 'pending') return matchesSearch && !isPaid;
    return matchesSearch;
  });

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif", minHeight: '100vh', paddingBottom: '40px' }}>
      
      <style>{`
        @keyframes saasPulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.2; }
          100% { opacity: 0.6; }
        }
        .stats-container { display: flex; gap: 16px; margin-bottom: 24px; flex-direction: row; }
        .controls-container { display: flex; gap: 16px; margin-bottom: 20px; justify-content: space-between; align-items: center; flex-wrap: wrap; }
        .filter-buttons { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
        .search-inputs { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .search-field-container { position: relative; min-width: 220px; }
        .search-field { width: 100%; padding: 10px 16px; padding-left: ${isRtl ? '16px' : '36px'}; padding-right: ${isRtl ? '36px' : '16px'}; border-radius: 10px; background: #162030; border: 1px solid #334155; color: #fff; outline: none; font-size: 14px; box-sizing: border-box; }
        .search-icon { position: absolute; top: 50%; transform: translateY(-50%); ${isRtl ? 'right: 12px' : 'left: 12px'}; color: #64748b; }
        .stat-card { padding: 20px; flex: 1; width: 100%; box-sizing: border-box; background: #111827; border-radius: 14px; border: 1px solid #1f2937; }
        
        .desktop-view { display: block; }
        .mobile-view { display: none; }

        .month-selector {
          display: flex; align-items: center; background: #162030; border: 1px solid #334155; border-radius: 10px; padding: 4px 8px; color: #fff;
        }
        .month-btn {
          background: transparent; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 6px; transition: 0.2s;
        }
        .month-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }

        @media (max-width: 768px) {
          .stats-container { flex-direction: column; }
          .controls-container { flex-direction: column; align-items: stretch; }
          .filter-buttons { width: 100%; }
          .search-inputs { flex-direction: column; width: 100%; }
          .search-field-container { width: 100%; }
          .month-selector { width: 100%; justify-content: space-between; }
          .desktop-view { display: none; }
          .mobile-view { display: flex; flex-direction: column; gap: 12px; }
        }
      `}</style>

      {/* التنبيهات الذكية */}
      {toast.message && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#fff',
          padding: '12px 24px', borderRadius: '10px', zIndex: 10000, fontWeight: '700',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <PageHeader 
        title={translateText('financialTitle', 'المالية واشتراكات الطلاب', 'Financials & Subscriptions')} 
        sub={translateText('financialSub', 'متابعة التحصيل وإدارة التدفقات المالية', 'Revenue Tracking & Cashflow')} 
      />
      
      {/* المؤشرات المالية */}
      <div className="stats-container">
        <div className="stat-card" style={{ borderRight: isRtl ? `4px solid #10b981` : 'none', borderLeft: !isRtl ? `4px solid #10b981` : 'none' }}>
          <h4 style={{ margin: 0, color: C.muted, fontSize: '13px', fontWeight: '600' }}>{translateText('totalCollected', 'إجمالي التحصيل الفعلي', 'Total Collected')}</h4>
          <p style={{ fontSize: '1.7rem', fontWeight: 'bold', margin: '8px 0 0 0', color: '#10b981' }}>
            {formatMoney(totalCollected)} <span style={{ fontSize: '13px', color: C.muted }}>{currencySymbol}</span>
          </p>
        </div>

        <div className="stat-card" style={{ borderRight: isRtl ? `4px solid #f59e0b` : 'none', borderLeft: !isRtl ? `4px solid #f59e0b` : 'none' }}>
          <h4 style={{ margin: 0, color: C.muted, fontSize: '13px', fontWeight: '600' }}>{translateText('totalPending', 'المبالغ المعلقة/المتأخرة', 'Pending Balance')}</h4>
          <p style={{ fontSize: '1.7rem', fontWeight: 'bold', margin: '8px 0 0 0', color: '#f59e0b' }}>
            {formatMoney(totalPending)} <span style={{ fontSize: '13px', color: C.muted }}>{currencySymbol}</span>
          </p>
        </div>

        <div className="stat-card" style={{ borderRight: isRtl ? `4px solid ${C.gold}` : 'none', borderLeft: !isRtl ? `4px solid ${C.gold}` : 'none' }}>
          <h4 style={{ margin: 0, color: C.muted, fontSize: '13px', fontWeight: '600' }}>{translateText('collectionRate', 'نسبة إنجاز التحصيل', 'Collection Rate')}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>{collectionRate}%</p>
            <div style={{ flex: 1, height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${collectionRate}%`, height: '100%', background: C.gold, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* أدوات التحكم والتصفية */}
      <div className="controls-container">
        <div className="filter-buttons">
          <button 
            onClick={() => setActiveTab('all')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'all' ? C.gold : '#162030', color: '#fff', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {translateText('tabAll', 'الكل', 'All')} ({students?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('paid')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'paid' ? '#10b981' : '#162030', color: '#fff', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {translateText('tabPaid', 'مسدد', 'Paid')}
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'pending' ? '#ef4444' : '#162030', color: '#fff', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {translateText('tabPending', 'معلّق', 'Pending')}
          </button>
        </div>

        <div className="search-inputs">
          <div className="search-field-container">
            <Search className="search-icon" size={16} />
            <input 
              type="text"
              placeholder={translateText('searchPlaceholder', 'بحث باسم الطالب أو الهاتف...', 'Search by student or phone...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-field"
            />
          </div>
          
          {/* Custom Month Selector */}
          <div className="month-selector">
            <button className="month-btn" onClick={() => changeMonth(-1)}>
              {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '110px', textAlign: 'center' }}>
              {formatMonthDisplay(selectedMonth)}
            </span>
            <button className="month-btn" onClick={() => changeMonth(1)}>
              {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* قوائم الطلاب والجداول */}
      <Card style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
        {loading ? (
          <div className="mobile-view">
            {[1, 2, 3].map(n => (
              <div key={n} style={{ background: C.surface, padding: '16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)', animation: 'saasPulse 1.5s infinite' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ width: '50%', height: '14px', background: '#334155', borderRadius: '4px' }} />
                  <div style={{ width: '30%', height: '12px', background: '#334155', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* واجهة الموبايل */}
            <div className="mobile-view">
              {filteredStudents?.map(s => {
                const rec = paymentsData[s.id];
                const isPaid = checkIsPaid(rec?.status);
                const isPartial = checkIsPartial(rec?.status);
                const expectedAmount = s.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;
                const currency = s.currency || currencySymbol;

                return (
                  <div key={s.id} style={{ 
                    background: C.surface, padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: isRtl ? 'row' : 'row-reverse', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)', boxSizing: 'border-box'
                  }}>
                    <div style={{ textAlign: isRtl ? 'right' : 'left', flex: 1 }}>
                      <div style={{ fontWeight: '700', marginBottom: '6px', color: '#fff', fontSize: '15px' }}>{getStudentName(s)}</div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Badge color={isPaid ? "success" : isPartial ? "warning" : "danger"}>
                          {isPaid ? translateText('paidStatus', 'مسدد', 'Paid') : isPartial ? translateText('partialStatus', 'جزئي', 'Partial') : translateText('unpaidStatus', 'معلّق', 'Pending')}
                        </Badge>
                        <span style={{ fontSize: '12px', color: C.muted }}>
                          ({isPartial ? formatMoney(rec.amount) + ' / ' : ''}{formatMoney(expectedAmount)} {currency})
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
                      <Btn style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => openCollectModal(s, rec, expectedAmount)}>
                        <CreditCard size={14} />
                        <span>{actionLoading === s.id ? "..." : isPaid || isPartial ? translateText('cancelAction', 'تعديل', 'Edit') : translateText('payAction', 'قبض', 'Collect')}</span>
                      </Btn>
                      <Btn style={{ padding: '8px 12px', fontSize: '13px', background: '#128C7E', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => openReminderModal(s, rec)}>
                        <MessageSquare size={14} />
                        <span>{translateText('whatsappBtn', 'تذكير', 'Remind')}</span>
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* واجهة الديسك توب */}
            <div className="desktop-view">
              <table style={{ width: '100%', borderCollapse: 'collapse', background: C.surface, borderRadius: '12px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('studentName', 'اسم الطالب', 'Student Name')}</TH>
                    <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('expectedFee', 'الاشتراك', 'Subscription')}</TH>
                    <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('statusLabel', 'الحالة', 'Status')}</TH>
                    <TH style={{ textAlign: isRtl ? 'right' : 'left' }}>{translateText('actionsLabel', 'الإجراءات', 'Actions')}</TH>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents?.map(s => {
                    const rec = paymentsData[s.id];
                    const isPaid = checkIsPaid(rec?.status);
                    const isPartial = checkIsPartial(rec?.status);
                    const expectedAmount = s.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;
                    const currency = s.currency || currencySymbol;

                    return (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <TD style={{ color: '#fff', fontWeight: '600', textAlign: isRtl ? 'right' : 'left' }}>{getStudentName(s)}</TD>
                        <TD style={{ color: '#94a3b8', textAlign: isRtl ? 'right' : 'left' }}>{formatMoney(expectedAmount)} {currency}</TD>
                        <TD style={{ textAlign: isRtl ? 'right' : 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Badge color={isPaid ? "success" : isPartial ? "warning" : "danger"}>
                              {isPaid ? translateText('paidStatus', 'مسدد بالكامل', 'Fully Paid') : isPartial ? translateText('partialStatus', 'مسدد جزئياً', 'Partially Paid') : translateText('unpaidStatus', 'معلّق', 'Pending')}
                            </Badge>
                            {isPartial && <span style={{ fontSize: '13px', color: '#94a3b8' }}>({translateText('collectedLabel', 'المحصل', 'Collected')}: {formatMoney(rec.amount)} {currency})</span>}
                          </div>
                        </TD>
                        <TD style={{ textAlign: isRtl ? 'right' : 'left' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Btn style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => openCollectModal(s, rec, expectedAmount)}>
                              <CreditCard size={15} />
                              <span>{actionLoading === s.id ? "..." : isPaid || isPartial ? translateText('cancelAction', 'تعديل السداد', 'Edit Payment') : translateText('payAction', 'تحصيل المبلغ', 'Collect Fee')}</span>
                            </Btn>
                            <Btn style={{ background: '#128C7E', color: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => openReminderModal(s, rec)}>
                              <MessageSquare size={15} />
                              <span>{translateText('whatsappBtn', 'واتساب', 'WhatsApp')}</span>
                            </Btn>
                          </div>
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* نافذة التحصيل الاحترافية */}
      {isCollectModalOpen && collectStudent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px', backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#162030', borderRadius: '16px', width: '100%', maxWidth: '440px',
            border: '1px solid #334155', padding: '24px', boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CreditCard style={{ color: C.gold }} size={20} />
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '700' }}>
                {translateText('collectTitle', 'تسجيل وتحصيل الاشتراك', 'Record Subscription Payment')}
              </h3>
            </div>
            
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 16px 0', textAlign: isRtl ? 'right' : 'left' }}>
              {translateText('studentLabel', 'الطالب:', 'Student:')} <span style={{ color: C.gold, fontWeight: '700' }}>{collectStudent.name}</span>
            </p>

            <div style={{ marginBottom: '16px', textAlign: isRtl ? 'right' : 'left' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                {translateText('amountFieldLabel', 'المبلغ المستلم:', 'Amount Received:')}
              </label>
              <input
                type="number"
                value={collectAmount}
                onChange={(e) => setCollectAmount(e.target.value)}
                style={{
                  width: '100%', background: '#0f172a', border: '1px solid #334155',
                  borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '18px',
                  outline: 'none', boxSizing: 'border-box', fontWeight: '700', textAlign: 'center'
                }}
              />
            </div>

            {/* طريقة الدفع */}
            <div style={{ marginBottom: '16px', textAlign: isRtl ? 'right' : 'left' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                {translateText('paymentMethodLabel', 'طريقة الدفع:', 'Payment Method:')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'cash', label: isRtl ? 'نقدي' : 'Cash' },
                  { id: 'bank', label: isRtl ? 'تحويل بنكي' : 'Bank Transfer' },
                  { id: 'wallet', label: isRtl ? 'محفظة إلكترونية' : 'E-Wallet' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #334155',
                      background: paymentMethod === m.id ? C.gold : '#0f172a',
                      color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* الملاحظات والخصومات */}
            <div style={{ marginBottom: '20px', textAlign: isRtl ? 'right' : 'left' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                {translateText('notesLabel', 'ملاحظات (مثل: خصم إخوة / كفالة):', 'Notes (e.g. discount):')}
              </label>
              <input
                type="text"
                placeholder={translateText('notesPlaceholder', 'أدخل أي ملاحظات إن وجدت...', 'Enter notes if any...')}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                style={{
                  width: '100%', background: '#0f172a', border: '1px solid #334155',
                  borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '13px',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => setCollectAmount(collectStudent.expectedAmount.toString())}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#10b981', fontSize: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Banknote size={14} />
                <span>{translateText('fullAmountBtn', 'كامل المبلغ', 'Full Fee')}</span>
              </button>
              <button
                onClick={() => setCollectAmount('0')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <RotateCcw size={14} />
                <span>{translateText('resetAmountBtn', 'تصفير السداد', 'Reset Payment')}</span>
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
                style={{ background: C.gold, border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={15} />
                <span>{translateText('savePaymentBtn', 'حفظ التحصيل', 'Save Payment')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الواتساب الذكية المتعددة النبرات */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px', backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#162030', borderRadius: '16px', width: '100%', maxWidth: '520px',
            border: '1px solid #334155', padding: '24px', boxSizing: 'border-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <MessageSquare style={{ color: '#128C7E' }} size={20} />
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '700' }}>
                {translateText('reviewTitle', 'مراجعة رسالة التذكير', 'Review Reminder Message')}
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
              <button 
                onClick={() => handleToneChange('encouraging')}
                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: msgTone === 'encouraging' ? C.gold : '#1e293b', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={14} />
                <span>{translateText('toneEncouraging', 'ودية تشجيعية', 'Encouraging')}</span>
              </button>
              <button 
                onClick={() => handleToneChange('official')}
                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: msgTone === 'official' ? C.gold : '#1e293b', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Building2 size={14} />
                <span>{translateText('toneOfficial', 'رسمية', 'Official')}</span>
              </button>
              <button 
                onClick={() => handleToneChange('direct')}
                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: msgTone === 'direct' ? C.gold : '#1e293b', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Target size={14} />
                <span>{translateText('toneDirect', 'مباشرة (للكبار)', 'Direct')}</span>
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
                  background: '#128C7E', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Send size={15} />
                <span>{translateText('sendModal', 'فتح الواتساب والإرسال', 'Open WhatsApp & Send')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
