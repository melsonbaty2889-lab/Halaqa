import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
// استيراد أيقونات Lucide الاحترافية
import { 
  Send, Megaphone, MessageSquare, Mail, 
  Smartphone, Bell, CheckCircle2, Loader2, History,
  TrendingUp, Users, ShieldCheck, Wand2 
} from 'lucide-react';

// استيراد عناصر التصميم الموحدة
import { Card, Btn, Input, Select, PageHeader, Badge } from '@/components/UI/UI';
import { C } from '@/theme/colors';

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

  // الأيقونات الجديدة مع Lucide
  const channels = [
    { id: 'in_app', label: isAr ? 'التطبيق' : 'In-App', icon: Bell },
    { id: 'whatsapp', label: isAr ? 'واتساب' : 'WhatsApp', icon: MessageSquare },
    { id: 'sms', label: 'SMS', icon: Smartphone },
    { id: 'email', label: isAr ? 'إيميل' : 'Email', icon: Mail }
  ];

  const recipientOptions = [
    { value: 'all_students', label: isAr ? 'جميع الطلاب والدارسين' : 'All Students' },
    { value: 'parents', label: isAr ? 'أولياء الأمور' : 'Parents' },
    { value: 'teachers', label: isAr ? 'الكادر التعليمي والمعلمين' : 'Teachers & Staff' }
  ];

  const applyTemplate = (tpl) => {
    setFormData({
      ...formData,
      title: isAr ? tpl.titleAr : tpl.titleEn,
      content: isAr ? tpl.contentAr : tpl.contentEn
    });
  };

  const getRecipientLabel = (key) => {
    const found = recipientOptions.find(r => r.value === key);
    return found ? found.label : (isAr ? 'جميع الطلاب' : 'All Students');
  };

  const getChannelLabel = (key) => {
    const found = channels.find(c => c.id === key);
    return found ? found.label : key;
  };

  return (
    <div style={{ padding: '24px 16px', direction: isRtl ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* الترويسة الموحدة */}
        <PageHeader 
          title={isAr ? 'مركز التواصل والمراسلات الذكي' : 'Smart Communication Hub'}
          sub={isAr ? 'إدارة المراسلات والتعاميم الفورية لجميع أطراف الأكاديمية' : 'Broadcast notifications and announcements seamlessly'}
          action={
            <div style={{ background: `${C.primary}20`, padding: 12, borderRadius: 12, color: C.primary }}>
              <Send size={22} />
            </div>
          }
        />

        {/* إحصائيات سريعة */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Card style={{ padding: 16 }}>
            <div style={{ color: C.textSub, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={16} style={{ color: C.primary }} />
              <span>{isAr ? 'إجمالي المراسلات' : 'Total Sent'}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.text, marginTop: 8 }}>{history.length}</div>
          </Card>

          <Card style={{ padding: 16 }}>
            <div style={{ color: C.textSub, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} style={{ color: C.success }} />
              <span>{isAr ? 'القنوات الفعالة' : 'Active Channels'}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.text, marginTop: 8 }}>4</div>
          </Card>

          <Card style={{ padding: 16 }}>
            <div style={{ color: C.textSub, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} style={{ color: C.primary }} />
              <span>{isAr ? 'حالة النظام' : 'System Status'}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <Badge color={C.success}>{isAr ? 'نشط ومباشر' : 'Live & Active'}</Badge>
            </div>
          </Card>
        </div>

        {/* جسم الصفحة الرئيسي */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          
          {/* نموذج الإنشاء */}
          <Card>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: C.primary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={18} /> {isAr ? 'إنشاء تعميم جديد' : 'New Broadcast'}
            </h2>

            {/* القوالب السريعة */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.75rem', color: C.textSub, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <Wand2 size={14} style={{ color: C.primary }} /> {isAr ? 'قوالب سريعة:' : 'Quick Templates:'}
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {templates.map((tpl, idx) => (
                  <Btn key={idx} variant="secondary" onClick={() => applyTemplate(tpl)} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                    {isAr ? tpl.titleAr : tpl.titleEn}
                  </Btn>
                ))}
              </div>
            </div>

            {successMsg && (
              <div style={{ background: `${C.success}15`, border: `1px solid ${C.success}40`, color: C.success, padding: 12, borderRadius: 10, marginBottom: 16, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* قنوات الإرسال */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: C.primary, marginBottom: 8, fontWeight: 600 }}>
                  {isAr ? 'قناة الإرسال' : 'Channel'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {channels.map(ch => {
                    const IconComponent = ch.icon;
                    const active = formData.channel === ch.id;
                    return (
                      <Btn
                        key={ch.id}
                        variant={active ? 'primary' : 'ghost'}
                        onClick={() => setFormData({ ...formData, channel: ch.id })}
                        style={{ padding: '10px 4px', flexDirection: 'column', fontSize: '0.75rem', gap: 6 }}
                      >
                        <IconComponent size={18} />
                        <span>{ch.label}</span>
                      </Btn>
                    );
                  })}
                </div>
              </div>

              {/* اختيار المستهدفين */}
              <Select
                label={isAr ? 'المستهدفون' : 'Recipients'}
                value={formData.recipient}
                options={recipientOptions}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              />

              {/* عنوان وتفاصيل الرسالة */}
              <Input
                label={isAr ? 'عنوان الموضوع' : 'Title'}
                placeholder={isAr ? 'أدخل عنوان الرسالة...' : 'Enter title...'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <Input
                as="textarea"
                label={isAr ? 'محتوى الرسالة' : 'Content'}
                placeholder={isAr ? 'اكتب الرسالة التفصيلية هنا...' : 'Write message details...'}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />

              <Btn type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                <span>{isAr ? 'إرسال التعميم الآن' : 'Send Broadcast'}</span>
              </Btn>
            </form>
          </Card>

          {/* سجل المراسلات */}
          <Card>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: C.primary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <History size={18} /> {isAr ? 'سجل المراسلات' : 'Recent History'}
            </h2>

            {fetching ? (
              <div style={{ textAlign: 'center', color: C.textSub, padding: 20 }}>
                {isAr ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.textSub, padding: '30px 10px', fontSize: '0.85rem' }}>
                {isAr ? 'لا توجد مراسلات سابقة' : 'No notification history'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 480, overflowY: 'auto' }}>
                {history.map((item) => (
                  <div key={item.id} style={{ background: C.surface, padding: 14, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: C.text }}>
                        {item.title}
                      </span>
                      <Badge color={C.primary}>{getChannelLabel(item.channel)}</Badge>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: C.textSub, lineHeight: 1.5 }}>
                      {item.content || item.message}
                    </p>
                    <div style={{ fontSize: '0.72rem', color: C.textMuted, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{isAr ? 'المستهدفون:' : 'Recipients:'} {getRecipientLabel(item.recipient)}</span>
                      <span>{new Date(item.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}
