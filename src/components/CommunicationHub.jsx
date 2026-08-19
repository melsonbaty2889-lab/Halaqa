import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Send, Radio, FileText, Sparkles, Bell, 
  Plus, Save, Loader2, History, RefreshCw, 
  MessageSquare, Mail, ChevronDown, Check, Globe2, Sparkle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Btn, Input } from '@/components/UI/UI';

// مكون الاختيار المخصص المتوافق مع الهوية الكحلية والمنقطة
function CustomSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-2.5 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-slate-200 flex items-center justify-between hover:border-slate-700 transition-all focus:outline-none"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full p-2.5 text-right text-xs flex items-center justify-between transition-colors ${
                value === opt.value
                  ? 'bg-emerald-500/15 text-emerald-300 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={13} className="text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessagingCenter({ academyId, academyName }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith('ar');

  const [activeTab, setActiveTab] = useState('broadcast');

  // حالات الإرسال الجماعي
  const [selectedChannels, setSelectedChannels] = useState(['whatsapp']);
  const [targetAudience, setTargetAudience] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // حالات القوالب
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateEvent, setTemplateEvent] = useState('daily_report');
  const [templateLang, setTemplateLang] = useState('ar');
  const [templateBody, setTemplateBody] = useState('');
  const [templateChannels, setTemplateChannels] = useState(['whatsapp']);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // حالات السجلات
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // صيغ جاهزة ومقترحة للتوعية والتنوع
  const presetTemplates = [
    { title: 'تقرير اليوم', body: 'السلام عليكم ورحمة الله، تقرير الطالب {student_name} بتاريخ {date}: الحفظ ({new_memorization})، المراجعة ({review})، التقييم العام ({session_grade}).' },
    { title: 'تذكير اختبار', body: 'نحيطكم علماً بأنه تقرر عقد اختبار للطالب {student_name} بتاريخ {date}. نرجو المتابعة والمراجعة.' },
    { title: 'تنبيه غياب', body: 'تنبيه: نود إحاطتكم بغياب الطالب {student_name} عن حلقة اليوم بتاريخ {date}. نرجو التواصل معنا.' },
    { title: 'تهنئة وتشجيع', body: 'مبارك! أظهر الطالب {student_name} أداءً ممتازاً وتفوقاً ملحوظاً في حفظ اليوم ({new_memorization}).' }
  ];

  const availableVariables = [
    { code: '{student_name}', label: isRtl ? 'اسم الطالب' : 'Student Name' },
    { code: '{date}', label: isRtl ? 'التاريخ' : 'Date' },
    { code: '{attendance_status}', label: isRtl ? 'حالة الحضور' : 'Attendance' },
    { code: '{new_memorization}', label: isRtl ? 'الحفظ الجديد' : 'New Memorization' },
    { code: '{review}', label: isRtl ? 'المراجعة' : 'Review' },
    { code: '{session_grade}', label: isRtl ? 'التقييم' : 'Grade' },
  ];

  const targetAudienceOptions = [
    { value: 'all', label: isRtl ? 'جميع أولياء أمور الأكاديمية' : 'All Academy Parents' },
    { value: 'present_today', label: isRtl ? 'أولياء أمور الطلاب الحاضرين اليوم' : 'Parents of Present Students' },
    { value: 'absent_today', label: isRtl ? 'أولياء أمور الطلاب الغائبين اليوم' : 'Parents of Absent Students' },
  ];

  const triggerEventOptions = [
    { value: 'daily_report', label: isRtl ? 'التقرير اليومي للحلقة' : 'Daily Report' },
    { value: 'exam_reminder', label: isRtl ? 'تذكير بموعد الاختبار' : 'Exam Reminder' },
    { value: 'absence_alert', label: isRtl ? 'تنبيه غياب الطالب' : 'Absence Alert' },
    { value: 'fee_notice', label: isRtl ? 'إشعار الرسوم والتسديد' : 'Fee Notice' },
  ];

  // دعم لغوي موسع
  const languageOptions = [
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'en', label: 'English (الإنجليزية)' },
    { value: 'fr', label: 'Français (الفرنسية)' },
    { value: 'tr', label: 'Türkçe (التركية)' },
  ];

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
      if (data && data.length > 0 && !selectedTemplate && !isCreatingNew) {
        loadTemplateIntoForm(data[0]);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  }, [academyId, selectedTemplate, isCreatingNew]);

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
    setIsCreatingNew(false);
    setTemplateName(tmpl.template_name || '');
    setTemplateTitle(tmpl.title || '');
    setTemplateEvent(tmpl.trigger_event || 'daily_report');
    setTemplateLang(tmpl.language_code || 'ar');
    setTemplateBody(tmpl.template_body || '');
    setTemplateChannels(tmpl.channels || ['whatsapp']);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setIsCreatingNew(true);
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

      setIsCreatingNew(false);
      await fetchTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setSavingTemplate(false);
    }
  };

  const toggleChannel = (chId) => {
    setSelectedChannels(prev => 
      prev.includes(chId) ? prev.filter(c => c !== chId) : [...prev, chId]
    );
  };

  const previewText = useMemo(() => {
    let body = activeTab === 'broadcast' ? broadcastBody : templateBody;
    if (!body) return isRtl ? 'معاينة نص الرسالة تظهر هنا...' : 'Message preview appears here...';
    
    return body
      .replace(/{student_name}/g, isRtl ? '[اسم الطالب]' : '[Student Name]')
      .replace(/{date}/g, new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US'))
      .replace(/{attendance_status}/g, isRtl ? '[حالة الحضور]' : '[Attendance]')
      .replace(/{new_memorization}/g, isRtl ? '[الحفظ الجديد]' : '[New Memorization]')
      .replace(/{review}/g, isRtl ? '[المراجعة]' : '[Review]')
      .replace(/{session_grade}/g, isRtl ? '[التقييم]' : '[Grade]');
  }, [broadcastBody, templateBody, activeTab, isRtl]);

  const currentAcademyDisplayName = academyName || (isRtl ? 'الأكاديمية' : 'Academy');

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="min-h-screen p-3 sm:p-6 bg-[#0B0F17] text-slate-100 relative overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}
    >
      
      {/* شريط العنوان العلوي */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40 shrink-0">
            <Radio size={24} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-100 m-0 tracking-tight">
              {isRtl ? 'مركز التواصل والمراسلات الذكي' : 'Smart Messaging Center'}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 m-0">
              {isRtl ? `منظومة الإشعارات الفورية لـ ${currentAcademyDisplayName}` : `Notification Engine for ${currentAcademyDisplayName}`}
            </p>
          </div>
        </div>

        {/* التبويبات الرئيسية */}
        <div className="flex p-1 bg-[#111827] border border-slate-800 rounded-xl self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'broadcast' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send size={13} />
            <span>{isRtl ? 'إرسال تعميم' : 'Broadcast'}</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'templates' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={13} />
            <span>{isRtl ? 'إدارة القوالب' : 'Templates'}</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History size={13} />
            <span>{isRtl ? 'سجل السيرفر' : 'Logs'}</span>
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      {activeTab !== 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
          
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            
            {activeTab === 'broadcast' && (
              <Card className="p-4 bg-[#111827]/90 border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={15} />
                  <span>{isRtl ? 'إعداد تعميم جماعي جديد' : 'Compose Global Broadcast'}</span>
                </h2>

                {/* شبكة القنوات الموحدة مع الشعارات الرسمية المعتمدة */}
                <div className="mb-4">
                  <label className="text-[11px] font-medium text-slate-300 block mb-2">
                    {isRtl ? 'قنوات التوصيل المتاحة:' : 'Delivery Channels:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { 
                        id: 'whatsapp', 
                        label: 'WhatsApp', 
                        activeBg: 'bg-[#25D366]/15 border-[#25D366]',
                        svg: (
                          <svg className="w-4 h-4 fill-current text-[#25D366]" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                          </svg>
                        )
                      },
                      { 
                        id: 'email', 
                        label: 'Email', 
                        activeBg: 'bg-rose-500/15 border-rose-500',
                        svg: (
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
  <path fill="#EA4335" d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20v12z"/>
</svg>

                            <path fill="#EA4335" d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20v12z"/>
                          </svg>
                        )
                      },
                      { 
                        id: 'app', 
                        label: isRtl ? 'إشعار التطبيق' : 'App Notice', 
                        activeBg: 'bg-amber-500/15 border-amber-500',
                        svg: <Bell size={16} className="text-amber-400" />
                      },
                    ].map(ch => {
                      const active = selectedChannels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleChannel(ch.id)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-center gap-2 transition-all ${
                            active 
                              ? `${ch.activeBg} text-slate-100 font-bold shadow-md` 
                              : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {ch.svg}
                          <span className="truncate">{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[11px] font-medium text-slate-300 block mb-1.5">{isRtl ? 'الفئة المستهدفة:' : 'Target Audience:'}</label>
                  <CustomSelect
                    options={targetAudienceOptions}
                    value={targetAudience}
                    onChange={setTargetAudience}
                    placeholder={isRtl ? 'اختر الفئة' : 'Select Audience'}
                  />
                </div>

                <div className="mb-3">
                  <Input
                    type="text"
                    placeholder={isRtl ? 'عنوان الرسالة / الموضوع...' : 'Subject...'}
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full bg-[#0F172A] border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                  />
                </div>

                {/* صيغ مقترحة سريعة لتنويع المراسلة */}
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-slate-400">
                    <Sparkle size={12} className="text-amber-400" />
                    <span>{isRtl ? 'نماذج وصيغ جاهزة للتعبئة:' : 'Preset templates:'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {presetTemplates.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setBroadcastTitle(preset.title);
                          setBroadcastBody(preset.body);
                        }}
                        className="shrink-0 px-2.5 py-1 bg-[#0F172A] hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 transition-colors"
                      >
                        + {preset.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <textarea
                    rows={5}
                    placeholder={isRtl ? 'اكتب نص الرسالة المراد إرسالها لولي الأمر...' : 'Type message body...'}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    className="w-full p-3 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                <Btn
                  variant="primary"
                  disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastBody.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  {sendingBroadcast ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isRtl ? 'إرسال الرسالة الآن' : 'Send Message Now'}</span>
                </Btn>
              </Card>
            )}

            {activeTab === 'templates' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <Card className="p-3 bg-[#111827] border-slate-800 rounded-xl md:col-span-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300">{isRtl ? 'قوالب الأكاديمية' : 'Templates'}</span>
                    <button
                      type="button"
                      onClick={handleNewTemplate}
                      className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus size={13} />
                      <span>{isRtl ? 'جديد' : 'New'}</span>
                    </button>
                  </div>

                  {loadingTemplates ? (
                    <div className="py-8 text-center text-emerald-400">
                      <Loader2 size={16} className="animate-spin mx-auto mb-1" />
                    </div>
                  ) : templates.length === 0 && !isCreatingNew ? (
                    <div className="text-center py-6 text-slate-500 text-[11px]">{isRtl ? 'لا توجد قوالب مخزنة' : 'No templates'}</div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {templates.map(tmpl => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => loadTemplateIntoForm(tmpl)}
                          className={`w-full p-2.5 text-right rounded-xl border text-xs transition-all ${
                            selectedTemplate?.id === tmpl.id && !isCreatingNew
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="truncate">{tmpl.template_name}</div>
                          <div className="text-[10px] opacity-60 mt-0.5">{tmpl.trigger_event}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-4 bg-[#111827] border-slate-800 rounded-xl md:col-span-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">{isRtl ? 'اسم القالب:' : 'Template Name:'}</label>
                      <Input
                        type="text"
                        placeholder={isRtl ? 'مثال: تقرير الحلقة' : 'Template name...'}
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full bg-[#0F172A] border-slate-800 text-xs text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">{isRtl ? 'عنوان الرسالة:' : 'Message Title:'}</label>
                      <Input
                        type="text"
                        placeholder={isRtl ? 'عنوان الإشعار' : 'Title...'}
                        value={templateTitle}
                        onChange={(e) => setTemplateTitle(e.target.value)}
                        className="w-full bg-[#0F172A] border-slate-800 text-xs text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">{isRtl ? 'حدث الإشعار:' : 'Trigger Event:'}</label>
                      <CustomSelect
                        options={triggerEventOptions}
                        value={templateEvent}
                        onChange={setTemplateEvent}
                        placeholder={isRtl ? 'اختر الحدث' : 'Select Event'}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1 flex items-center gap-1">
                        <Globe2 size={12} className="text-emerald-400" />
                        <span>{isRtl ? 'لغة الرسالة:' : 'Language:'}</span>
                      </label>
                      <CustomSelect
                        options={languageOptions}
                        value={templateLang}
                        onChange={setTemplateLang}
                        placeholder={isRtl ? 'اختر اللغة' : 'Select Language'}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-[11px] text-slate-300 block mb-1">{isRtl ? 'إدراج متغيرات آلية:' : 'Variables:'}</label>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {availableVariables.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setTemplateBody(prev => prev + ' ' + v.code)}
                          className="shrink-0 px-2.5 py-1 bg-[#0F172A] hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-emerald-400 font-mono transition-colors"
                        >
                          + {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <textarea
                      rows={5}
                      placeholder={isRtl ? 'نص القالب...' : 'Template text...'}
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                      className="w-full p-3 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed placeholder:text-slate-500"
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

          {/* المعاينة الحية */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center">
            <Card className="w-full max-w-[320px] p-4 bg-[#111827] border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center border-t-4 border-t-emerald-500">
              <div className="w-12 h-1 bg-slate-800 rounded-full mb-4"></div>
              <div className="text-[11px] font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-emerald-400" />
                <span>{isRtl ? 'معاينة الرسالة لدى ولي الأمر' : 'Parent Screen Preview'}</span>
              </div>

              <div className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-3.5 shadow-inner min-h-[280px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-slate-800/80">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold border border-emerald-500/30">
                      {currentAcademyDisplayName.charAt(0)}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-[11px] font-bold text-slate-200 truncate">
                        {broadcastTitle || templateTitle || currentAcademyDisplayName}
                      </div>
                      <div className="text-[9px] text-slate-500">{isRtl ? 'الآن • رسالة مباشرة' : 'Now • Direct Message'}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {previewText}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-500">
                  <span>{currentAcademyDisplayName}</span>
                  <span className="text-emerald-400 font-bold tracking-wider">Encrypted</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* سجل السيرفر */}
      {activeTab === 'logs' && (
        <Card className="p-4 bg-[#111827] border-slate-800 rounded-2xl relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <History size={15} className="text-emerald-400" />
              <span>{isRtl ? 'سجل العمليات والإرسال' : 'Dispatch Logs'}</span>
            </h2>
            <button
              onClick={fetchLogs}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} />
              <span>{isRtl ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>

          {loadingLogs ? (
            <div className="py-12 text-center text-emerald-400">
              <Loader2 size={20} className="animate-spin mx-auto mb-2" />
              <span className="text-xs text-slate-500">{isRtl ? 'جاري جلب السجلات...' : 'Fetching logs...'}</span>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">{isRtl ? 'لا توجد سجلات إرسال حتى الآن' : 'No notification logs found'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="p-2.5">{isRtl ? 'القناة' : 'Channel'}</th>
                    <th className="p-2.5">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="p-2.5">{isRtl ? 'نص الرسالة' : 'Text'}</th>
                    <th className="p-2.5">{isRtl ? 'التاريخ' : 'Sent Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
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
