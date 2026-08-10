import React, { useState, useEffect } from 'react';
import { 
  Wand2, Eye, BookmarkPlus, Trash2, Check, Sparkles, 
  MessageSquare, User, Calendar, Award, BookOpen, AlertCircle, FileText, Smile
} from 'lucide-react';
import { getParsedMessage } from './ReportHelpers';

export default function TemplateSettings({ 
  templateText = '', 
  setTemplateText, 
  formattedDate = '', 
  sampleStudent = null, 
  sampleRecord = null,
  isRtl = true 
}) {
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

    const customName = window.prompt(
      isRtl ? "أدخل اسماً للقالب الجديد:" : "Enter template name:",
      `قالب ${customTemplates.length + 1}`
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
      showToast(isRtl ? "تم حفظ القالب بنجاح" : "Template saved successfully");
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
      showToast(isRtl ? "تم حذف القالب" : "Template deleted");
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

  // الرموز التعبيرية القديمة
  const emojis = ['🌸', '⚠️', '✅', '🎯', '🔄', '📖', '🌟', '⭐', '✨', '🌿', '🤲', '👏'];

  // متغيرات القالب التقسيمية القديمة
  const variablesList = [
    { tag: '{اسم_الطالب}', label: isRtl ? 'اسم الطالب' : 'Student Name', category: 'basic' },
    { tag: '{التاريخ}', label: isRtl ? 'التاريخ' : 'Date', category: 'basic' },
    { tag: '{حالة_الحضور}', label: isRtl ? 'حالة الحضور' : 'Attendance Status', category: 'attendance' },
    { tag: '{الحفظ}', label: isRtl ? 'الحفظ' : 'Memorization', category: 'academy' },
    { tag: '{المراجعة}', label: isRtl ? 'المراجعة' : 'Revision', category: 'academy' },
    { tag: '{التقييم}', label: isRtl ? 'التقييم' : 'Evaluation', category: 'academy' },
    { tag: '{اسم_الاختبار}', label: isRtl ? 'اسم الاختبار' : 'Exam Name', category: 'academy' },
    { tag: '{الدرجة}', label: isRtl ? 'الدرجة' : 'Score', category: 'academy' },
    { tag: '{الملاحظات}', label: isRtl ? 'الملاحظات' : 'Notes', category: 'academy' },
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
    isRtl: isRtl
  });

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl mb-4 overflow-hidden transition-all shadow-lg">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-xl z-[9999] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* الشريط العلوي للمكون */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors focus:outline-none"
        >
          <Wand2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{isRtl ? "محرر القوالب الذكي" : "Smart Template Editor"}</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/50">
            {isExpanded ? (isRtl ? 'إغلاق' : 'Close') : (isRtl ? 'تعديل' : 'Edit')}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* زر المعاينة */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              showPreview 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showPreview ? (isRtl ? 'المحرر' : 'Editor') : (isRtl ? 'معاينة' : 'Preview')}</span>
          </button>

          {/* زر الحفظ باسم مخصص */}
          <button
            onClick={handleSaveCustomTemplate}
            title={isRtl ? "حفظ القالب باسم مخصص" : "Save custom template"}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold hover:bg-amber-500/20 transition-all"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* المحتوى الفرعي عند الفتح */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3.5">
          {/* شريط القوالب المحفوظة */}
          {customTemplates.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">{isRtl ? 'القوالب المحفوظة:' : 'Saved:'}</span>
              {customTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setTemplateText(tmpl.text)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-lg text-xs cursor-pointer whitespace-nowrap transition-all group"
                >
                  <span>{tmpl.name}</span>
                  <button
                    onClick={(e) => handleDeleteCustomTemplate(tmpl.id, e)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
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
              <div className="text-[10px] text-emerald-400 font-bold mb-2 flex items-center gap-1 border-b border-slate-800/80 pb-1">
                <Sparkles className="w-3 h-3" />
                <span>{isRtl ? 'معاينة شكل الرسالة:' : 'Message Preview:'}</span>
              </div>
              {previewMessage || (isRtl ? 'اكتب نصاً في القالب للمعاينة...' : 'Type template text to preview...')}
            </div>
          ) : (
            <div className="relative">
              <textarea
                id="template-textarea"
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                rows={4}
                dir={isRtl ? 'rtl' : 'ltr'}
                placeholder={isRtl ? "اكتب قالب الرسالة هنا..." : "Write template here..."}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none leading-relaxed"
              />
            </div>
          )}

          {/* شريط الرموز التعبيرية القديم */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <Smile className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
            {emojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => insertAtCursor(emoji)}
                className="px-2 py-1 bg-slate-800/60 hover:bg-slate-700 text-sm rounded-lg border border-slate-700/50 transition-all shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* فلترة ومتغيرات القالب */}
          <div className="space-y-2 pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: isRtl ? 'الكل' : 'All' },
                { id: 'basic', label: isRtl ? 'أساسي' : 'Basic' },
                { id: 'academy', label: isRtl ? 'أكاديمي' : 'Academy' },
                { id: 'attendance', label: isRtl ? 'حضور' : 'Attendance' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {filteredVariables.map((v) => (
                <button
                  key={v.tag}
                  onClick={() => insertAtCursor(v.tag)}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-mono transition-all flex items-center gap-1"
                >
                  <span>+</span>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
