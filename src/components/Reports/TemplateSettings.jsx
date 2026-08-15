import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wand2, Eye, BookmarkPlus, Trash2, Sparkles, 
  Smile, Search 
} from 'lucide-react';

// استيراد المكونات القياسية ونظام الألوان الموحد للمشروع
import { C } from '@/theme/colors';
import { Card, Btn, Input } from '@/components/UI/UI';
import { getParsedMessage } from '@/utils/ReportHelpers';

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
    <Card style={{ 
      background: C.card, 
      borderColor: C.border, 
      borderRadius: '12px', 
      marginBottom: '16px', 
      overflow: 'hidden',
      padding: 0
    }}>
      {/* التنبيهات المنبثقة (Toast) */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: C.warning,
          color: '#000000',
          fontWeight: 'bold',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 9999
        }}>
          {toastMessage}
        </div>
      )}

      {/* الشريط العلوي للمكون */}
      <div style={{ 
        padding: '12px 16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottom: `1px solid ${C.border}`,
        background: C.bg
      }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'transparent', 
            border: 'none', 
            color: C.text, 
            cursor: 'pointer' 
          }}
        >
          <Wand2 style={{ width: '16px', height: '16px', color: C.emerald }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>
            {t('reports.template.title', { defaultValue: isArabic ? "محرر القوالب الذكي" : "Smart Template Editor" })}
          </span>
          <span style={{ 
            fontSize: '0.65rem', 
            background: C.card, 
            color: C.textSub, 
            padding: '2px 8px', 
            borderRadius: '12px', 
            border: `1px solid ${C.border}` 
          }}>
            {isExpanded 
              ? t('common.close', { defaultValue: isArabic ? 'إغلاق' : 'Close' }) 
              : t('common.edit', { defaultValue: isArabic ? 'تعديل' : 'Edit' })}
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* زر المعاينة */}
          <Btn
            variant={showPreview ? 'primary' : 'outline'}
            onClick={() => setShowPreview(!showPreview)}
            style={{ 
              padding: '4px 10px', 
              fontSize: '0.72rem',
              background: showPreview ? `${C.emerald}20` : C.card,
              color: showPreview ? C.emerald : C.textSub,
              borderColor: showPreview ? C.emerald : C.border
            }}
          >
            <Eye style={{ width: '14px', height: '14px' }} />
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
            style={{ 
              padding: '4px 8px', 
              background: `${C.warning}15`, 
              color: C.warning, 
              borderColor: `${C.warning}30` 
            }}
          >
            <BookmarkPlus style={{ width: '14px', height: '14px' }} />
          </Btn>
        </div>
      </div>

      {/* المحتوى الفرعي عند الفتح */}
      {isExpanded && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* شريط القوالب المحفوظة */}
          {customTemplates.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: C.textSub, whiteSpace: 'nowrap' }}>
                {t('reports.template.saved_label', { defaultValue: isArabic ? 'القوالب المحفوظة:' : 'Saved:' })}
              </span>
              {customTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setTemplateText(tmpl.text)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '4px 10px', 
                    background: C.bg, 
                    border: `1px solid ${C.border}`, 
                    borderRadius: '8px', 
                    fontSize: '0.72rem', 
                    color: C.text, 
                    cursor: 'pointer', 
                    whiteSpace: 'nowrap' 
                  }}
                >
                  <span>{tmpl.name}</span>
                  <button
                    onClick={(e) => handleDeleteCustomTemplate(tmpl.id, e)}
                    style={{ background: 'transparent', border: 'none', color: C.textSub, cursor: 'pointer', padding: 0 }}
                  >
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* مساحة التحرير أو المعاينة */}
          {showPreview ? (
            <div style={{ 
              background: C.bg, 
              border: `1px solid ${C.border}`, 
              borderRadius: '10px', 
              padding: '14px', 
              fontSize: '0.78rem', 
              color: C.text, 
              minHeight: '110px', 
              whiteSpace: 'pre-wrap', 
              lineHeight: '1.6' 
            }}>
              <div style={{ 
                fontSize: '0.7rem', 
                color: C.emerald, 
                fontWeight: 'bold', 
                marginBottom: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                borderBottom: `1px solid ${C.border}`, 
                paddingBottom: '4px' 
              }}>
                <Sparkles style={{ width: '12px', height: '12px' }} />
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
              style={{ 
                width: '100%', 
                background: C.bg, 
                border: `1px solid ${C.border}`, 
                borderRadius: '10px', 
                padding: '12px', 
                fontSize: '0.78rem', 
                color: C.text, 
                outline: 'none', 
                resize: 'none', 
                lineHeight: '1.6' 
              }}
            />
          )}

          {/* شريط الرموز التعبيرية */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
            <Smile style={{ width: '14px', height: '14px', color: C.textSub, shrink: 0 }} />
            {emojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => insertAtCursor(emoji)}
                style={{ 
                  padding: '4px 8px', 
                  background: C.bg, 
                  border: `1px solid ${C.border}`, 
                  borderRadius: '6px', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer' 
                }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* فلترة ومتغيرات القالب */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { id: 'all', label: t('reports.template.cat_all', { defaultValue: isArabic ? 'الكل' : 'All' }) },
                { id: 'basic', label: t('reports.template.cat_basic', { defaultValue: isArabic ? 'أساسي' : 'Basic' }) },
                { id: 'academy', label: t('reports.template.cat_academy', { defaultValue: isArabic ? 'أكاديمي' : 'Academy' }) },
                { id: 'attendance', label: t('reports.template.cat_attendance', { defaultValue: isArabic ? 'حضور' : 'Attendance' }) },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    background: activeTab === tab.id ? `${C.emerald}20` : C.bg,
                    color: activeTab === tab.id ? C.emerald : C.textSub,
                    border: `1px solid ${activeTab === tab.id ? `${C.emerald}40` : C.border}`
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {filteredVariables.map((v) => (
                <button
                  key={v.tag}
                  onClick={() => insertAtCursor(v.tag)}
                  style={{ 
                    padding: '4px 8px', 
                    background: `${C.emerald}10`, 
                    color: C.emerald, 
                    border: `1px solid ${C.emerald}30`, 
                    borderRadius: '6px', 
                    fontSize: '0.72rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px' 
                  }}
                >
                  <span>+</span>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
