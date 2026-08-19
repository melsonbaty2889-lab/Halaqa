import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'i18next';
import { 
  Send, Radio, FileText, Sparkles, Bell, 
  Plus, Save, Loader2, History, RefreshCw, 
  MessageSquare, Mail, ChevronDown, Check, Globe2, Sparkle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Btn, Input } from '@/components/UI/UI';

// القائمة المنسدلة المعتمدة كلياً على فئات الواجهة الموحدة
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
        className="w-full p-2.5 bg-card border border-border rounded-xl text-xs text-foreground flex items-center justify-between transition-all focus:outline-none"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
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
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={13} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommunicationHub({ academyId, academyName }) {
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

  const languageOptions = [
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'en', label: 'English (إنجليزية)' },
    { value: 'fr', label: 'Français (فرنسية)' },
    { value: 'tr', label: 'Türkçe (تركية)' },
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
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen p-3 sm:p-6 bg-background text-foreground">
      
      {/* شريط العنوان العلوي */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Radio size={24} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-foreground m-0 tracking-tight">
              {isRtl ? 'مركز التواصل والمراسلات الذكي' : 'Smart Messaging Center'}
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground m-0">
              {isRtl ? `منظومة الإشعارات الفورية لـ ${currentAcademyDisplayName}` : `Notification Engine for ${currentAcademyDisplayName}`}
            </p>
          </div>
        </div>

        {/* التبويبات الرئيسية */}
        <div className="flex p-1 bg-card border border-border rounded-xl self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'broadcast' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send size={13} />
            <span>{isRtl ? 'إرسال تعميم' : 'Broadcast'}</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'templates' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText size={13} />
            <span>{isRtl ? 'إدارة القوالب' : 'Templates'}</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History size={13} />
            <span>{isRtl ? 'سجل السيرفر' : 'Logs'}</span>
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      {activeTab !== 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            
            {activeTab === 'broadcast' && (
              <Card className="p-4 rounded-2xl">
                <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={15} />
                  <span>{isRtl ? 'إعداد تعميم جماعي جديد' : 'Compose Global Broadcast'}</span>
                </h2>

                <div className="mb-4">
                  <label className="text-[11px] font-medium text-foreground block mb-2">
                    {isRtl ? 'قنوات التوصيل المتاحة:' : 'Delivery Channels:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={16} className="text-primary" /> },
                      { id: 'email', label: 'Email', icon: <Mail size={16} className="text-destructive" /> },
                      { id: 'app', label: isRtl ? 'إشعار التطبيق' : 'App Notice', icon: <Bell size={16} className="text-warning" /> },
                    ].map(ch => {
                      const active = selectedChannels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleChannel(ch.id)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-center gap-2 transition-all ${
                            active 
                              ? 'bg-accent border-primary text-primary font-bold shadow' 
                              : 'bg-background border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {ch.icon}
                          <span className="truncate">{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[11px] font-medium text-foreground block mb-1.5">{isRtl ? 'الفئة المستهدفة:' : 'Target Audience:'}</label>
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
                    className="w-full text-xs"
                  />
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-muted-foreground">
                    <Sparkle size={12} className="text-primary" />
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
                        className="shrink-0 px-2.5 py-1 bg-background hover:bg-accent border border-border rounded-lg text-[10px] text-foreground transition-colors"
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
                    className="w-full p-3 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none leading-relaxed"
                  />
                </div>

                <Btn
                  variant="primary"
                  disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastBody.trim()}
                  className="w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  {sendingBroadcast ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isRtl ? 'إرسال الرسالة الآن' : 'Send Message Now'}</span>
                </Btn>
              </Card>
            )}

            {activeTab === 'templates' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <Card className="p-3 rounded-xl md:col-span-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-foreground">{isRtl ? 'قوالب الأكاديمية' : 'Templates'}</span>
                    <button
                      type="button"
                      onClick={handleNewTemplate}
                      className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus size={13} />
                      <span>{isRtl ? 'جديد' : 'New'}</span>
                    </button>
                  </div>

                  {loadingTemplates ? (
                    <div className="py-8 text-center text-primary">
                      <Loader2 size={16} className="animate-spin mx-auto mb-1" />
                    </div>
                  ) : templates.length === 0 && !isCreatingNew ? (
                    <div className="text-center py-6 text-muted-foreground text-[11px]">{isRtl ? 'لا توجد قوالب مخزنة' : 'No templates'}</div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {templates.map(tmpl => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => loadTemplateIntoForm(tmpl)}
                          className={`w-full p-2.5 text-right rounded-xl border text-xs transition-all ${
                            selectedTemplate?.id === tmpl.id && !isCreatingNew
                              ? 'bg-primary/10 border-primary text-primary font-bold'
                              : 'bg-background border-border text-muted-foreground hover:border-accent'
                          }`}
                        >
                          <div className="truncate">{tmpl.template_name}</div>
                          <div className="text-[10px] opacity-60 mt-0.5">{tmpl.trigger_event}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-4 rounded-xl md:col-span-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[11px] text-foreground block mb-1">{isRtl ? 'اسم القالب:' : 'Template Name:'}</label>
                      <Input
                        type="text"
                        placeholder={isRtl ? 'مثال: تقرير الحلقة' : 'Template name...'}
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-foreground block mb-1">{isRtl ? 'عنوان الرسالة:' : 'Message Title:'}</label>
                      <Input
                        type="text"
                        placeholder={isRtl ? 'عنوان الإشعار' : 'Title...'}
                        value={templateTitle}
                        onChange={(e) => setTemplateTitle(e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[11px] text-foreground block mb-1">{isRtl ? 'حدث الإشعار:' : 'Trigger Event:'}</label>
                      <CustomSelect
                        options={triggerEventOptions}
                        value={templateEvent}
                        onChange={setTemplateEvent}
                        placeholder={isRtl ? 'اختر الحدث' : 'Select Event'}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-foreground block mb-1 flex items-center gap-1">
                        <Globe2 size={12} className="text-primary" />
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
                    <label className="text-[11px] text-foreground block mb-1">{isRtl ? 'إدراج متغيرات آلية:' : 'Variables:'}</label>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {availableVariables.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setTemplateBody(prev => prev + ' ' + v.code)}
                          className="shrink-0 px-2.5 py-1 bg-background hover:bg-accent border border-border rounded-lg text-[10px] text-primary font-mono transition-colors"
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
                      className="w-full p-3 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary resize-none leading-relaxed placeholder:text-muted-foreground"
                    />
                  </div>

                  <Btn
                    variant="primary"
                    onClick={handleSaveTemplate}
                    disabled={savingTemplate || !templateName.trim() || !templateBody.trim()}
                    className="w-full py-2 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
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
            <Card className="w-full max-w-[320px] p-4 rounded-3xl shadow-2xl flex flex-col items-center border-t-4 border-t-primary">
              <div className="w-12 h-1 bg-border rounded-full mb-4"></div>
              <div className="text-[11px] font-bold text-foreground mb-3 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-primary" />
                <span>{isRtl ? 'معاينة الرسالة لدى ولي الأمر' : 'Parent Screen Preview'}</span>
              </div>

              <div className="w-full bg-background border border-border rounded-2xl p-3.5 min-h-[280px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-border">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold border border-primary/20">
                      {currentAcademyDisplayName.charAt(0)}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-[11px] font-bold text-foreground truncate">
                        {broadcastTitle || templateTitle || currentAcademyDisplayName}
                      </div>
                      <div className="text-[9px] text-muted-foreground">{isRtl ? 'الآن • رسالة مباشرة' : 'Now • Direct Message'}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-foreground whitespace-pre-wrap leading-relaxed">
                    {previewText}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-border flex items-center justify-between text-[9px] text-muted-foreground">
                  <span>{currentAcademyDisplayName}</span>
                  <span className="text-primary font-bold tracking-wider">Encrypted</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* سجل السيرفر */}
      {activeTab === 'logs' && (
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
              <History size={15} className="text-primary" />
              <span>{isRtl ? 'سجل العمليات والإرسال' : 'Dispatch Logs'}</span>
            </h2>
            <button
              onClick={fetchLogs}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} />
              <span>{isRtl ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>

          {loadingLogs ? (
            <div className="py-12 text-center text-primary">
              <Loader2 size={20} className="animate-spin mx-auto mb-2" />
              <span className="text-xs text-muted-foreground">{isRtl ? 'جاري جلب السجلات...' : 'Fetching logs...'}</span>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">{isRtl ? 'لا توجد سجلات إرسال حتى الآن' : 'No notification logs found'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-foreground">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[11px]">
                    <th className="p-2.5">{isRtl ? 'القناة' : 'Channel'}</th>
                    <th className="p-2.5">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="p-2.5">{isRtl ? 'نص الرسالة' : 'Text'}</th>
                    <th className="p-2.5">{isRtl ? 'التاريخ' : 'Sent Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-accent/50 transition-colors">
                      <td className="p-2.5 font-mono text-primary uppercase text-[10px]">{log.channel_used}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'delivered' || log.status === 'sent'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2.5 max-w-xs truncate text-muted-foreground">{log.sent_text}</td>
                      <td className="p-2.5 text-muted-foreground text-[10px]">
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
