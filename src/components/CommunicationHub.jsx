import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { 
  FaPaperPlane, FaBullhorn, FaWhatsapp, FaEnvelope, 
  FaSms, FaBell, FaCheckCircle, FaSpinner, FaHistory,
  FaChartLine, FaUsers, FaCheckDouble, FaMagic
} from 'react-icons/fa';

export default function CommunicationHub({ currentAcademyId, isRtl: propIsRtl }) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'ar';
  const isAr = currentLanguage === 'ar';
  const isRtl = propIsRtl !== undefined ? propIsRtl : isAr;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [history, setHistory] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    channel: 'in_app',
    recipient: 'all_students',
    priority: 'normal'
  });

  // 🪄 قوالب سريعة جاهزة
  const templates = [
    {
      titleAr: 'تذكير بموعد الاختبار',
      titleEn: 'Exam Schedule Reminder',
      contentAr: 'السلام عليكم، نود تذكيركم بموعد الاختبار القادم يوم [اليوم] في تمام الساعة [الوقت]. بالتوفيق للجميع.',
      contentEn: 'Dear students, this is a reminder for your upcoming exam on [Date] at [Time]. Good luck!'
    },
    {
      titleAr: 'تنبيه إجازة رسمية',
      titleEn: 'Official Holiday Announcement',
      contentAr: 'نفيدكم علماً بأنه تقرر إيقاف الحلقات والدروس اعتباراً من [التاريخ] بمناسبة الإجازة الرسمية.',
      contentEn: 'Please note that classes will be suspended starting [Date] due to the official holiday.'
    }
  ];

  const fetchNotifications = useCallback(async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setLoading(true);
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([
          {
            title: formData.title,
            content: formData.content,
            channel: formData.channel,
            recipient: formData.recipient,
            priority: formData.priority,
            academy_id: currentAcademyId,
            status: 'sent'
          }
        ]);

      if (error) throw error;

      setSuccessMsg(isAr ? 'تم إرسال التعميم بنجاح!' : 'Broadcast sent successfully!');
      setFormData({
        title: '',
        content: '',
        channel: 'in_app',
        recipient: 'all_students',
        priority: 'normal'
      });

      fetchNotifications();
    } catch (err) {
      console.error('Error sending message:', err);
      alert(isAr ? 'حدث خطأ أثناء الإرسال' : 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const channels = [
    { id: 'in_app', label: isAr ? 'التطبيق' : 'In-App', icon: FaBell, color: '#38bdf8' },
    { id: 'whatsapp', label: isAr ? 'واتساب' : 'WhatsApp', icon: FaWhatsapp, color: '#22c55e' },
    { id: 'sms', label: 'SMS', icon: FaSms, color: '#f59e0b' },
    { id: 'email', label: isAr ? 'إيميل' : 'Email', icon: FaEnvelope, color: '#a855f7' }
  ];

  const recipientOptions = [
    { id: 'all_students', label: isAr ? 'جميع الطلاب والدارسين' : 'All Students' },
    { id: 'parents', label: isAr ? 'أولياء الأمور' : 'Parents' },
    { id: 'teachers', label: isAr ? 'الكادر التعليمي والمعلمين' : 'Teachers & Staff' }
  ];

  const applyTemplate = (tpl) => {
    setFormData({
      ...formData,
      title: isAr ? tpl.titleAr : tpl.titleEn,
      content: isAr ? tpl.contentAr : tpl.contentEn
    });
  };

  const getRecipientLabel = (key) => {
    const found = recipientOptions.find(r => r.id === key);
    if (found) return found.label;
    if (key === 'parents') return isAr ? 'أولياء الأمور' : 'Parents';
    if (key === 'teachers') return isAr ? 'الكادر التعليمي' : 'Teachers';
    return isAr ? 'جميع الطلاب' : 'All Students';
  };

  const getChannelLabel = (key) => {
    const found = channels.find(c => c.id === key);
    return found ? found.label : key;
  };

  return (
    <div style={{ padding: '16px', color: '#fff', background: '#0b1329', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🌟 الهيدر الترحيبي العريض */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
            padding: '14px', 
            borderRadius: '14px',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)'
          }}>
            <FaPaperPlane style={{ fontSize: '1.4rem', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
              {isAr ? 'مركز التواصل والمراسلات الذكي' : 'Smart Communication Hub'}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              {isAr ? 'إدارة المراسلات والتعاميم الفورية لجميع أطراف الأكاديمية' : 'Broadcast notifications and announcements seamlessly'}
            </p>
          </div>
        </div>
      </div>

      {/* 📊 كروت الإحصائيات الفاخرة */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <div style={{ background: '#131f37', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaChartLine style={{ color: '#38bdf8' }} />
            <span>{isAr ? 'إجمالي المراسلات' : 'Total Sent'}</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '6px' }}>{history.length}</div>
        </div>

        <div style={{ background: '#131f37', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaUsers style={{ color: '#22c55e' }} />
            <span>{isAr ? 'القنوات الفعالة' : 'Active Channels'}</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '6px' }}>4</div>
        </div>

        <div style={{ background: '#131f37', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaCheckDouble style={{ color: '#a855f7' }} />
            <span>{isAr ? 'حالة النظام' : 'System Status'}</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#22c55e', marginTop: '8px' }}>
            {isAr ? 'نشط ومباشر' : 'Live & Active'}
          </div>
        </div>
      </div>

      {/* 📥 نموذج الإرسال + السجل */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* 1️⃣ نموذج الإرسال */}
        <div style={{ background: '#131f37', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: '0.95rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
            <FaBullhorn /> {isAr ? 'إنشاء تعميم جديد' : 'New Broadcast'}
          </h2>

          {/* 🪄 القوالب السريعة */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <FaMagic style={{ color: '#fbbf24' }} /> {isAr ? 'قوالب سريعة جاهزة:' : 'Quick Templates:'}
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {templates.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '6px',
                    color: '#38bdf8',
                    fontSize: '0.68rem',
                    cursor: 'pointer'
                  }}
                >
                  {isAr ? tpl.titleAr : tpl.titleEn}
                </button>
              ))}
            </div>
          </div>

          {successMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* قناة الإرسال */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '6px' }}>
                {isAr ? 'قناة الإرسال' : 'Channel'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {channels.map(ch => {
                  const Icon = ch.icon;
                  const active = formData.channel === ch.id;
                  return (
                    <button
                      type="button"
                      key={ch.id}
                      onClick={() => setFormData({ ...formData, channel: ch.id })}
                      style={{
                        padding: '10px 4px',
                        background: active ? `${ch.color}22` : '#0f172a',
                        border: active ? `1px solid ${ch.color}` : '1px solid #334155',
                        borderRadius: '8px',
                        color: active ? ch.color : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icon style={{ fontSize: '1rem' }} />
                      <span style={{ fontWeight: active ? 'bold' : 'normal' }}>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* المستهدفون */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '6px' }}>
                {isAr ? 'المستهدفون' : 'Recipients'}
              </label>
              <select
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                style={{ width: '100%', padding: '9px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
              >
                {recipientOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* العنوان */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '6px' }}>
                {isAr ? 'عنوان الموضوع' : 'Title'}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? 'أدخل عنوان الرسالة...' : 'Enter title...'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '9px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* المحتوى */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '6px' }}>
                {isAr ? 'محتوى الرسالة' : 'Content'}
              </label>
              <textarea
                rows="4"
                required
                placeholder={isAr ? 'اكتب الرسالة التفصيلية هنا...' : 'Write message details...'}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                style={{ width: '100%', padding: '9px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPaperPlane />}
              <span>{isAr ? 'إرسال التعميم الآن' : 'Send Broadcast'}</span>
            </button>
          </form>
        </div>

        {/* 2️⃣ سجل المراسلات */}
        <div style={{ background: '#131f37', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: '0.95rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
            <FaHistory /> {isAr ? 'سجل المراسلات' : 'Recent History'}
          </h2>

          {fetching ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 10px', fontSize: '0.8rem' }}>
              {isAr ? 'لا توجد مراسلات سابقة' : 'No notification history'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '460px', overflowY: 'auto' }}>
              {history.map((item) => (
                <div key={item.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span dir="auto" style={{ fontWeight: 'bold', fontSize: '0.82rem', color: '#e2e8f0', textAlign: 'start' }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)' }}>
                      {getChannelLabel(item.channel)}
                    </span>
                  </div>
                  <p dir="auto" style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4', textAlign: 'start' }}>
                    {item.content || item.message}
                  </p>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isAr ? 'المستهدفون:' : 'Recipients:'} {getRecipientLabel(item.recipient)}</span>
                    <span>{new Date(item.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
