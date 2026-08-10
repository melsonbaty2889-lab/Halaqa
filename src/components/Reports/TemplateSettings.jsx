import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Eye, Code, Check, Copy, Search, BookmarkPlus, Smile, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { REPORT_TEMPLATES, AVAILABLE_VARIABLES } from '../../data/reportTemplates';
import { getParsedMessage } from '../../utils/ReportHelpers';

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
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('custom_report_templates');
    if (saved) {
      try { setCustomTemplates(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

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

  const getPreviewText = () => {
    return getParsedMessage({
      student: sampleStudent,
      record: sampleRecord,
      template: templateText,
      formattedDate,
      isRtl
    });
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(getPreviewText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredVariables = AVAILABLE_VARIABLES.filter(v => {
    const label = isRtl ? v.labelAr : v.labelEn;
    return label.toLowerCase().includes(searchQuery.toLowerCase()) || v.key.includes(searchQuery);
  });

  const allTemplates = [...REPORT_TEMPLATES, ...customTemplates];

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl mb-3 shadow-md text-slate-100 backdrop-blur-sm transition-all">
      
      {/* Header Compact Mode */}
      <div className="p-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-emerald-400 font-semibold text-xs sm:text-sm hover:text-emerald-300 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{isRtl ? 'محرر القوالب الذكي' : 'Smart Template Engine'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <div className="flex items-center gap-1.5">
          {isExpanded && !showPreview && (
            <button
              type="button"
              onClick={handleSaveCustomTemplate}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 transition-all"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRtl ? 'حفظ' : 'Save'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              setShowPreview(!showPreview);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border ${
              showPreview
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {showPreview ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPreview ? (isRtl ? 'المحرر' : 'Editor') : (isRtl ? 'معاينة' : 'Preview')}</span>
          </button>
        </div>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 animate-fadeIn">
          
          {/* Templates Horizontal List */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2.5 scrollbar-none snap-x">
            {allTemplates.map((tmpl) => (
              <div key={tmpl.id} className="snap-start flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setTemplateText(isRtl ? (tmpl.textAr || tmpl.text) : (tmpl.textEn || tmpl.text))}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all flex items-center gap-1"
                >
                  <span>{isRtl ? tmpl.nameAr : tmpl.nameEn}</span>
                  {tmpl.isCustom && (
                    <Trash2 
                      className="w-3 h-3 text-rose-400 hover:text-rose-300 mr-0.5" 
                      onClick={(e) => handleDeleteCustomTemplate(tmpl.id, e)}
                    />
                  )}
                </button>
              </div>
            ))}
          </div>

          {!showPreview ? (
            <>
              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={templateText || ''}
                  onChange={(e) => setTemplateText(e.target.value)}
                  rows={3}
                  dir="auto"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs leading-relaxed text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all resize-y"
                  placeholder={isRtl ? 'صمم نص القالب هنا واستخدم المتغيرات...' : 'Design template text using variables...'}
                />

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute left-2 bottom-2 text-slate-400 hover:text-amber-400 p-1 rounded bg-slate-900 border border-slate-800 transition-colors"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Emoji Drawer */}
              {showEmojiPicker && (
                <div className="flex flex-wrap gap-1 p-2 mt-1.5 bg-slate-950/90 border border-slate-800 rounded-md">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertTextAtCursor(emoji, false)}
                      className="w-6 h-6 flex items-center justify-center text-xs rounded hover:bg-slate-800 active:scale-90 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Variables Header & Search Bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/50">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {isRtl ? 'المتغيرات المتاحة:' : 'Available Variables:'}
                  </span>

                  <div className="relative w-28 sm:w-36">
                    <Search className="w-3 h-3 absolute right-2 top-1.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isRtl ? 'بحث...' : 'Search...'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md pr-6 pl-1.5 py-0.5 text-[10px] text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Variables Buttons */}
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto scrollbar-thin">
                  {filteredVariables.map((v) => {
                    const varLabel = isRtl ? v.labelAr : v.labelEn;
                    const isUsed = (templateText || '').includes(v.key);

                    return (
                      <button
                        key={v.key}
                        type="button"
                        disabled={isUsed}
                        onClick={() => insertTextAtCursor(v.key, true)}
                        className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                          isUsed
                            ? 'bg-slate-800/30 text-slate-600 border border-transparent cursor-not-allowed'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 active:scale-95'
                        }`}
                      >
                        {isUsed ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <span className="text-[10px]">+</span>}
                        <span>{varLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* WhatsApp Preview Card */
            <div className="bg-[#0b141a] rounded-lg p-2.5 border border-slate-800 relative mt-1">
              <div className="flex justify-between items-center mb-1.5 px-1">
                <span className="text-[9px] text-slate-400 font-mono">WhatsApp Web Preview</span>
                <button
                  onClick={handleCopyPreview}
                  className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>

              <div
                dir="auto"
                className="bg-[#005c4b] text-[#e9edef] rounded-lg p-2.5 max-w-[90%] text-[11px] leading-relaxed whitespace-pre-wrap shadow-md border border-[#004d3e]"
              >
                {getPreviewText()}
                <div className="flex items-center justify-end gap-1 text-[8px] text-emerald-200/60 mt-1">
                  <span>{new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  <span className="text-sky-300 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
