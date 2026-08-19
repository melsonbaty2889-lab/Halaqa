import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { 
  Send, Megaphone, MessageSquare, Mail, 
  Smartphone, Bell, CheckCircle2, Loader2, History,
  TrendingUp, Users, ShieldCheck, Wand2, ArrowLeftRight
} from 'lucide-react';
import CustomDatePicker from './UI/CustomDatePicker'; // إن وجد أو مكونات المساعدة

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

  const channels = [
    { id: 'in_app', label: isAr ? 'التطبيق' : 'In-App', icon: Bell, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'whatsapp', label: isAr ? 'واتساب' : 'WhatsApp', icon: MessageSquare, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'sms', label: 'SMS', icon: Smartphone, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'email', label: isAr ? 'إيميل' : 'Email', icon: Mail, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' }
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

  const getChannelBadge = (channelKey) => {
    const ch = channels.find(c => c.id === channelKey) || channels[0];
    const IconComp = ch.icon;
    return (
      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${ch.color}`}>
        <IconComp size={11} />
        {ch.label}
      </span>
    );
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-2 sm:p-5 space-y-4 text-slate-100 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* الترويسة الرئيسية */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Send size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight">
              {isAr ? 'مركز التواصل والمراسلات الذكي' : 'Smart Communication Hub'}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isAr ? 'إدارة المراسلات والتعاميم الفورية لجميع أطراف الأكاديمية' : 'Broadcast notifications and announcements seamlessly'}
            </p>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] sm:text-xs">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="truncate">{isAr ? 'إجمالي المراسلات' : 'Total Sent'}</span>
          </div>
          <span className="text-base sm:text-xl font-black text-slate-100 mt-1 block">{history.length}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] sm:text-xs">
            <Users size={14} className="text-sky-400" />
            <span className="truncate">{isAr ? 'القنوات الفعالة' : 'Active Channels'}</span>
          </div>
          <span className="text-base sm:text-xl font-black text-sky-400 mt-1 block">4</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] sm:text-xs">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="truncate">{isAr ? 'حالة النظام' : 'System Status'}</span>
          </div>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              {isAr ? 'نشط ومباشر' : 'Live & Active'}
            </span>
          </div>
        </div>
      </div>

      {/* الجسم الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* نموذج إنشاء تعميم جديد */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm border-b border-slate-800 pb-2">
            <Megaphone size={16} />
            <span>{isAr ? 'إنشاء تعميم جديد' : 'New Broadcast'}</span>
          </div>

          {/* القوالب السريعة */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Wand2 size={12} className="text-emerald-400" />
              <span>{isAr ? 'قوالب سريعة:' : 'Quick Templates:'}</span>
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {templates.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-all"
                >
                  {isAr ? tpl.titleAr : tpl.titleEn}
                </button>
              ))}
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-3">
            {/* القنوات */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-medium block">
                {isAr ? 'قناة الإرسال' : 'Channel'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {channels.map((ch) => {
                  const IconComponent = ch.icon;
                  const active = formData.channel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, channel: ch.id })}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                        active 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <IconComponent size={16} />
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* المستهدفون */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium block">
                {isAr ? 'المستهدفون' : 'Recipients'}
              </label>
              <select
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
              >
                {recipientOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* العنوان */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium block">
                {isAr ? 'عنوان الموضوع' : 'Title'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'أدخل عنوان الرسالة...' : 'Enter title...'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* المحتوى */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium block">
                {isAr ? 'محتوى الرسالة' : 'Content'}
              </label>
              <textarea
                rows={3}
                placeholder={isAr ? 'اكتب الرسالة التفصيلية هنا...' : 'Write message details...'}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{isAr ? 'إرسال التعميم الآن' : 'Send Broadcast'}</span>
            </button>
          </form>
        </div>

        {/* سجل المراسلات */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm border-b border-slate-800 pb-2">
            <History size={16} />
            <span>{isAr ? 'سجل المراسلات' : 'Recent History'}</span>
          </div>

          {fetching ? (
            <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Loader2 size={20} className="animate-spin text-emerald-400" />
              <span>{isAr ? 'جاري التحميل...' : 'Loading...'}</span>
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              {isAr ? 'لا توجد مراسلات سابقة' : 'No notification history'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-200 line-clamp-1">
                      {item.title}
                    </span>
                    {getChannelBadge(item.channel)}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {item.content || item.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>{isAr ? 'المستهدفون:' : 'Recipients:'} {getRecipientLabel(item.recipient)}</span>
                    <span className="font-mono">{new Date(item.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
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
