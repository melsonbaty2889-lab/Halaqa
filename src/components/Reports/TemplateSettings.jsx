import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Eye, Code, Check, Copy, Search, BookmarkPlus, Smile, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { REPORT_TEMPLATES, AVAILABLE_VARIABLES } from '../../data/reportTemplates';

const QUICK_EMOJIS = ['✨', '⭐', '🌟', '📖', '🔄', '🎯', '✅', '⚠️', '🌸', '👏', '🤲', '🌿'];

export default function TemplateSettings({ 
  templateText = '', 
  setTemplateText, 
  sampleStudent = null, 
  sampleRecord = null, 
  formattedDate = '' 
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang.startsWith('ar');
  
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  // تحميل القوالب المخصصة المحفوظة محلياً
  useEffect(() => {
    const saved = localStorage.getItem('custom_report_templates');
    if (saved) {
      try { setCustomTemplates(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  // إدراج نص (متغير أو إيموجي) في موضع المؤشر
  const insertTextAtCursor = (textToInsert, isVariable = false) => {
    if (!textToInsert) return;
    const safeText = templateText || '';

    if (isVariable && safeText.includes(textToInsert)) return;

    if (!textareaRef.current) {
      setTemplateText(`${safeText} ${textToInsert}`);
      return;
    }

    const { selectionStart = safeText.length, selectionEnd = safeText.length } = textareaRef.current;
    const newText = safeText.substring(0, selectionStart) + ` ${textToInsert} ` + safeText.substring(selectionEnd);

    setTemplateText(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPosition = selectionStart + textToInsert.length + 2;
        textareaRef.current.setSelectionRange(nextPosition, nextPosition);
      }
    }, 0);
  };

  // حفظ قالب جديد خاص بالمعلم
  const handleSaveCustomTemplate = () => {
    if (!templateText.trim()) return;
    const newTmpl = {
      id: `custom_${Date.now()}`,
      nameAr: `قالب مخصص ${customTemplates.length + 1}`,
      nameEn: `Custom ${customTemplates.length + 1}`,
      textAr: templateText,
      textEn: templateText,
      isCustom: true
    };
    const updated = [...customTemplates, newTmpl];
    setCustomTemplates(updated);
    localStorage.setItem('custom_report_templates', JSON.stringify(updated));
  };

  const handleDeleteCustomTemplate = (id, e) => {
    e.stopPropagation();
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('custom_report_templates', JSON.stringify(updated));
  };

  // استبدال الوسوم العامة بالحقول الحقيقية
  const getPreviewText = () => {
    let safeText = templateText || '';
    const dateStr = formattedDate || new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US');

    const replaceMap = {
      '{{student_name}}': sampleStudent?.name || (isRtl ? 'أحمد محمد' : 'Ahmed Mohamed'),
      '{{date}}': dateStr,
      '{{status}}': sampleRecord?.status || (isRtl ? 'حاضر ✅' : 'Present ✅'),
      '{{memorization}}': sampleRecord?.memorization || (isRtl ? 'سورة النبأ (1-15)' : 'Surah An-Naba (1-15)'),
      '{{review}}': sampleRecord?.review || (isRtl ? 'جزء عم' : 'Juz Amma'),
      '{{rating}}': sampleRecord?.rating || (isRtl ? 'ممتاز ⭐⭐⭐' : 'Excellent ⭐⭐⭐'),
      '{{test_name}}': sampleRecord?.testName || (isRtl ? 'اختبار جزء عم' : 'Juz Amma Exam'),
      '{{score}}': sampleRecord?.score || '95/100',
      '{{notes}}': sampleRecord?.notes || (isRtl ? 'أداء ممتاز ومواظب' : 'Outstanding performance')
    };

    Object.keys(replaceMap).forEach((key) => {
      const regex = new RegExp(key.replace(/[{()}]/g, '\\$&'), 'g');
      safeText = safeText.replace(regex, replaceMap[key]);
    });

    return safeText;
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(getPreviewText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // تصفية المتغيرات حسب البحث والتبويب
  const filteredVariables = AVAILABLE_VARIABLES.filter(v => {
    const label = isRtl ? v.labelAr : v.labelEn;
    const matchesSearch = label.toLowerCase().includes(searchQuery.toLowerCase()) || v.key.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const allTemplates = [...REPORT_TEMPLATES, ...customTemplates];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 shadow-xl text-slate-100">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" />
          <span>{isRtl ? 'محرر القوالب الذكي' : 'Smart Template Engine'}</span>
        </div>

        <div className="flex items-center gap-2">
          {!showPreview && (
            <button
              type="button"
              onClick={handleSaveCustomTemplate}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition-all"
              title={isRtl ? 'حفظ كقالب مخصص' : 'Save Custom Template'}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRtl ? 'حفظ قالب' : 'Save'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
              showPreview
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {showPreview ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPreview ? (isRtl ? 'المحرر' : 'Editor') : (isRtl ? 'معاينة الرسالة' : 'Preview')}</span>
          </button>
        </div>
      </div>

      {/* Templates Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none snap-x">
        {allTemplates.map((tmpl) => (
          <div key={tmpl.id} className="relative group snap-start flex-shrink-0">
            <button
              type="button"
              onClick={() => setTemplateText(isRtl ? (tmpl.textAr || tmpl.text) : (tmpl.textEn || tmpl.text))}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center gap-1.5"
            >
              <span>{isRtl ? tmpl.nameAr : tmpl.nameEn}</span>
              {tmpl.isCustom && (
                <Trash2 
                  className="w-3 h-3 text-rose-400 hover:text-rose-300 ml-1" 
                  onClick={(e) => handleDeleteCustomTemplate(tmpl.id, e)}
                />
              )}
            </button>
          </div>
        ))}
      </div>

      {!showPreview ? (
        <>
          {/* Main Editor */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={templateText || ''}
              onChange={(e) => setTemplateText(e.target.value)}
              rows={4}
              dir="auto"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs leading-relaxed text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all resize-y"
              placeholder={isRtl ? 'صمم نص القالب هنا واستخدم المتغيرات...' : 'Design template text using variables...'}
            />

            {/* Quick Emoji Bar Trigger */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute left-2.5 bottom-3 text-slate-400 hover:text-amber-400 p-1 rounded-md bg-slate-900/80 border border-slate-800 transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Emojis Drawer */}
          {showEmojiPicker && (
            <div className="flex flex-wrap gap-1.5 p-2 mt-2 bg-slate-950/80 border border-slate-800 rounded-lg animate-fadeIn">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertTextAtCursor(emoji, false)}
                  className="w-7 h-7 flex items-center justify-center text-sm rounded bg-slate-800 hover:bg-slate-700 active:scale-90 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Variables Filter & Search Bar */}
          <div className="mt-3 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1 overflow-x-auto text-[11px] scrollbar-none">
                {['all', 'basic', 'academic', 'attendance', 'communication'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'all' ? (isRtl ? 'الكل' : 'All') : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-28 sm:w-36">
                <Search className="w-3 h-3 absolute right-2 top-2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'بحث...' : 'Search...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md pr-6 pl-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            {/* Dynamic Variables Buttons */}
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
              {filteredVariables.map((v) => {
                const varLabel = isRtl ? v.labelAr : v.labelEn;
                const isUsed = (templateText || '').includes(v.key);

                return (
                  <button
                    key={v.key}
                    type="button"
                    disabled={isUsed}
                    onClick={() => insertTextAtCursor(v.key, true)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                      isUsed
                        ? 'bg-slate-800/40 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-60'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 active:scale-95'
                    }`}
                  >
                    {isUsed ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="text-xs">+</span>}
                    <span>{varLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* WhatsApp Real Preview */
        <div className="bg-[#0b141a] rounded-lg p-3 border border-slate-800 relative">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] text-slate-400 font-mono">WhatsApp Web Client Preview</span>
            <button
              onClick={handleCopyPreview}
              className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-emerald-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ النص' : 'Copy')}</span>
            </button>
          </div>

          <div
            dir="auto"
            className="bg-[#005c4b] text-[#e9edef] rounded-lg p-3 max-w-[88%] text-xs leading-relaxed whitespace-pre-wrap shadow-md border border-[#004d3e] relative"
          >
            {getPreviewText()}
            <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200/60 mt-1">
              <span>{new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              <span className="text-sky-300 font-bold">✓✓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
