import React, { useState, useRef } from 'react';
import { Sparkles, Eye, Code, Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { REPORT_TEMPLATES, AVAILABLE_VARIABLES } from '../../data/reportTemplates';

export default function TemplateSettings({ templateText = '', setTemplateText }) {
  const { i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  // إدراج المتغير مع حماية كاملة ضد القيم غير المعرفة (Safe Cursor Insertion)
  const handleInsertVariable = (variableObj) => {
    // جلب المفتاح بأمان حسب هيكل البيانات المتاح
    const varKey = typeof variableObj === 'string' 
      ? variableObj 
      : (isRtl 
          ? (variableObj?.keyAr || variableObj?.key || variableObj?.id || '') 
          : (variableObj?.keyEn || variableObj?.key || variableObj?.id || ''));

    if (!varKey) return;

    const safeText = templateText || '';

    if (!textareaRef.current) {
      setTemplateText(`${safeText} ${varKey}`);
      return;
    }

    const { selectionStart = safeText.length, selectionEnd = safeText.length } = textareaRef.current;
    
    const newText =
      safeText.substring(0, selectionStart) +
      ` ${varKey} ` +
      safeText.substring(selectionEnd);

    setTemplateText(newText);

    // إعادة التكيز وضبط موضع المؤشر بأمان
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPosition = selectionStart + varKey.length + 2;
        textareaRef.current.setSelectionRange(nextPosition, nextPosition);
      }
    }, 0);
  };

  const handleSelectTemplate = (tmpl) => {
    if (!tmpl) return;
    const textToSet = isRtl ? (tmpl.textAr || tmpl.text || '') : (tmpl.textEn || tmpl.text || '');
    setTemplateText(textToSet);
  };

  const getPreviewText = () => {
    const safeText = templateText || '';
    return safeText
      .replace(/\[Student_Name\]|\[اسم_الطالب\]/g, isRtl ? 'أحمد محمد' : 'Ahmed Mohamed')
      .replace(/\[Date\]|\[التاريخ\]/g, isRtl ? '10 أغسطس 2026' : 'August 10, 2026')
      .replace(/\[Status\]|\[الحالة\]/g, isRtl ? 'حاضر ✅' : 'Present ✅')
      .replace(/\[Memorization\]|\[الحفظ\]/g, isRtl ? 'سورة النبأ (1-15)' : 'Surah An-Naba (1-15)')
      .replace(/\[Revision\]|\[المراجعة\]/g, isRtl ? 'جزء عم' : 'Juz Amma')
      .replace(/\[Grade\]|\[التقييم\]/g, isRtl ? 'ممتاز ⭐⭐⭐' : 'Excellent ⭐⭐⭐')
      .replace(/\[Notes\]|\[الملاحظات\]/g, isRtl ? 'أداء رائع ومجتهد جداً' : 'Outstanding performance');
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(getPreviewText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const safeVariables = Array.isArray(AVAILABLE_VARIABLES) ? AVAILABLE_VARIABLES : [];
  const safeTemplates = Array.isArray(REPORT_TEMPLATES) ? REPORT_TEMPLATES : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" />
          <span>{isRtl ? 'محرر القوالب الذكي' : 'Smart Template Engine'}</span>
        </div>

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

      {/* Templates Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none snap-x">
        {safeTemplates.map((tmpl) => (
          <button
            key={tmpl.id || tmpl.nameAr}
            type="button"
            onClick={() => handleSelectTemplate(tmpl)}
            className="snap-start whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all active:scale-95"
          >
            {isRtl ? (tmpl.nameAr || tmpl.name) : (tmpl.nameEn || tmpl.name)}
          </button>
        ))}
      </div>

      {/* Editor & Preview Modes */}
      {!showPreview ? (
        <>
          <textarea
            ref={textareaRef}
            value={templateText || ''}
            onChange={(e) => setTemplateText(e.target.value)}
            rows={4}
            dir="auto"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs leading-relaxed text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all resize-y"
            placeholder={isRtl ? 'صمم نص القالب هنا واستخدم المتغيرات...' : 'Design template text using variables...'}
          />

          {/* Dynamic Variables Buttons */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-800/60">
            {safeVariables.map((v, idx) => {
              const varKey = isRtl ? (v.keyAr || v.key || v.id) : (v.keyEn || v.key || v.id);
              const varLabel = isRtl ? (v.labelAr || v.label) : (v.labelEn || v.label);
              const isUsed = varKey ? (templateText || '').includes(varKey) : false;

              return (
                <button
                  key={varKey || idx}
                  type="button"
                  onClick={() => handleInsertVariable(v)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                    isUsed
                      ? 'bg-slate-800/50 text-slate-500 border-slate-800 cursor-default'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 active:scale-95'
                  }`}
                >
                  {isUsed ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="text-xs">+</span>}
                  <span>{varLabel || varKey}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* Preview Card */
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
              <span>18:02</span>
              <span className="text-sky-300 font-bold">✓✓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
