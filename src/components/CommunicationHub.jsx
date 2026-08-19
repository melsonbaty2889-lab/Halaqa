import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Send, 
  MessageSquare, 
  Radio, 
  FileText, 
  Sparkles, 
  Users, 
  Smartphone, 
  Mail, 
  Bell, 
  CheckCircle2, 
  Plus, 
  Save, 
  Search,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Btn, Input } from '@/components/UI/UI';

export default function MessagingCenter({ academyId }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith('ar');

  // التبويب النشط: 'broadcast' (تعميم جديد) أو 'templates' (إدارة القوالب)
  const [activeTab, setActiveTab] = useState('broadcast');

  // ------- حالات التعميم الجماعي -------
  const [broadcastChannel, setBroadcastChannel] = useState('app');
  const [targetAudience, setTargetAudience] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // ------- حالات إدارة القوالب -------
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateEvent, setTemplateEvent] = useState('daily_report');
  const [templateBody, setTemplateBody] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // المتغيرات الديناميكية المتاحة للقوالب
  const availableVariables = [
    { code: '{student_name}', label: isRtl ? 'اسم الطالب' : 'Student Name' },
    { code: '{date}', label: isRtl ? 'التاريخ' : 'Date' },
    { code: '{attendance_status}', label: isRtl ? 'حالة الحضور' : 'Attendance' },
    { code: '{new_memorization}', label: isRtl ? 'الحفظ الجديد' : 'New Memorization' },
    { code: '{review}', label: isRtl ? 'المراجعة' : 'Review' },
    { code: '{session_grade}', label: isRtl ? 'التقييم' : 'Grade' },
  ];

  // جلب القوالب من قاعدة البيانات
  const fetchTemplates = useCallback(async () => {
    if (!academyId) return;
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
      if (data && data.length > 0 && !selectedTemplate) {
        loadTemplateIntoForm(data[0]);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  }, [academyId]);

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab, fetchTemplates]);

  const loadTemplateIntoForm = (tmpl) => {
    setSelectedTemplate(tmpl);
    setTemplateName(tmpl.template_name || '');
    setTemplateEvent(tmpl.trigger_event || 'daily_report');
    setTemplateBody(tmpl.template_body || '');
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateName('');
    setTemplateEvent('daily_report');
    setTemplateBody('');
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !templateBody.trim() || !academyId) return;
    setSavingTemplate(true);
    try {
      const payload = {
        academy_id: academyId,
        template_name: templateName.trim(),
        trigger_event: templateEvent,
        template_body: templateBody,
        is_active: true
      };

      if (selectedTemplate?.id) {
        await supabase
          .from('notification_templates')
          .update(payload)
          .eq('id', selectedTemplate.id);
      } else {
        await supabase
          .from('notification_templates')
          .insert([payload]);
      }

      await fetchTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setSavingTemplate(false);
    }
  };

  const insertVariable = (varCode) => {
    setTemplateBody(prev => prev + ' ' + varCode);
  };

  // إرسال تعميم جماعي
  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    setSendingBroadcast(true);
    try {
      // هنا يمكن ربطه بجدول notifications أو برمجية الإرسال الجماعي الخاصة بك
      await new Promise(res => setTimeout(res, 1000));
      setBroadcastTitle('');
      setBroadcastBody('');
      alert(isRtl ? 'تم إرسال التعميم بنجاح!' : 'Broadcast sent successfully!');
    } catch (err) {
      console.error('Error sending broadcast:', err);
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen p-4 bg-slate-950 text-slate-100">
      
      {/* عنوان الصفحة */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Radio size={22} />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-100 m-0">
            {isRtl ? 'مركز التواصل والمراسلات الذكي' : 'Smart Communication Center'}
          </h1>
          <p className="text-xs text-slate-400 m-0">
            {isRtl ? 'إدارة التعميمات الجماعية وقوالب الرسائل المخصصة' : 'Manage bulk broadcasts and system message templates'}
          </p>
        </div>
      </div>

      {/* التبويبات الأساسية للتحكم بالصفحة */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-5">
        <Btn
          variant={activeTab === 'broadcast' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('broadcast')}
          className={`py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-2 ${
            activeTab === 'broadcast' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-800 text-slate-400'
          }`}
        >
          <Send size={14} />
          <span>{isRtl ? 'إنشاء تعميم جديد' : 'New Broadcast'}</span>
        </Btn>

        <Btn
          variant={activeTab === 'templates' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('templates')}
          className={`py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-2 ${
            activeTab === 'templates' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-800 text-slate-400'
          }`}
        >
          <FileText size={14} />
          <span>{isRtl ? 'إدارة قوالب الرسائل' : 'Manage Templates'}</span>
        </Btn>
      </div>

      {/* ================= التبويب الأول: التعميمات الجماعية ================= */}
      {activeTab === 'broadcast' && (
        <div className="flex flex-col gap-4">
          <Card className="p-4 bg-slate-900 border-slate-800 rounded-xl">
            <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              <span>{isRtl ? 'إرسال تعميم عام' : 'Broadcast Message'}</span>
            </h2>

            {/* اختيار قناة الإرسال */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 block mb-2">{isRtl ? 'قناة الإرسال:' : 'Channel:'}</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'app', label: isRtl ? 'التطبيق' : 'App', icon: Bell },
                  { id: 'whatsapp', label: isRtl ? 'واتساب' : 'WhatsApp', icon: MessageSquare },
                  { id: 'sms', label: 'SMS', icon: Smartphone },
                  { id: 'email', label: isRtl ? 'إيميل' : 'Email', icon: Mail },
                ].map(ch => {
                  const Icon = ch.icon;
                  const selected = broadcastChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setBroadcastChannel(ch.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        selected
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-[11px] font-semibold">{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* المستهدفون */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 block mb-1.5">{isRtl ? 'المستهدفون:' : 'Audience:'}</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">{isRtl ? 'جميع الطلاب وأولياء الأمور' : 'All Students & Parents'}</option>
                <option value="present_today">{isRtl ? 'الحاضرون اليوم فقط' : 'Present Students Today'}</option>
                <option value="absent_today">{isRtl ? 'الغائبون اليوم فقط' : 'Absent Students Today'}</option>
              </select>
            </div>

            {/* عنوان الرسالة */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1.5">{isRtl ? 'عنوان الموضوع:' : 'Subject:'}</label>
              <Input
                type="text"
                placeholder={isRtl ? 'أدخل عنوان التعميم...' : 'Enter title...'}
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full bg-slate-950 border-slate-800 text-xs text-slate-100"
              />
            </div>

            {/* محتوى الرسالة */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 block mb-1.5">{isRtl ? 'محتوى التعميم:' : 'Message:'}</label>
              <textarea
                rows={4}
                placeholder={isRtl ? 'اكتب نص التعميم هنا...' : 'Type text here...'}
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <Btn
              variant="primary"
              onClick={handleSendBroadcast}
              disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastBody.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-2"
            >
              {sendingBroadcast ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>{isRtl ? 'إرسال التعميم الآن' : 'Send Broadcast Now'}</span>
            </Btn>
          </Card>
        </div>
      )}

      {/* ================= التبويب الثاني: إدارة القوالب ================= */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* قائمة القوالب المحفوظة */}
          <Card className="p-3 bg-slate-900 border-slate-800 rounded-xl md:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200">{isRtl ? 'القوالب المحفوظة' : 'Saved Templates'}</span>
              <Btn
                variant="outline"
                onClick={handleNewTemplate}
                className="py-1 px-2 text-[11px] border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 rounded-lg flex items-center gap-1"
              >
                <Plus size={12} />
                <span>{isRtl ? 'جديد' : 'New'}</span>
              </Btn>
            </div>

            {loadingTemplates ? (
              <div className="py-8 text-center text-emerald-400">
                <Loader2 size={18} className="animate-spin mx-auto mb-1" />
                <span className="text-[11px] text-slate-500">{isRtl ? 'جاري التحميل...' : 'Loading...'}</span>
              </div>
            ) : templates.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">{isRtl ? 'لا توجد قوالب مضافة' : 'No templates found'}</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {templates.map(tmpl => {
                  const isSelected = selectedTemplate?.id === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => loadTemplateIntoForm(tmpl)}
                      className={`w-full p-2.5 text-right rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate">{tmpl.template_name}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{tmpl.trigger_event}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* محرر القالب وتغيير المتغيرات */}
          <Card className="p-4 bg-slate-900 border-slate-800 rounded-xl md:col-span-2">
            <h3 className="text-xs font-bold text-slate-200 mb-3">
              {selectedTemplate ? (isRtl ? 'تعديل القالب' : 'Edit Template') : (isRtl ? 'إنشاء قالب جديد' : 'Create Template')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{isRtl ? 'اسم القالب:' : 'Template Name:'}</label>
                <Input
                  type="text"
                  placeholder={isRtl ? 'مثال: التقرير اليومي' : 'Template name...'}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{isRtl ? 'حدث الإرسال (Trigger):' : 'Event:'}</label>
                <select
                  value={templateEvent}
                  onChange={(e) => setTemplateEvent(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="daily_report">{isRtl ? 'التقرير اليومي للحلقة' : 'Daily Report'}</option>
                  <option value="exam_reminder">{isRtl ? 'تذكير بموعد اختبار' : 'Exam Reminder'}</option>
                  <option value="absence_alert">{isRtl ? 'تنبيه غياب' : 'Absence Alert'}</option>
                </select>
              </div>
            </div>

            {/* زر إضافة المتغيرات الديناميكية */}
            <div className="mb-3">
              <label className="text-[11px] text-slate-400 block mb-1">{isRtl ? 'إدراج متغير ديناميكي:' : 'Insert Dynamic Variable:'}</label>
              <div className="flex flex-wrap gap-1.5">
                {availableVariables.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => insertVariable(v.code)}
                    className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-emerald-400 font-mono transition-colors"
                  >
                    + {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* نص القالب */}
            <div className="mb-4">
              <label className="text-[11px] text-slate-400 block mb-1">{isRtl ? 'نص القالب:' : 'Template Body:'}</label>
              <textarea
                rows={5}
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                placeholder={isRtl ? 'اكتب صيغة القالب هنا وادرج المتغيرات...' : 'Type template body...'}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />
            </div>

            <Btn
              variant="primary"
              onClick={handleSaveTemplate}
              disabled={savingTemplate || !templateName.trim() || !templateBody.trim()}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              {savingTemplate ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{isRtl ? 'حفظ القالب' : 'Save Template'}</span>
            </Btn>
          </Card>
        </div>
      )}
    </div>
  );
}
