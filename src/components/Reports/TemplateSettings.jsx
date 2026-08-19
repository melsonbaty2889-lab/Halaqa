import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wand2, Eye, BookmarkPlus, Trash2, Sparkles, 
  Smile, Search
} from 'lucide-react';

import { Card, Btn } from '@/components/UI/UI';
import { getParsedMessage } from './ReportHelpers';

export default function TemplateSettings({ 
  templateText = '', 
  setTemplateText, 
  formattedDate = '', 
  sampleStudent = null, 
  sampleRecord = null 
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isArabic = currentLang.startsWith('ar');

  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [customTemplates, setCustomTemplates] = useState([]);

  // تحميل القوالب المحفوظة من LocalStorage عند البدء
  useEffect(() => {
    try {
      const saved = localStorage.getItem('custom_halaqa_templates');
      if (saved) {
        setCustomTemplates(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load saved templates:', e);
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // حفظ القالب مع المطالبة بإدخال اسم مخصص
  const handleSaveCustomTemplate = () => {
    if (!templateText || !templateText.trim()) return;

    const defaultName = isArabic 
      ? `قالب ${customTemplates.length + 1}` 
      : `Template ${customTemplates.length + 1}`;

    const customName = window.prompt(
      t('reports.template.prompt_name', { defaultValue: isArabic ? "أدخل اسماً للقالب الجديد:" : "Enter template name:" }),
      defaultName
    );

    if (!customName || !customName.trim()) return;

    const newTemplate = {
      id: Date.now().toString(),
      name: customName.trim(),
      text: templateText
    };

    const updatedTemplates = [...customTemplates, newTemplate];
    setCustomTemplates(updatedTemplates);

    try {
      localStorage.setItem('custom_halaqa_templates', JSON.stringify(updatedTemplates));
      showToast(t('reports.template.saved_success', { defaultValue: isArabic ? "تم حفظ القالب بنجاح" : "Template saved successfully" }));
    } catch (err) {
      console.error('Error saving templates:', err);
    }
  };

  // حذف قالب مخصص
  const handleDeleteCustomTemplate = (id, e) => {
    e.stopPropagation();
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    try {
      localStorage.setItem('custom_halaqa_templates', JSON.stringify(updated));
      showToast(t('reports.template.deleted_success', { defaultValue: isArabic ? "تم حذف القالب" : "Template deleted" }));
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  // إدراج نص/رمز/متغير في موقع المؤشر
  const insertAtCursor = (textToInsert) => {
    const textarea = document.getElementById('template-textarea');
    if (!textarea) {
      setTemplateText(prev => prev + ' ' + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = templateText || '';

    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
    setTemplateText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // قائمة الرموز التعبيرية
  const emojis = ['🌸', '⚠️', '✅', '🎯', '🔄', '📖', '🌟', '⭐', '✨', '🌿', '🤲', '👏'];

  // متغيرات القالب التقسيمية
  const variablesList = [
    { tag: '{اسم_الطالب}', label: t('reports.template.var_student_name', { defaultValue: isArabic ? 'اسم الطالب' : 'Student Name' }), category: 'basic' },
    { tag: '{التاريخ}', label: t('reports.template.var_date', { defaultValue: isArabic ? 'التاريخ' : 'Date' }), category: 'basic' },
    { tag: '{حالة_الحضور}', label: t('reports.template.var_attendance', { defaultValue: isArabic ? 'حالة الحضور' : 'Attendance Status' }), category: 'attendance' },
    { tag: '{الحفظ}', label: t('reports.template.var_memorization', { defaultValue: isArabic ? 'الحفظ' : 'Memorization' }), category: 'academy' },
    { tag: '{المراجعة}', label: t('reports.template.var_revision', { defaultValue: isArabic ? 'المراجعة' : 'Revision' }), category: 'academy' },
    { tag: '{التقييم}', label: t('reports.template.var_grade', { defaultValue: isArabic ? 'التقييم' : 'Evaluation' }), category: 'academy' },
    { tag: '{اسم_الاختبار}', label: t('reports.template.var_exam', { defaultValue: isArabic ? 'اسم الاختبار' : 'Exam Name' }), category: 'academy' },
    { tag: '{الدرجة}', label: t('reports.template.var_score', { defaultValue: isArabic ? 'الدرجة' : 'Score' }), category: 'academy' },
    { tag: '{الملاحظات}', label: t('reports.template.var_notes', { defaultValue: isArabic ? 'الملاحظات' : 'Notes' }), category: 'academy' },
  ];

  const filteredVariables = variablesList.filter(v => {
    const matchesTab = activeTab === 'all' || v.category === activeTab;
    const matchesSearch = !searchTerm || v.label.toLowerCase().includes(searchTerm.toLowerCase()) || v.tag.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  // توليد نص المعاينة
  const previewMessage = getParsedMessage({
    student: sampleStudent,
    record: sampleRecord,
    template: templateText,
    formattedDate: formattedDate,
    locale: currentLang
  });

  return (
    <Card className="w-full bg-slate-900 border border-slate-800 rounded-xl mb-4 overflow-hidden transition-all shadow-lg p-0">
      {/* التنبيهات المنبثقة (Toast) */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-xl z-[9999] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* الشريط العلوي للمكون */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-800 bg-slate-950/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors focus:outline-none bg-transparent border-none cursor-pointer"
        >
          <Wand2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">
            {t('reports.template.title', { defaultValue: isArabic ? "محرر القوالب الذكي" : "Smart Template Editor" })}
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
            {isExpanded 
              ? t('common.close', { defaultValue: isArabic ? 'إغلاق' : 'Close' }) 
              : t('common.edit', { defaultValue: isArabic ? 'تعديل' : 'Edit' })}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* زر المعاينة */}
          <Btn
            variant={showPreview ? 'primary' : 'outline'}
            onClick={() => setShowPreview(!showPreview)}
            className={`px-2.5 py-1 text-xs font-semibold ${
              showPreview 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>
              {showPreview 
                ? t('reports.template.editor', { defaultValue: isArabic ? 'المحرر' : 'Editor' }) 
                : t('reports.template.preview', { defaultValue: isArabic ? 'معاينة' : 'Preview' })}
            </span>
          </Btn>

          {/* زر الحفظ باسم مخصص */}
          <Btn
            variant="outline"
            onClick={handleSaveCustomTemplate}
            title={t('reports.template.save_custom', { defaultValue: isArabic ? "حفظ القالب باسم مخصص" : "Save custom template" })}
            className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold hover:bg-amber-500/20"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
          </Btn>
        </div>
      </div>

      {/* المحتوى الفرعي عند الفتح */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3.5">
          {/* شريط القوالب المحفوظة */}
          {customTemplates.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                {t('reports.template.saved_label', { defaultValue: isArabic ? 'القوالب المحفوظة:' : 'Saved:' })}
              </span>
              {customTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setTemplateText(tmpl.text)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs cursor-pointer whitespace-nowrap transition-all"
                >
                  <span>{tmpl.name}</span>
                  <button
                    onClick={(e) => handleDeleteCustomTemplate(tmpl.id, e)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-0.5 bg-transparent border-none cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* مساحة التحرير أو المعاينة */}
          {showPreview ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 min-h-[120px] whitespace-pre-wrap leading-relaxed">
              <div className="text-[10px] text-emerald-400 font-bold mb-2 flex items-center gap-1 border-b border-slate-800 pb-1">
                <Sparkles className="w-3 h-3" />
                <span>{t('reports.template.preview_label', { defaultValue: isArabic ? 'معاينة شكل الرسالة:' : 'Message Preview:' })}</span>
              </div>
              {previewMessage || t('reports.template.preview_placeholder', { defaultValue: isArabic ? 'اكتب نصاً في القالب للمعاينة...' : 'Type template text to preview...' })}
            </div>
          ) : (
            <textarea
              id="template-textarea"
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              rows={4}
              dir={isArabic ? 'rtl' : 'ltr'}
              placeholder={t('reports.template.placeholder', { defaultValue: isArabic ? "اكتب قالب الرسالة هنا..." : "Write template here..." })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none leading-relaxed"
            />
          )}

          {/* شريط الرموز التعبيرية */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <Smile className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
            {emojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => insertAtCursor(emoji)}
                className="px-2 py-1 bg-slate-800/60 hover:bg-slate-700 text-sm rounded-lg border border-slate-700/50 transition-all shrink-0 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* فلترة ومتغيرات القالب */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              {/* تبويبات الفئات */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: t('reports.template.cat_all', { defaultValue: isArabic ? 'الكل' : 'All' }) },
                  { id: 'basic', label: t('reports.template.cat_basic', { defaultValue: isArabic ? 'أساسي' : 'Basic' }) },
                  { id: 'academy', label: t('reports.template.cat_academy', { defaultValue: isArabic ? 'أكاديمي' : 'Academy' }) },
                  { id: 'attendance', label: t('reports.template.cat_attendance', { defaultValue: isArabic ? 'حضور' : 'Attendance' }) },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* مربع بحث المتغيرات */}
              <div className="relative flex-1 sm:max-w-[160px]">
                <Search className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('reports.template.search_var', { defaultValue: isArabic ? 'بحث عن متغير...' : 'Search tag...' })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-7 pl-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* أزرار المتغيرات */}
            <div className="flex flex-wrap gap-1.5">
              {filteredVariables.map((v) => (
                <button
                  key={v.tag}
                  onClick={() => insertAtCursor(v.tag)}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>+</span>
                  <span>{v.label}</span>
                </button>
              ))}

              {filteredVariables.length === 0 && (
                <span className="text-[11px] text-slate-500 py-1">
                  {t('reports.template.no_vars_found', { defaultValue: isArabic ? 'لا توجد نتائج طابقت البحث' : 'No matching tags' })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
