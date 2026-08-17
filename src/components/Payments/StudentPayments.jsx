import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { C } from '@/theme/colors';
import { CreditCard, MessageSquare, ChevronLeft, ChevronRight, Search, Sparkles, Building2, Target, CheckCircle2, AlertCircle, Send, X, DollarSign } from 'lucide-react';

const checkIsPaid = (status) => status === 'paid' || status === 'مدفوع';
const checkIsPartial = (status) => status === 'partially_paid' || status === 'مدفوع جزئياً';

export default function StudentPayments({ students = [], academyId, academyCurrency }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  const currencySymbol = academyCurrency || (isRtl ? 'ج.م' : 'EGP');

  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [paymentsData, setPaymentsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Modal States
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
    if (amountNum >= collectStudent.expectedAmount && collectStudent.expectedAmount > 0) status = 'paid';
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

  const generateWAMsg = (student, toneType) => {
    const name = getStudentName(student);
    const month = formatMonthDisplay(selectedMonth);
    const fee = student.monthly_fee || 0;

    if (toneType === 'official') {
      return `إشعار مالي رسمي\n\nالسادة أولياء الأمور الكرام،\nيرجى التكرم بالعلم أن اشتراك الطالب/ة (${name}) لشهر (${month}) مستحق السداد بمبلغ (${formatMoney(fee)} ${currencySymbol}).\nنأمل التسوية المالية في أقرب وقت لتنسيق انتظام الطالب.\n\n— إدارة الحلقة`;
    }
    if (toneType === 'direct') {
      return `مرحباً بك،\n\nتذكير باشتراك شهر (${month}) الخاص بالطالب/ة (${name}) بمبلغ (${formatMoney(fee)} ${currencySymbol}).\nيرجى السداد لمتابعة الحضور.\nشكراً لك.`;
    }
    return `السلام عليكم ورحمة الله وبركاته،\n\nنود تذكيركم الكريمة باستحقاق اشتراك الطالب/ة (${name}) لشهر (${month}) بمبلغ (${formatMoney(fee)} ${currencySymbol}).\nحرصكم واستمراركم يسعدنا دائماً.\n\n— إدارة الحلقة`;
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

  let totalCollected = 0;
  let totalPending = 0;

  students.forEach(s => {
    const rec = paymentsData[s.id];
    const expected = s.monthly_fee || 0;
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
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif", padding: '16px', color: '#e2e8f0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <h2 style={{ color: '#fbbf24', fontSize: '22px', margin: '0 0 6px', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign style={{ color: '#fbbf24' }} size={24} /> المالية واشتراكات الطلاب
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>متابعة التحصيل وإدارة التدفقات المالية باحترافية</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(15,23,42,0.8) 100%)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#a7f3d0', fontSize: '12px', fontWeight: '700' }}>إجمالي التحصيل الفعلي</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <h3 style={{ margin: 0, color: '#34d399', fontSize: '24px', fontWeight: '800' }}>
            {formatMoney(totalCollected)} <span style={{ fontSize: '13px', color: '#a7f3d0' }}>{currencySymbol}</span>
          </h3>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(15,23,42,0.8) 100%)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#fde68a', fontSize: '12px', fontWeight: '700' }}>المبالغ المعلقة / المتأخرة</span>
            <AlertCircle size={18} color="#f59e0b" />
          </div>
          <h3 style={{ margin: 0, color: '#fbbf24', fontSize: '24px', fontWeight: '800' }}>
            {formatMoney(totalPending)} <span style={{ fontSize: '13px', color: '#fde68a' }}>{currencySymbol}</span>
          </h3>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#0f172a', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: '#1e293b', padding: '4px', borderRadius: '10px' }}>
          {[
            { id: 'all', label: `الكل (${students.length})` },
            { id: 'paid', label: 'مسدد' },
            { id: 'pending', label: 'معلّق' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: activeTab === tab.id ? '#10b981' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Month Selector */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: '500px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '12px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="بحث باسم الطالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '10px 38px 10px 12px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '0 8px' }}>
            <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}><ChevronRight size={18} /></button>
            <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '110px', textAlign: 'center', color: '#f8fafc' }}>{formatMonthDisplay(selectedMonth)}</span>
            <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}><ChevronLeft size={18} /></button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>لا يوجد طلاب مطابقون للبحث والتصفية.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', background: '#1e293b', color: '#94a3b8', fontSize: '12px' }}>
                  <th style={{ padding: '14px 16px' }}>اسم الطالب</th>
                  <th style={{ padding: '14px 16px' }}>قيمة الاشتراك</th>
                  <th style={{ padding: '14px 16px' }}>الحالة المالية</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>الإجراءات والتواصل</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => {
                  const rec = paymentsData[s.id];
                  const isPaid = checkIsPaid(rec?.status);
                  const isPartial = checkIsPartial(rec?.status);
                  const expected = s.monthly_fee || 0;

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px', color: '#f8fafc', fontWeight: '700' }}>{getStudentName(s)}</td>
                      <td style={{ padding: '14px 16px', color: '#cbd5e1', fontWeight: '600' }}>{formatMoney(expected)} {currencySymbol}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'inline-block',
                          background: isPaid ? 'rgba(16,185,129,0.15)' : isPartial ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                          color: isPaid ? '#34d399' : isPartial ? '#fbbf24' : '#f87171',
                          border: `1px solid ${isPaid ? 'rgba(16,185,129,0.3)' : isPartial ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                          {isPaid ? "مسدد" : isPartial ? "جزئي" : "معلّق"}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => openCollect(s, rec, expected)}
                            style={{
                              background: isPaid ? '#334155' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              border: 'none', color: isPaid ? '#e2e8f0' : '#000', borderRadius: '8px', padding: '8px 14px',
                              fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <CreditCard size={14} /> {isPaid ? 'تعديل' : 'قبض'}
                          </button>
                          <button
                            onClick={() => openWhatsApp(s)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 14px',
                              fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <MessageSquare size={14} /> تذكير
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

      {/* Modern Collect Modal */}
      {isCollectOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fbbf24', fontSize: '18px', fontWeight: '800' }}>تسجيل عملية قبض</h3>
              <button onClick={() => setIsCollectOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>الطالب</label>
              <input type="text" disabled value={collectStudent?.name || ''} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', fontWeight: '700', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>المبلغ المستلم ({currencySymbol})</label>
              <input type="number" value={collectAmount} onChange={e => setCollectAmount(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #10b981', borderRadius: '8px', padding: '10px', color: '#34d399', fontSize: '18px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>ملاحظات</label>
              <textarea value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} rows={2} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleConfirmCollect} style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '800', cursor: 'pointer' }}>تأكيد الحفظ</button>
              <button onClick={() => setIsCollectOpen(false)} style={{ background: '#334155', color: '#94a3b8', border: 'none', borderRadius: '10px', padding: '12px 20px', fontWeight: '700', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Modern WhatsApp Modal */}
      {isWhatsAppOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', width: '100%', maxWidth: '460px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#34d399', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} /> مراجعه رسالة التذكير
              </h3>
              <button onClick={() => setIsWhatsAppOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Tone Selector Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {[
                { id: 'encouraging', label: 'ودية تشجيعية', icon: Sparkles },
                { id: 'official', label: 'رسمية', icon: Building2 },
                { id: 'direct', label: 'مباشرة', icon: Target }
              ].map(t => {
                const IconComponent = t.icon;
                const isSelected = waTone === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleToneChange(t.id)}
                    style={{
                      padding: '10px 8px', borderRadius: '10px',
                      border: `1px solid ${isSelected ? '#10b981' : '#334155'}`,
                      background: isSelected ? 'rgba(16,185,129,0.15)' : '#1e293b',
                      color: isSelected ? '#34d399' : '#94a3b8',
                      fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconComponent size={16} /> {t.label}
                  </button>
                );
              })}
            </div>

            {/* Message Preview Textarea */}
            <div style={{ marginBottom: '20px' }}>
              <textarea
                value={waMessage}
                onChange={e => setWaMessage(e.target.value)}
                rows={6}
                style={{
                  width: '100%', background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '12px', padding: '14px', color: '#f8fafc',
                  fontSize: '13px', lineHeight: '1.6', outline: 'none', resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSendWA}
                style={{
                  flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff', border: 'none', borderRadius: '10px', padding: '12px',
                  fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Send size={16} /> فتح الواتساب والإرسال
              </button>
              <button
                onClick={() => setIsWhatsAppOpen(false)}
                style={{
                  background: '#334155', color: '#94a3b8', border: 'none',
                  borderRadius: '10px', padding: '12px 20px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
