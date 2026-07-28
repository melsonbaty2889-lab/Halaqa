/* src/components/CommunicationHub.jsx */
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FaPaperPlane, FaBullhorn, FaWhatsapp, FaEnvelope, 
  FaSms, FaBell, FaCheckCircle, FaSpinner, FaHistory 
} from 'react-icons/fa';

export default function CommunicationHub({ currentAcademyId, isRtl = true }) {
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

  const fetchNotifications = async () => {
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
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

      setSuccessMsg(isRtl ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!');
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
      alert(isRtl ? 'حدث خطأ أثناء الإرسال' : 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', color: '#fff', background: '#0b1329', minHeight: '100vh' }} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 🌟 الهيدر */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <FaPaperPlane style={{ fontSize: '1.5rem', color: '#38bdf8' }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
            {isRtl ? 'مركز التواصل والمراسلات الجماعية' : 'Communication & Broadcast Hub'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
            {isRtl ? 'إرسال التنبيهات والتعاميم للطلاب والأولياء والكادر التعليمي' : 'Broadcast notifications & announcements'}
          </p>
        </div>
      </div>

      {/* 📥 نموذج الإرسال + السجل */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* 1️⃣ نموذج الإرسال */}
        <div style={{ background: '#131f37', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
            <FaBullhorn /> {isRtl ? 'إرسال تعميم جديد' : 'New Broadcast'}
          </h2>

          {successMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                {isRtl ? 'قناة الإرسال' : 'Channel'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { id: 'in_app', label: isRtl ? 'التطبيق' : 'In-App', icon: FaBell },
                  { id: 'whatsapp', label: 'واتساب', icon: FaWhatsapp },
                  { id: 'sms', label: 'SMS', icon: FaSms },
                  { id: 'email', label: 'إيميل', icon: FaEnvelope }
                ].map(ch => {
                  const Icon = ch.icon;
                  const active = formData.channel === ch.id;
                  return (
                    <button
                      type="button"
                      key={ch.id}
                      onClick={() => setFormData({ ...formData, channel: ch.id })}
                      style={{
                        padding: '8px 4px',
                        background: active ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                        border: active ? '1px solid #38bdf8' : '1px solid #334155',
                        borderRadius: '6px',
                        color: active ? '#38bdf8' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icon style={{ fontSize: '0.9rem' }} />
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                {isRtl ? 'المستهدفون' : 'Recipients'}
              </label>
              <select
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                style={{ width: '100%', padding: '9px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
              >
                <option value="all_students">{isRtl ? 'جميع الطلاب والدارسين' : 'All Students'}</option>
                <option value="parents">{isRtl ? 'أولياء الأمور' : 'Parents'}</option>
                <option value="teachers">{isRtl ? 'الكادر التعليمي والمعلمين' : 'Teachers & Staff'}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                {isRtl ? 'عنوان التعميم / الموضوع' : 'Title'}
              </label>
              <input
                type="text"
                required
                placeholder={isRtl ? 'مثال: موعد اختبارات نهاية الفصل' : 'e.g., Final Exam Schedule'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '9px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                {isRtl ? 'محتوى الرسالة' : 'Content'}
              </label>
              <textarea
                rows="4"
                required
                placeholder={isRtl ? 'اكتب تفاصيل الرسالة هنا...' : 'Write notification details here...'}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                style={{ width: '100%', padding: '9px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.8rem', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
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
                marginTop: '6px'
              }}
            >
              {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPaperPlane />}
              <span>{isRtl ? 'إرسال التعميم الآن' : 'Send Broadcast'}</span>
            </button>
          </form>
        </div>

        {/* 2️⃣ سجل المراسلات */}
        <div style={{ background: '#131f37', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
            <FaHistory /> {isRtl ? 'سجل المراسلات السابقة' : 'Recent History'}
          </h2>

          {fetching ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
              {isRtl ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 10px', fontSize: '0.8rem' }}>
              {isRtl ? 'لا توجد مراسلات أُرسلت بعد' : 'No notification history found'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
              {history.map((item) => (
                <div key={item.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#e2e8f0' }}>{item.title}</span>
                    <span style={{ fontSize: '0.65rem', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.channel}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>{item.content}</p>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>المستهدفون: {item.recipient}</span>
                    <span>{new Date(item.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
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
