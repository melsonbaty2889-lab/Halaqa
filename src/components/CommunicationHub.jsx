import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Send, Radio, FileText, Sparkles, Smartphone, Mail, Bell, 
  Plus, Save, Loader2, History, CheckCircle2, AlertCircle, 
  MessageSquare, RefreshCw, Layers, Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Btn, Input } from '@/components/UI/UI';

export default function MessagingCenter({ academyId }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith('ar');

  const [activeTab, setActiveTab] = useState('broadcast'); // 'broadcast' | 'templates' | 'logs'

  // ----- حالات التعميم الجماعي -----
  const [selectedChannels, setSelectedChannels] = useState(['app', 'whatsapp']);
  const [targetAudience, setTargetAudience] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // ----- حالات إدارة القوالب -----
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateEvent, setTemplateEvent] = useState('daily_report');
  const [templateLang, setTemplateLang] = useState('ar');
  const [templateBody, setTemplateBody] = useState('');
  const [templateChannels, setTemplateChannels] = useState(['whatsapp']);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // ----- حالات السجلات -----
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const availableVariables = [
    { code: '{student_name}', label: isRtl ? 'اسم الطالب' : 'Student Name' },
    { code: '{date}', label: isRtl ? 'التاريخ' : 'Date' },
    { code: '{attendance_status}', label: isRtl ? 'حالة الحضور' : 'Attendance' },
    { code: '{new_memorization}', label: isRtl ? 'الحفظ الجديد' : 'New Memorization' },
    { code: '{review}', label: isRtl ? 'المراجعة' : 'Review' },
    { code: '{session_grade}', label: isRtl ? 'التقييم' : 'Grade' },
  ];

  // جلب القوالب المطابقة لهيكل Supabase
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
  }, [academyId, selectedTemplate]);

  // جلب سجلات المراسلات
  const fetchLogs = useCallback(async () => {
    if (!academyId) return;
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [academyId]);

  useEffect(() => {
    if (activeTab === 'templates') fetchTemplates();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab, fetchTemplates, fetchLogs]);

  const loadTemplateIntoForm = (tmpl) => {
    setSelectedTemplate(tmpl);
    setTemplateName(tmpl.template_name || '');
    setTemplateTitle(tmpl.title || '');
    setTemplateEvent(tmpl.trigger_event || 'daily_report');
    setTemplateLang(tmpl.language_code || 'ar');
    setTemplateBody(tmpl.template_body || '');
    setTemplateChannels(tmpl.channels || ['whatsapp']);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateName('');
    setTemplateTitle('');
    setTemplateEvent('daily_report');
    setTemplateLang('ar');
    setTemplateBody('');
    setTemplateChannels(['whatsapp']);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !templateBody.trim() || !academyId) return;
    setSavingTemplate(true);
    try {
      const payload = {
        academy_id: academyId,
        template_name: templateName.trim(),
        title: templateTitle.trim(),
        trigger_event: templateEvent,
        language_code: templateLang,
        template_body: templateBody,
        channels: templateChannels,
        is_active: true,
        updated_at: new Date().toISOString()
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

  const toggleChannel = (chId, isTemplate = false) => {
    if (isTemplate) {
      setTemplateChannels(prev => 
        prev.includes(chId) ? prev.filter(c => c !== chId) : [...prev, chId]
      );
    } else {
      setSelectedChannels(prev => 
        prev.includes(chId) ? prev.filter(c => c !== chId) : [...prev, chId]
      );
    }
  };

  // المعاينة الحية واستبدال المتغيرات بصور افتراضية
  const previewText = useMemo(() => {
    let body = activeTab === 'broadcast' ? broadcastBody : templateBody;
    if (!body) return isRtl ? 'معاينة نص الرسالة تظهر هنا...' : 'Message preview appears here...';
    
    return body
      .replace(/{student_name}/g, isRtl ? 'عبدالرحمن أحمد' : 'Abderrahmane Ahmed')
      .replace(/{date}/g, new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US'))
      .replace(/{attendance_status}/g, isRtl ? 'حاضر ✅' : 'Present ✅')
      .replace(/{new_memorization}/g, isRtl ? 'سورة البقرة (١-١٥)' : 'Al-Baqarah (1-15)')
      .replace(/{review}/g, isRtl ? 'سورة يس' : 'Yasin')
      .replace(/{session_grade}/g, isRtl ? 'ممتاز (٩٥%)' : 'Excellent (95%)');
  }, [broadcastBody, templateBody, activeTab, isRtl]);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen p-3 sm:p-6 bg-slate-950 text-slate-100">
      
      {/* شريط العنوان العلوي */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
            <Radio size={24} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100 m-0 tracking-tight">
              {isRtl ? 'مركز التواصل والمراسلات الذكي' : 'Smart Messaging Center'}
            </h1>
            <p className="text-xs text-slate-400 m-0">
              {isRtl ? 'منظومة التعميمات الجماعية وإدارة قوالب الإشعارات الفورية' : 'Global broadcast & automated notification engine'}
            </p>
          </div>
        </div>

        {/* التبويبات الرئيسية */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'broadcast' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send size={13} />
            <span>{isRtl ? 'إرسال تعميم' : 'Broadcast'}</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'templates' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={13} />
            <span>{isRtl ? 'إدارة القوالب' : 'Templates'}</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History size={13} />
            <span>{isRtl ? 'سجل السيرفر' : 'Logs'}</span>
          </button>
        </div>
      </div>

      {/* ================= القسم الرئيسي: Grid يدمج الإدخال مع المعاينة الحية ================= */}
      {activeTab !== 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* العمود الأيسر/الأول: نماذج الإدخال */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            
            {activeTab === 'broadcast' && (
              <Card className="p-4 bg-slate-900/90 border-slate-800 rounded-2xl shadow-xl">
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={15} />
                  <span>{isRtl ? 'إعداد تعميم جماعي جديد' : 'Compose Global Broadcast'}</span>
                </h2>

                {/* اختيار القنوات المفعلة متعددة التحديد */}
                <div className="mb-4">
                  <label className="text-[11px] font-medium text-slate-400 block mb-2">{isRtl ? 'قنوات التوصيل الفوري:' : 'Delivery Channels:'}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'app', label: isRtl ? 'إشعار تطبيق' : 'In-App', icon: Bell },
                      { id: 'whatsapp', label: isRtl ? 'واتساب' : 'WhatsApp', icon: SmartphoneCheck },
                      { id: 'sms', label: 'SMS', icon: Smartphone },
                      { id: 'email', label: isRtl ? 'بريد إلكتروني' : 'Email', icon: Mail },
                    ].map(ch => {
                      const Icon = ch.icon;
                      const active = selectedChannels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleChannel(ch.id)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-center gap-2 transition-all ${
                            active 
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Icon size={14} />
                          <span>{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* تحديد شريحة المستهدفين */}
                <div className="mb-4">
                  <label className="text-[11px] font-medium text-slate-400 block mb-1.5">{isRtl ? 'الفئة المستهدفة:' : 'Target Audience:'}</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">{isRtl ? 'جميع الطلاب وأولياء الأمور بالمركز' : 'All Academy Students & Guardians'}</option>
                    <option value="present_today">{isRtl ? 'الطلاب الحاضرون في جلسة اليوم' : 'Students Present Today'}</option>
                    <option value="absent_today">{isRtl ? 'الطلاب الغائبون اليوم (تنبيه أولياء الأمور)' : 'Students Absent Today'}</option>
                  </select>
                </div>

                {/* الموضوع والنص */}
                <div className="mb-3">
                  <Input
                    type="text"
                    placeholder={isRtl ? 'عنوان التعميم (مثال: تنبيه بخصوص موعد الاختبارات)' : 'Broadcast Subject...'}
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full bg-slate-950 border-slate-800 text-xs"
                  />
                </div>

                <div className="mb-4">
                  <textarea
                    rows={5}
                    placeholder={isRtl ? 'اكتب نص التعميم هنا...' : 'Type broadcast content here...'}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                <Btn
                  variant="primary"
                  disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastBody.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  {sendingBroadcast ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isRtl ? 'بث التعميم الفوري' : 'Dispatch Broadcast'}</span>
                </Btn>
              </Card>
            )}

            {activeTab === 'templates' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* القائمة الجانبية للقوالب */}
                <Card className="p-3 bg-slate-900 border-slate-800 rounded-xl md:col-span-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300">{isRtl ? 'القوالب المتاحة' : 'Templates'}</span>
                    <button
                      onClick={handleNewTemplate}
                      className="p-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>{isRtl ? 'جديد' : 'Add'}</span>
                    </button>
                  </div>

                  {loadingTemplates ? (
                    <div className="py-8 text-center text-emerald-400">
                      <Loader2 size={16} className="animate-spin mx-auto mb-1" />
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-[11px]">{isRtl ? 'لا توجد قوالب' : 'Empty'}</div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {templates.map(tmpl => (
                        <button
                          key={tmpl.id}
                          onClick={() => loadTemplateIntoForm(tmpl)}
                          className={`w-full p-2.5 text-right rounded-xl border text-xs transition-all ${
                            selectedTemplate?.id === tmpl.id
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="truncate">{tmpl.template_name}</div>
                          <div className="text-[10px] opacity-60 mt-0.5">{tmpl.trigger_event}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>

                {/* محرر القالب المطابق لربط Supabase */}
                <Card className="p-4 bg-slate-900 border-slate-800 rounded-xl md:col-span-8">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">{isRtl ? 'اسم القالب الداخلي:' : 'Template Name:'}</label>
                      <Input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">{isRtl ? 'عنوان الإشعار (Title):' : 'Notification Title:'}</label>
                      <Input
                        type="text"
                        value={templateTitle}
                        onChange={(e) => setTemplateTitle(e.target.value)}
                        className="w-full bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">{isRtl ? 'حدث الإشعار (Trigger):' : 'Trigger Event:'}</label>
                      <select
                        value={templateEvent}
                        onChange={(e) => setTemplateEvent(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="daily_report">{isRtl ? 'التقرير اليومي للحلقة' : 'Daily Report'}</option>
                        <option value="exam_reminder">{isRtl ? 'تذكير اختبار' : 'Exam Reminder'}</option>
                        <option value="absence_alert">{isRtl ? 'تنبيه غياب' : 'Absence Alert'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">{isRtl ? 'اللغة:' : 'Language:'}</label>
                      <select
                        value={templateLang}
                        onChange={(e) => setTemplateLang(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="ar">العربية (Arabic)</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  {/* المتغيرات الديناميكية */}
                  <div className="mb-3">
                    <label className="text-[10px] text-slate-400 block mb-1">{isRtl ? 'إدراج متغير:' : 'Variables:'}</label>
                    <div className="flex flex-wrap gap-1">
                      {availableVariables.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setTemplateBody(prev => prev + ' ' + v.code)}
                          className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[10px] text-emerald-400 font-mono"
                        >
                          + {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* المحتوى */}
                  <div className="mb-4">
                    <textarea
                      rows={5}
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
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
                    <span>{isRtl ? 'حفظ القالب في Supabase' : 'Save Template'}</span>
                  </Btn>
                </Card>
              </div>
            )}
          </div>

          {/* العمود الأيمن/الثاني: محاكاة جوال ولي الأمر الحية (Live Mockup UI) */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center">
            <Card className="w-full max-w-[320px] p-4 bg-slate-900 border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center border-t-4 border-t-emerald-500">
              <div className="w-16 h-1 bg-slate-800 rounded-full mb-4"></div>
              <div className="text-[11px] font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                <Smartphone size={13} className="text-emerald-400" />
                <span>{isRtl ? 'معاينة وصول الرسالة لولي الأمر' : 'Live Parent Screen Preview'}</span>
              </div>

              {/* مجسم الشاشة */}
              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-inner min-h-[280px] flex flex-col justify-between dir-auto">
                <div>
                  {/* هيدر الرسالة */}
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800/80">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      قرآن
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-[10px] font-bold text-slate-200 truncate">
                        {broadcastTitle || templateTitle || (isRtl ? 'إشعار من الأكاديمية' : 'Academy Notice')}
                      </div>
                      <div className="text-[8px] text-slate-500">الآن • عبر الواتساب/التطبيق</div>
                    </div>
                  </div>

                  {/* محتوى المعاينة المترجم ديناميكياً */}
                  <div className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {previewText}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-500">
                  <span>Smart Halaqa Dispatcher</span>
                  <span className="text-emerald-500 font-bold">SSL Encrypted</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* ================= التبويب الثالث: سجل السيرفر والإرسال ================= */}
      {activeTab === 'logs' && (
        <Card className="p-4 bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <History size={15} className="text-emerald-400" />
              <span>{isRtl ? 'سجل عمليات الإرسال الأخيرة (notification_logs)' : 'Recent Dispatch Logs'}</span>
            </h2>
            <button
              onClick={fetchLogs}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1"
            >
              <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} />
              <span>{isRtl ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>

          {loadingLogs ? (
            <div className="py-12 text-center text-emerald-400">
              <Loader2 size={20} className="animate-spin mx-auto mb-2" />
              <span className="text-xs text-slate-500">{isRtl ? 'جاري جلب السجلات من Supabase...' : 'Fetching logs...'}</span>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">{isRtl ? 'لا توجد سجلات إرسال سابقة' : 'No notification logs found'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="p-2.5">{isRtl ? 'القناة' : 'Channel'}</th>
                    <th className="p-2.5">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="p-2.5">{isRtl ? 'نص الرسالة' : 'Text'}</th>
                    <th className="p-2.5">{isRtl ? 'تاريخ الإرسال' : 'Sent Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="p-2.5 font-mono text-emerald-400 uppercase text-[10px]">{log.channel_used}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'delivered' || log.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2.5 max-w-xs truncate text-slate-400">{log.sent_text}</td>
                      <td className="p-2.5 text-slate-500 text-[10px]">
                        {new Date(log.created_at).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

    </div>
  );
}
