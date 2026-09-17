import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Send, Radio, FileText, Sparkles, Bell, 
  Plus, Save, Loader2, History, RefreshCw, 
  MessageSquare, Mail, Globe2, Sparkle, BookOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Btn, Input } from '@/components/UI/UI';
import { AVAILABLE_VARIABLES, PRESET_TEMPLATES } from '@/data/reportTemplates';
import CustomSelect from './CustomSelect';
import LivePreview from './LivePreview';

export default function CommunicationHub({ academyId, academyName }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  // دعم الاتجاه من اليمين لليسار للعربية والأوردو
  const isRtl = currentLang.startsWith('ar') || currentLang.startsWith('ur');

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
  const [templateLang, setTemplateLang] = useState(currentLang.slice(0, 2));
  const [templateBody, setTemplateBody] = useState('');
  const [templateChannels, setTemplateChannels] = useState(['whatsapp']);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // حالات السجلات
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // خيارات الفئات المستهدفة المخصصة للحلقات والمراكز القرآنية
  const targetAudienceOptions = useMemo(() => [
    { value: 'all', label: t('comm.aud_all', 'جميع أولياء أمور وطلاب الحلقات') },
    { value: 'present_today', label: t('comm.aud_present', 'أولياء أمور الحاضرين في الحلقة اليوم') },
    { value: 'absent_today', label: t('comm.aud_absent', 'أولياء أمور الغائبين عن الحلقة اليوم') },
    { value: 'huffaz', label: t('comm.aud_huffaz', 'خاتمو الأجزاء والقرآن الكريم') },
  ], [t]);

  // أحداث المشغلات الخاصة بحلقات القرآن الكريم
  const triggerEventOptions = useMemo(() => [
    { value: 'daily_report', label: t('comm.evt_daily', 'تقرير إنجاز الحلقة (حفظ ومراجعة)') },
    { value: 'exam_reminder', label: t('comm.evt_exam', 'تذكير بموعد اختبار الجزء / السورة') },
    { value: 'absence_alert', label: t('comm.evt_absence', 'تنبيه غياب عن الحلقة القرآنية') },
    { value: 'khatm_congrat', label: t('comm.evt_khatm', 'تهنئة ختم جزء / السلسلة القرآنية') },
    { value: 'fee_notice', label: t('comm.evt_fee', 'إشعار كفالة / رسوم الحلقة') },
  ], [t]);

  // اللغات العالمية الأكثر استخداماً في حلقات تحفيظ القرآن حول العالم
  const languageOptions = useMemo(() => [
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'en', label: 'English (الإنجليزية)' },
    { value: 'fr', label: 'Français (الفرنسية)' },
    { value: 'tr', label: 'Türkçe (التركية)' },
    { value: 'ur', label: 'اردو (الأوردو)' },
    { value: 'id', label: 'Bahasa Indonesia (الإندونيسية)' },
  ], []);

  const loadTemplateIntoForm = useCallback((tmpl) => {
    setSelectedTemplate(tmpl);
    setIsCreatingNew(false);
    setTemplateName(tmpl.template_name || '');
    setTemplateTitle(tmpl.title || '');
    setTemplateEvent(tmpl.trigger_event || 'daily_report');
    setTemplateLang(tmpl.language_code || currentLang.slice(0, 2));
    setTemplateBody(tmpl.template_body || '');
    setTemplateChannels(tmpl.channels || ['whatsapp']);
  }, [currentLang]);

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
  }, [academyId, selectedTemplate, isCreatingNew, loadTemplateIntoForm]);

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

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setIsCreatingNew(true);
    setTemplateName('');
    setTemplateTitle('');
    setTemplateEvent('daily_report');
    setTemplateLang(currentLang.slice(0, 2));
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

  // معاينة نص الرسالة مع تعويض متحرّك مخصص للإنجاز القرآنـي
  const previewText = useMemo(() => {
    let body = activeTab === 'broadcast' ? broadcastBody : templateBody;
    if (!body) return t('comm.preview_empty', 'معاينة نص الرسالة القرآنية ستظهر هنا...');
    
    return body
      .replace(/\{student_name\}|\{\{student_name\}\}/g, t('comm.var_student', '[اسم الطالب]'))
      .replace(/\{date\}|\{\{date\}\}/g, new Date().toLocaleDateString(currentLang))
      .replace(/\{attendance_status\}|\{\{attendance_status\}\}/g, t('comm.var_attendance', '[حضور / غياب]'))
      .replace(/\{new_memorization\}|\{\{new_memorization\}\}/g, t('comm.var_new', '[سورة البقرة: 1-15]'))
      .replace(/\{review\}|\{\{review\}\}/g, t('comm.var_review', '[الجزء الأول]'))
      .replace(/\{session_grade\}|\{\{session_grade\}\}/g, t('comm.var_grade', '[ممتاز  ممتاز]'));
  }, [broadcastBody, templateBody, activeTab, currentLang, t]);

  const currentAcademyDisplayName = academyName || t('comm.academy_default', 'مجمع الحلقة الذكية');

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="min-h-screen p-3 sm:p-6 bg-transparent text-[var(--text-main,#FFFFFF)] select-none relative overflow-hidden"
    >
      <div className="relative z-10">
        {/* رأس الصفحة مع شارات الهوية القرآنية الذكية */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--emerald-text,#10B981)]/10 border border-[var(--emerald-text,#10B981)]/20 flex items-center justify-center text-[var(--emerald-text,#10B981)] shrink-0 shadow-[0_0_15px_var(--emerald-radial-glow,rgba(16,185,129,0.2))]">
              <Radio size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[var(--text-main,#FFFFFF)] m-0 tracking-tight">
                  {t('comm.hub_title', 'مركز التواصل والمراسلات للحلقة الذكية')}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--emerald-text,#10B981)]/10 text-[var(--emerald-text,#10B981)] border border-[var(--emerald-text,#10B981)]/20 font-bold flex items-center gap-1">
                  <BookOpen size={10} /> القرآن الكريم
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-sub,#94A3B8)] m-0 font-medium">
                {t('comm.hub_sub', 'منظومة الإشعارات والتواصل الفوري مع أولياء الأمور والطلاب لـ')} {currentAcademyDisplayName}
              </p>
            </div>
          </div>

          <div className="flex p-1 bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md rounded-xl self-start sm:self-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'broadcast' 
                  ? 'bg-[var(--primary,#E07A00)] text-[var(--text-main,#FFFFFF)] shadow-[0_0_12px_rgba(224,122,0,0.3)]' 
                  : 'text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)]'
              }`}
            >
              <Send size={13} />
              <span>{t('comm.tab_broadcast', 'تعميم جماعي')}</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'templates' 
                  ? 'bg-[var(--primary,#E07A00)] text-[var(--text-main,#FFFFFF)] shadow-[0_0_12px_rgba(224,122,0,0.3)]' 
                  : 'text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)]'
              }`}
            >
              <FileText size={13} />
              <span>{t('comm.tab_templates', 'قوالب الرسائل')}</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'logs' 
                  ? 'bg-[var(--primary,#E07A00)] text-[var(--text-main,#FFFFFF)] shadow-[0_0_12px_rgba(224,122,0,0.3)]' 
                  : 'text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)]'
              }`}
            >
              <History size={13} />
              <span>{t('comm.tab_logs', 'سجل الإرسال')}</span>
            </button>
          </div>
        </div>

        {activeTab !== 'logs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
              {activeTab === 'broadcast' && (
                <div className="p-4 rounded-2xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md shadow-lg">
                  <h2 className="text-xs font-bold text-[var(--primary,#E07A00)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles size={15} />
                    <span>{t('comm.bcast_title', 'إرسال تعميم جديد لمجموعات الحلقات')}</span>
                  </h2>

                  <div className="mb-4">
                    <label className="text-[11px] font-medium text-[var(--text-main,#FFFFFF)] block mb-2">
                      {t('comm.channels', 'قنوات التوصيل المتاحة:')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={16} className="text-[var(--emerald-text,#10B981)]" /> },
                        { id: 'email', label: 'Email', icon: <Mail size={16} className="text-[var(--primary,#E07A00)]" /> },
                        { id: 'app', label: t('comm.app_notice', 'إشعار التطبيق'), icon: <Bell size={16} className="text-amber-400" /> },
                      ].map(ch => {
                        const active = selectedChannels.includes(ch.id);
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => toggleChannel(ch.id)}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-center gap-2 transition-all ${
                              active 
                                ? 'bg-[var(--emerald-text,#10B981)]/10 border-[var(--emerald-text,#10B981)] text-[var(--emerald-text,#10B981)] font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                                : 'bg-[var(--surface-input,#0A101D)] border-[var(--border-input,#1B2738)] text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)]'
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
                    <label className="text-[11px] font-medium text-[var(--text-main,#FFFFFF)] block mb-1.5">{t('comm.target', 'الفئة المستهدفة:')}</label>
                    <CustomSelect
                      options={targetAudienceOptions}
                      value={targetAudience}
                      onChange={setTargetAudience}
                      placeholder={t('comm.select_target', 'اختر الفئة')}
                    />
                  </div>

                  <div className="mb-3">
                    <Input
                      type="text"
                      placeholder={t('comm.subject_ph', 'عنوان الرسالة / الموضوع (مثال: موعد اختبار السلسلة)...')}
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full text-xs bg-[var(--surface-input,#0A101D)] border-[var(--border-input,#1B2738)] text-[var(--text-main,#FFFFFF)] placeholder:text-[var(--text-sub,#94A3B8)]"
                    />
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-[var(--text-sub,#94A3B8)]">
                      <Sparkle size={12} className="text-[var(--primary,#E07A00)]" />
                      <span>{t('comm.presets', 'قوالب وإشعارات قرآنية سريعة:')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {(PRESET_TEMPLATES || []).map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setBroadcastTitle(preset.title);
                            setBroadcastBody(preset.body);
                          }}
                          className="shrink-0 px-2.5 py-1 bg-[var(--surface-input,#0A101D)] hover:bg-[var(--emerald-text,#10B981)]/10 border border-[var(--border-input,#1B2738)] hover:border-[var(--emerald-text,#10B981)]/30 rounded-lg text-[10px] text-[var(--text-main,#FFFFFF)] transition-colors"
                        >
                          + {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <textarea
                      rows={5}
                      placeholder={t('comm.body_ph', 'اكتب نص الرسالة لولي أمر الطالب / الطالب مع إمكانية استخدام المتغيرات...')}
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      className="w-full p-3 bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-xl text-xs text-[var(--text-main,#FFFFFF)] placeholder:text-[var(--text-sub,#94A3B8)] focus:outline-none focus:border-[var(--primary,#E07A00)] resize-none leading-relaxed"
                    />
                  </div>

                  <Btn
                    variant="primary"
                    disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastBody.trim()}
                    className="w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 bg-[var(--primary,#E07A00)] text-[var(--text-main,#FFFFFF)] shadow-[0_0_15px_rgba(224,122,0,0.3)] hover:opacity-90 disabled:opacity-50"
                  >
                    {sendingBroadcast ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>{t('comm.send_btn', 'إرسال التعميم الآن')}</span>
                  </Btn>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="p-3 rounded-xl md:col-span-4 bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[var(--text-main,#FFFFFF)]">{t('comm.tmpl_list', 'قوالب مجمع الحلقات')}</span>
                      <button
                        type="button"
                        onClick={handleNewTemplate}
                        className="px-2.5 py-1 bg-[var(--emerald-text,#10B981)]/10 text-[var(--emerald-text,#10B981)] border border-[var(--emerald-text,#10B981)]/20 rounded-lg hover:bg-[var(--emerald-text,#10B981)]/20 text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Plus size={13} />
                        <span>{t('comm.new', 'جديد')}</span>
                      </button>
                    </div>

                    {loadingTemplates ? (
                      <div className="py-8 text-center text-[var(--primary,#E07A00)]">
                        <Loader2 size={16} className="animate-spin mx-auto mb-1" />
                      </div>
                    ) : templates.length === 0 && !isCreatingNew ? (
                      <div className="text-center py-6 text-[var(--text-sub,#94A3B8)] text-[11px]">{t('comm.no_tmpl', 'لا توجد قوالب محفوظة')}</div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {templates.map(tmpl => (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => loadTemplateIntoForm(tmpl)}
                            className={`w-full p-2.5 text-right rounded-xl border text-xs transition-all ${
                              selectedTemplate?.id === tmpl.id && !isCreatingNew
                                ? 'bg-[var(--primary,#E07A00)]/10 border-[var(--primary,#E07A00)] text-[var(--primary,#E07A00)] font-bold'
                                : 'bg-[var(--surface-input,#0A101D)] border-[var(--border-input,#1B2738)] text-[var(--text-sub,#94A3B8)] hover:border-[var(--primary,#E07A00)]/50'
                            }`}
                          >
                            <div className="truncate">{tmpl.template_name}</div>
                            <div className="text-[10px] opacity-60 mt-0.5">{tmpl.trigger_event}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl md:col-span-8 bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-[11px] text-[var(--text-main,#FFFFFF)] block mb-1">{t('comm.tmpl_name', 'اسم القالب الداخلي:')}</label>
                        <Input
                          type="text"
                          placeholder={t('comm.tmpl_name_ph', 'مثال: تقرير التسميع اليومي')}
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          className="w-full text-xs bg-[var(--surface-input,#0A101D)] border-[var(--border-input,#1B2738)] text-[var(--text-main,#FFFFFF)] placeholder:text-[var(--text-sub,#94A3B8)]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[var(--text-main,#FFFFFF)] block mb-1">{t('comm.tmpl_title', 'عنوان الرسالة الظاهر:')}</label>
                        <Input
                          type="text"
                          placeholder={t('comm.tmpl_title_ph', 'مثال: إنجاز الطالب اليومي في الحلقة')}
                          value={templateTitle}
                          onChange={(e) => setTemplateTitle(e.target.value)}
                          className="w-full text-xs bg-[var(--surface-input,#0A101D)] border-[var(--border-input,#1B2738)] text-[var(--text-main,#FFFFFF)] placeholder:text-[var(--text-sub,#94A3B8)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-[11px] text-[var(--text-main,#FFFFFF)] block mb-1">{t('comm.event_trigger', 'حدث التفعيل الآلي:')}</label>
                        <CustomSelect
                          options={triggerEventOptions}
                          value={templateEvent}
                          onChange={setTemplateEvent}
                          placeholder={t('comm.select_event', 'اختر الحدث')}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[var(--text-main,#FFFFFF)] block mb-1 flex items-center gap-1">
                          <Globe2 size={12} className="text-[var(--primary,#E07A00)]" />
                          <span>{t('comm.msg_lang', 'لغة الرسالة:')}</span>
                        </label>
                        <CustomSelect
                          options={languageOptions}
                          value={templateLang}
                          onChange={setTemplateLang}
                          placeholder={t('comm.select_lang', 'اختر اللغة')}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-[11px] text-[var(--text-main,#FFFFFF)] block mb-1">{t('comm.vars', 'إدراج متغيرات الحلقة القرآنية الآلية:')}</label>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {(AVAILABLE_VARIABLES || []).map((v, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setTemplateBody(prev => prev + ' ' + v.code)}
                            className="shrink-0 px-2.5 py-1 bg-[var(--surface-input,#0A101D)] hover:bg-[var(--primary,#E07A00)]/10 border border-[var(--border-input,#1B2738)] rounded-lg text-[10px] text-[var(--primary,#E07A00)] font-mono transition-colors"
                          >
                            + {isRtl ? v.labelAr : v.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <textarea
                        rows={5}
                        placeholder={t('comm.tmpl_body_ph', 'نص القالب مع المتغيرات مثل {student_name} و {new_memorization}...')}
                        value={templateBody}
                        onChange={(e) => setTemplateBody(e.target.value)}
                        className="w-full p-3 bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-xl text-xs text-[var(--text-main,#FFFFFF)] focus:outline-none focus:border-[var(--primary,#E07A00)] resize-none leading-relaxed placeholder:text-[var(--text-sub,#94A3B8)]"
                      />
                    </div>

                    <Btn
                      variant="primary"
                      onClick={handleSaveTemplate}
                      disabled={savingTemplate || !templateName.trim() || !templateBody.trim()}
                      className="w-full py-2 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 bg-[var(--primary,#E07A00)] text-[var(--text-main,#FFFFFF)] shadow-[0_0_15px_rgba(224,122,0,0.3)] hover:opacity-90 disabled:opacity-50"
                    >
                      {savingTemplate ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>{t('comm.save_tmpl', 'حفظ قالب الرسالة')}</span>
                    </Btn>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 xl:col-span-4 flex justify-center">
              <LivePreview 
                isRtl={isRtl}
                title={broadcastTitle}
                templateTitle={templateTitle}
                currentAcademyDisplayName={currentAcademyDisplayName}
                previewText={previewText}
              />
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-4 rounded-2xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-[var(--text-main,#FFFFFF)] flex items-center gap-2">
                <History size={15} className="text-[var(--primary,#E07A00)]" />
                <span>{t('comm.logs_title', 'سجل مراسلات وإشعار الحلقات')}</span>
              </h2>
              <button
                onClick={fetchLogs}
                className="p-1.5 text-[var(--text-sub,#94A3B8)] hover:text-[var(--text-main,#FFFFFF)] hover:bg-[var(--surface-input,#0A101D)] rounded-lg text-xs flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} />
                <span>{t('comm.refresh', 'تحديث')}</span>
              </button>
            </div>

            {loadingLogs ? (
              <div className="py-12 text-center text-[var(--primary,#E07A00)]">
                <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                <span className="text-xs text-[var(--text-sub,#94A3B8)]">{t('comm.fetching_logs', 'جاري تحميل السجلات...')}</span>
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-[var(--text-sub,#94A3B8)] text-center py-8">{t('comm.no_logs', 'لا توجد سجلات إرسال في الوقت الحالي')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs text-[var(--text-main,#FFFFFF)]">
                  <thead>
                    <tr className="border-b border-[var(--border-card,rgba(255,255,255,0.08))] text-[var(--text-sub,#94A3B8)] text-[11px]">
                      <th className="p-2.5">{t('comm.col_channel', 'القناة')}</th>
                      <th className="p-2.5">{t('comm.col_status', 'الحالة')}</th>
                      <th className="p-2.5">{t('comm.col_text', 'نص الرسالة')}</th>
                      <th className="p-2.5">{t('comm.col_date', 'تاريخ الإرسال')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-card,rgba(255,255,255,0.08))]">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-[var(--surface-input,#0A101D)]/50 transition-colors">
                        <td className="p-2.5 font-mono text-[var(--emerald-text,#10B981)] uppercase text-[10px]">{log.channel_used}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'delivered' || log.status === 'sent'
                              ? 'bg-[var(--emerald-text,#10B981)]/10 text-[var(--emerald-text,#10B981)] border border-[var(--emerald-text,#10B981)]/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-2.5 max-w-xs truncate text-[var(--text-sub,#94A3B8)]">{log.sent_text}</td>
                        <td className="p-2.5 text-[var(--text-sub,#94A3B8)] text-[10px]">
                          {new Date(log.created_at).toLocaleString(currentLang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
