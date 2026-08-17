import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { C } from '@/theme/colors';
import { CreditCard, MessageSquare, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { CollectModal, WhatsAppModal } from './PaymentModals';

const DEFAULT_SUBSCRIPTION_AMOUNT = 150;

const checkIsPaid = (status) => status === 'paid' || status === 'مدفوع';
const checkIsPartial = (status) => status === 'partially_paid' || status === 'مدفوع جزئياً';

export default function StudentPayments({ students = [], academyId, academyCurrency = 'EGP' }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  // توحيد العملة للجنيه المصري بدلاً من AUD
  const currencySymbol = isRtl ? 'ج.م' : 'EGP';

  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [paymentsData, setPaymentsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // حالات النوافذ المنبثقة
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [collectStudent, setCollectStudent] = useState(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [selectedStudentForWA, setSelectedStudentForWA] = useState(null);
  const [waMessage, setWaMessage] = useState('');
  const [waTone, setWaTone] = useState('encouraging');

  const getStudentName = (student) => {
    if (!student || !student.name) return '';
    if (typeof student.name === 'object') return student.name[currentLang] || student.name.ar || student.name.en || '';
    return String(student.name);
  };

  const formatMoney = (amount) => new Intl.NumberFormat(isRtl ? 'ar-EG' : 'en-US').format(amount || 0);

  const changeMonth = (delta) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const formatMonthDisplay = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
  };

  // جلب البيانات الفعليه من داتابيز Supabase فقط
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

  // إعداد التحصيل
  const openCollect = (student, record, expected) => {
    setCollectStudent({ id: student.id, name: getStudentName(student), expectedAmount: expected, record });
    setCollectAmount(record ? record.amount.toString() : expected.toString());
    setPaymentNotes(record?.notes || '');
    setPaymentMethod(record?.payment_method || 'cash');
    setIsCollectOpen(true);
  };

  const handleConfirmCollect = async () => {
    if (!collectStudent) return;
    const amountNum = parseFloat(collectAmount) || 0;
    let status = 'pending';
    if (amountNum >= collectStudent.expectedAmount) status = 'paid';
    else if (amountNum > 0) status = 'partially_paid';

    const payload = {
      ...(collectStudent.record?.id ? { id: collectStudent.record.id } : {}),
      student_id: collectStudent.id,
      academy_id: academyId,
      month: selectedMonth,
      amount: amountNum,
      status,
      payment_method: paymentMethod,
      notes: paymentNotes
    };

    const { data } = await supabase.from('payments').upsert(payload).select();
    if (data) {
      setPaymentsData(prev => ({ ...prev, [collectStudent.id]: data[0] }));
      setIsCollectOpen(false);
    }
  };

  // صياغة رسائل الواتساب
  const generateWAMsg = (student, toneType) => {
    const name = getStudentName(student);
    const month = formatMonthDisplay(selectedMonth);
    const fee = student.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;

    if (toneType === 'official') {
      return `إشعار مالي رسمي\nالسادة أولياء الأمور الكرام،\nيرجى التكرم بالعلم أن اشتراك الطالب/ة (${name}) لشهر (${month}) مستحق السداد بمبلغ (${formatMoney(fee)} ${currencySymbol}).\nنأمل التسوية المالية في أقرب وقت لتنسيق انتظام الطالب.\n— إدارة الحلقة`;
    }
    if (toneType === 'direct') {
      return `مرحباً بك،\nتذكير باشتراك شهر (${month}) الخاص بالطالب/ة (${name}) بمبلغ (${formatMoney(fee)} ${currencySymbol}).\nيرجى السداد لمتابعة الحضور.\nشكراً لك.`;
    }
    return `السلام عليكم ورحمة الله وبركاته،\nنود تذكيركم الكريمة باستحقاق اشتراك الطالب/ة (${name}) لشهر (${month}) بمبلغ (${formatMoney(fee)} ${currencySymbol}).\nحرصكم واستمراركم يسعدنا دائماً.\n— إدارة الحلقة`;
  };

  const openWhatsApp = (student) => {
    setSelectedStudentForWA(student);
    setWaTone('encouraging');
    setWaMessage(generateWAMsg(student, 'encouraging'));
    setIsWhatsAppOpen(true);
  };

  const handleToneChange = (newTone) => {
    setWaTone(newTone);
    if (selectedStudentForWA) setWaMessage(generateWAMsg(selectedStudentForWA, newTone));
  };

  const handleSendWA = () => {
    let phone = String(selectedStudentForWA?.parent_phone || '').trim().replace(/[^\d]/g, '');
    if (phone.startsWith('01') && phone.length === 11) phone = '2' + phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`, '_blank');
    setIsWhatsAppOpen(false);
  };

  // الحسابات المالية الحقيقية
  let totalCollected = 0;
  let totalPending = 0;

  students.forEach(s => {
    const rec = paymentsData[s.id];
    const expected = s.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;
    if (checkIsPaid(rec?.status)) totalCollected += rec.amount || expected;
    else if (checkIsPartial(rec?.status)) {
      totalCollected += rec.amount || 0;
      totalPending += Math.max(0, expected - (rec.amount || 0));
    } else totalPending += expected;
  });

  const filteredStudents = students.filter(s => {
    const rec = paymentsData[s.id];
    const name = getStudentName(s);
    const matches = name.toLowerCase().includes(searchTerm.toLowerCase());
    const isPaid = checkIsPaid(rec?.status);
    if (activeTab === 'paid') return matches && isPaid;
    if (activeTab === 'pending') return matches && !isPaid;
    return matches;
  });

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif", padding: '16px' }}>
      
      {/* العنونة */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#f59e0b', fontSize: '20px', margin: '0 0 4px', fontWeight: '800' }}>المالية واشتراكات الطلاب</h2>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>متابعة التحصيل وإدارة التدفقات المالية</p>
      </div>

      {/* المؤشرات المالية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#121824', padding: '16px', borderRadius: '12px', borderRight: '4px solid #10b981' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>إجمالي التحصيل الفعلي</span>
          <h3 style={{ margin: '6px 0 0', color: '#10b981', fontSize: '22px' }}>{formatMoney(totalCollected)} <span style={{ fontSize: '14px' }}>{currencySymbol}</span></h3>
        </div>
        <div style={{ background: '#121824', padding: '16px', borderRadius: '12px', borderRight: '4px solid #f59e0b' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>المبالغ المعلقة/المتأخرة</span>
          <h3 style={{ margin: '6px 0 0', color: '#f59e0b', fontSize: '22px' }}>{formatMoney(totalPending)} <span style={{ fontSize: '14px' }}>{currencySymbol}</span></h3>
        </div>
      </div>

      {/* شريط البحث والتنقّل بين المجموعات والشهور */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'paid', 'pending'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                background: activeTab === tab ? '#10b981' : '#121824',
                color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
              }}
            >
              {tab === 'all' ? `الكل (${students.length})` : tab === 'paid' ? 'مسدد' : 'معلّق'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', top: '10px', right: '10px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="بحث باسم الطالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: '#121824', border: '1px solid #334155', borderRadius: '8px', padding: '8px 32px 8px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#121824', border: '1px solid #334155', borderRadius: '8px', padding: '0 8px', color: '#fff' }}>
            <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><ChevronRight size={16} /></button>
            <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '100px', textAlign: 'center' }}>{formatMonthDisplay(selectedMonth)}</span>
            <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
          </div>
        </div>
      </div>

      {/* جدول البيانات الرئيسي */}
      <div style={{ background: '#121824', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        {students.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>لا يوجد طلاب مسجلون في هذه الحلقة حالياً.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', background: '#0b0f17', color: '#94a3b8', fontSize: '12px' }}>
                  <th style={{ padding: '12px' }}>اسم الطالب</th>
                  <th style={{ padding: '12px' }}>الاشتراك</th>
                  <th style={{ padding: '12px' }}>الحالة</th>
                  <th style={{ padding: '12px' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => {
                  const rec = paymentsData[s.id];
                  const isPaid = checkIsPaid(rec?.status);
                  const isPartial = checkIsPartial(rec?.status);
                  const expected = s.monthly_fee || DEFAULT_SUBSCRIPTION_AMOUNT;

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1e293b', fontSize: '13px' }}>
                      <td style={{ padding: '12px', color: '#fff', fontWeight: '600' }}>{getStudentName(s)}</td>
                      <td style={{ padding: '12px', color: '#cbd5e1' }}>{formatMoney(expected)} {currencySymbol}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                          background: isPaid ? 'rgba(16,185,129,0.15)' : isPartial ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                          color: isPaid ? '#10b981' : isPartial ? '#f59e0b' : '#ef4444'
                        }}>
                          {isPaid ? "مسدد" : isPartial ? "جزئي" : "معلّق"}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openCollect(s, rec, expected)}
                            style={{ background: C?.gold || '#f59e0b', border: 'none', color: '#000', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CreditCard size={13} /> {isPaid ? 'تعديل' : 'قبض'}
                          </button>
                          <button
                            onClick={() => openWhatsApp(s)}
                            style={{ background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <MessageSquare size={13} /> تذكير
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* استدعاء النوافذ من PaymentModals */}
      <CollectModal
        isOpen={isCollectOpen}
        onClose={() => setIsCollectOpen(false)}
        student={collectStudent}
        amount={collectAmount}
        setAmount={setCollectAmount}
        method={paymentMethod}
        setMethod={setPaymentMethod}
        notes={paymentNotes}
        setNotes={setPaymentNotes}
        onConfirm={handleConfirmCollect}
        currencySymbol={currencySymbol}
        C={C}
      />

      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        message={waMessage}
        setMessage={setWaMessage}
        tone={waTone}
        onToneChange={handleToneChange}
        onSend={handleSendWA}
      />
    </div>
  );
}
