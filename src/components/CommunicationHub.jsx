/* src/components/CommunicationHub.jsx - مركز التواصل */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  FaComments, 
  FaWhatsapp, 
  FaSms, 
  FaEnvelope, 
  FaBell,
  FaPaperPlane, 
  FaSearch, 
  FaSyncAlt, 
  FaCheckDouble, 
  FaFilter,
  FaTimes,
  FaUserFriends,
  FaCheckCircle
} from 'react-icons/fa';

export default function CommunicationHub({ session, userRole }) {
  const { i18n } = useTranslation();
  const isArabic = !i18n.language || i18n.language.startsWith('ar');
  const isRtl = i18n.dir() === 'rtl' || isArabic;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sending, setSending] = useState(false);

  // نموذج إرسال رسالة/تنبيه جديد
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    channel: 'whatsapp', // whatsapp, sms, in_app, email
    targetGroup: 'all_students', // all_students, halaqas, teachers, parents
    priority: 'normal' // low, normal, high, urgent
  });

  // 1️⃣ جلب البيانات من قاعدة البيانات مع خطة طوارئ (Fallback)
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activeChannel !== 'all') {
        query = query.eq('channel', activeChannel);
      }

      let { data, error } = await query;

      if (error || !data) {
        console.warn('Notifications fetch notice, using fallback state:', error?.message);
        data = [
          {
            id: '1',
            title: isArabic ? 'تذكير بالحلقة القرأنية' : 'Halaqa Class Reminder',
            content: isArabic ? 'تذكير بموعد حلقة الفرقان اليوم الساعة 5:00 مساءً.' : 'Reminder for Al-Furqan Halaqa today at 5:00 PM.',
            channel: 'whatsapp',
            recipient: isArabic ? 'حلقة الفرقان' : 'Al-Furqan Group',
            status: 'sent',
            priority: 'normal',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: isArabic ? 'تنبيه دفع الاشتراك الشهرى' : 'Monthly Fee Alert',
            content: isArabic ? 'نود تذكيركم بموعد سداد اشتراك الشهر الحالي.' : 'Kindly remember to clear this month\'s subscription.',
            channel: 'sms',
            recipient: isArabic ? 'أولياء الأمور' : 'Parents',
            status: 'delivered',
            priority: 'high',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '3',
            title: isArabic ? 'تحديث مهم للنظام' : 'Important System Update',
            content: isArabic ? 'تم إضافة خاصية السجل الحي للأنشطة بنجاح.' : 'Realtime Audit Trail module has been successfully integrated.',
            channel: 'in_app',
            recipient: isArabic ? 'جميع المستخدمين' : 'All Users',
            status: 'read',
            priority: 'urgent',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];
      }

      setNotifications(data);
    } catch (err) {
      console.error('Error fetching communication logs:', err);
    } finally {
      setLoading(false);
    }
  }, [activeChannel, isArabic]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('realtime-communication')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  // 2️⃣ إرسال رسالة جديدة
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!newMessage.title || !newMessage.content) return;

    setSending(true);
    try {
      const payload = {
        title: newMessage.title,
        content: newMessage.content,
        channel: newMessage.channel,
        recipient: newMessage.targetGroup,
        priority: newMessage.priority,
        status: 'sent',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('notifications').insert([payload]);

      if (error) {
        setNotifications(prev => [payload, ...prev]);
      } else {
        fetchNotifications();
      }

      setShowSendModal(false);
      setNewMessage({ title: '', content: '', channel: 'whatsapp', targetGroup: 'all_students', priority: 'normal' });
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return { icon: FaWhatsapp, color: '#25D366', bg: 'rgba(37, 211, 102, 0.15)', label: 'WhatsApp' };
      case 'sms':
        return { icon: FaSms, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', label: 'SMS' };
      case 'email':
        return { icon: FaEnvelope, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: isArabic ? 'بريد' : 'Email' };
      default:
        return { icon: FaBell, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)', label: isArabic ? 'تطبيق' : 'In-App' };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return { color: '#EF4444', label: isArabic ? 'عاجل' : 'Urgent' };
      case 'high':
        return { color: '#F97316', label: isArabic ? 'هام' : 'High' };
      default:
        return { color: '#64748B', label: isArabic ? 'عادي' : 'Normal' };
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.content || '').toLowerCase().includes(q) ||
      (item.recipient || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ paddingBottom: '80px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      
      {/* 1️⃣ الترويسة الأزرار الرئيسية */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaComments style={{ color: '#38BDF8' }} />
            <span>{isArabic ? 'مركز التواصل' : 'Communication Hub'}</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>
            {isArabic 
              ? 'إدارة التواصل الفوري وإرسال التنبيهات والرسائل لكافة الفئات' 
              : 'Manage messages and broadcast updates across all channels'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowSendModal(true)}
            style={{ background: '#38BDF8', color: '#0F172A', fontWeight: '700', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaPaperPlane size={12} />
            <span>{isArabic ? 'إرسال رسالة جديدة' : 'New Message'}</span>
          </button>

          <button 
            onClick={fetchNotifications}
            style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', padding: '9px 14px', borderRadius: '10px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaSyncAlt size={12} className={loading ? 'spinning' : ''} />
            <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2️⃣ الفلاتر وقنوات الاتصال */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: isArabic ? 'جميع القنوات' : 'All Channels', icon: FaFilter },
          { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: '#25D366' },
          { id: 'sms', label: 'SMS', icon: FaSms, color: '#38BDF8' },
          { id: 'in_app', label: isArabic ? 'التطبيق' : 'In-App', icon: FaBell, color: '#A855F7' },
          { id: 'email', label: isArabic ? 'البريد' : 'Email', icon: FaEnvelope, color: '#F59E0B' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeChannel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveChannel(tab.id)}
              style={{
                background: isActive ? '#38BDF8' : '#1E293B',
                color: isActive ? '#0F172A' : '#94A3B8',
                fontWeight: isActive ? '700' : '500',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}>
              <Icon style={{ color: isActive ? '#0F172A' : (tab.color || '#94A3B8') }} size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3️⃣ البحث */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <FaSearch style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '0.85rem' }} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isArabic ? 'ابحث في محتوى الرسالة، العنوان، أو المستقبل...' : 'Search message content, title, or recipient...'}
          style={{ 
            width: '100%', 
            padding: '10px 32px', 
            paddingRight: isRtl ? '36px' : '32px', 
            paddingLeft: isRtl ? '32px' : '36px', 
            background: '#1E293B', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '12px', 
            color: '#FFF', 
            fontSize: '0.82rem', 
            outline: 'none' 
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', [isRtl ? 'left' : 'right']: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {/* 4️⃣ قائمة الرسائل والتنبيهات */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
          {isArabic ? 'جاري تحميل الرسائل...' : 'Loading messages...'}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{ background: '#1E293B', padding: '30px', borderRadius: '16px', textAlign: 'center', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.05)' }}>
          {isArabic ? 'لا توجد رسائل مسجلة حالياً' : 'No messages found'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifications.map((item) => {
            const badge = getChannelBadge(item.channel);
            const priority = getPriorityBadge(item.priority);
            const Icon = badge.icon;

            return (
              <div 
                key={item.id || Math.random()} 
                style={{ background: '#1E293B', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '14px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ color: badge.color, fontSize: '1.1rem' }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#FFF', fontSize: '0.88rem', fontWeight: '700' }}>{item.title}</h4>
                      <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaUserFriends size={10} style={{ color: '#38BDF8' }} />
                        <span>{item.recipient}</span>
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.7rem', color: priority.color, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                    {priority.label}
                  </span>
                </div>

                <p style={{ color: '#CBD5E1', fontSize: '0.8rem', margin: '8px 0 10px 0', lineHeight: '1.4' }}>
                  {item.content}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontSize: '0.72rem', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCheckCircle style={{ color: '#34D399' }} size={10} />
                    <span>{isArabic ? 'تم الإرسال' : 'Sent'}</span>
                  </span>
                  <span>{new Date(item.created_at).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5️⃣ نافذة إرسال رسالة جديدة */}
      {showSendModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#1E293B', width: '100%', maxWidth: '450px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#FFF', margin: 0, fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPaperPlane style={{ color: '#38BDF8' }} size={14} />
                <span>{isArabic ? 'إرسال رسالة جديدة' : 'Send New Message'}</span>
              </h3>
              <button onClick={() => setShowSendModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', marginBottom: '4px' }}>
                  {isArabic ? 'قناة الاتصال:' : 'Channel:'}
                </label>
                <select 
                  value={newMessage.channel}
                  onChange={(e) => setNewMessage({...newMessage, channel: e.target.value})}
                  style={{ width: '100%', background: '#0F172A', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' }}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="in_app">{isArabic ? 'إشعار داخل التطبيق' : 'In-App Notification'}</option>
                  <option value="email">{isArabic ? 'بريد إلكتروني' : 'Email'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', marginBottom: '4px' }}>
                  {isArabic ? 'المجموعة المستهدفة:' : 'Target Group:'}
                </label>
                <select 
                  value={newMessage.targetGroup}
                  onChange={(e) => setNewMessage({...newMessage, targetGroup: e.target.value})}
                  style={{ width: '100%', background: '#0F172A', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' }}>
                  <option value="all_students">{isArabic ? 'جميع الطلاب' : 'All Students'}</option>
                  <option value="parents">{isArabic ? 'أولياء الأمور' : 'Parents'}</option>
                  <option value="teachers">{isArabic ? 'المعلمون والمحفظون' : 'Teachers'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', marginBottom: '4px' }}>
                  {isArabic ? 'عنوان الرسالة:' : 'Subject:'}
                </label>
                <input 
                  type="text" 
                  required
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                  placeholder={isArabic ? 'مثال: تذكير بموعد الحلقة' : 'e.g., Class Reminder'}
                  style={{ width: '100%', background: '#0F172A', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', marginBottom: '4px' }}>
                  {isArabic ? 'نص الرسالة:' : 'Message:'}
                </label>
                <textarea 
                  rows={3}
                  required
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  placeholder={isArabic ? 'اكتب الرسالة هنا...' : 'Type message here...'}
                  style={{ width: '100%', background: '#0F172A', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  type="submit" 
                  disabled={sending}
                  style={{ flex: 1, background: '#38BDF8', color: '#0F172A', fontWeight: '700', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  {sending ? (isArabic ? 'جاري الإرسال...' : 'Sending...') : (isArabic ? 'إرسال' : 'Send')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowSendModal(false)}
                  style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
              </div>

            </form>

            
