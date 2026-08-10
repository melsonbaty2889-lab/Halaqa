import React, { useState } from 'react';
import { Sparkles, Eye, Code, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { REPORT_TEMPLATES = [], AVAILABLE_VARIABLES = [] } from '../../data/reportTemplates';

export default function TemplateSettings({ templateText, setTemplateText }) {
  const { i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');
  const [showPreview, setShowPreview] = useState(false);

  const handleInsertVariable = (varId) => {
    if (!templateText.includes(varId)) {
      setTemplateText((prev) => `${prev} ${varId}`);
    }
  };

  const getPreviewText = () => {
    return (templateText || '')
      .replace(/\[Student_Name\]|\[اسم_الطالب\]/g, isRtl ? 'أحمد محمد' : 'Ahmed Mohamed')
      .replace(/\[Date\]|\[التاريخ\]/g, isRtl ? '27 صفر 1448 هـ' : 'Safar 27, 1448 AH')
      .replace(/\[Status\]|\[الحالة\]/g, isRtl ? 'حاضر ✅' : 'Present ✅')
      .replace(/\[Memorization\]|\[الحفظ\]/g, isRtl ? 'سورة النبأ (1-15)' : 'Surah An-Naba (1-15)')
      .replace(/\[Revision\]|\[المراجعة\]/g, isRtl ? 'جزء عم' : 'Juz Amma')
      .replace(/\[Grade\]|\[التقييم\]/g, isRtl ? 'ممتاز ⭐⭐⭐' : 'Excellent ⭐⭐⭐')
      .replace(/\[Notes\]|\[الملاحظات\]/g, isRtl ? 'ممتاز ومجتهد' : 'Excellent work');
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '13px', fontWeight: '700' }}>
          <Sparkles size={16} />
          <span>{isRtl ? 'نماذج التقارير الجاهزة' : 'Report Templates'}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: showPreview ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
            color: showPreview ? '#38bdf8' : '#94a3b8',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {showPreview ? <Code size={13} /> : <Eye size={13} />}
          <span>{showPreview ? (isRtl ? 'محرر النص' : 'Editor') : (isRtl ? 'معاينة الرسالة' : 'Preview')}</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
        {REPORT_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => setTemplateText(tmpl.text)}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {isRtl ? tmpl.nameAr : tmpl.nameEn}
          </button>
        ))}
      </div>

      {!showPreview ? (
        <>
          <textarea
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              background: '#0b1329',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              color: '#f8fafc',
              padding: '10px',
              fontSize: '12px',
              lineHeight: '1.6',
              resize: 'vertical',
              direction: isRtl ? 'rtl' : 'ltr',
              textAlign: isRtl ? 'right' : 'left',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {AVAILABLE_VARIABLES.map((v) => {
              const isUsed = (templateText || '').includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={isUsed}
                  onClick={() => handleInsertVariable(v.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: isUsed ? 'not-allowed' : 'pointer',
                    background: isUsed ? '#1e293b' : 'rgba(56, 189, 248, 0.15)',
                    color: isUsed ? '#64748b' : '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  {isUsed ? <Check size={12} /> : '+'}
                  <span>{isRtl ? v.labelAr : v.labelEn}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ background: '#0b141a', borderRadius: '8px', padding: '12px', border: '1px solid #1f2c34' }}>
          <div style={{
            background: '#005c4b',
            color: '#e9edef',
            borderRadius: '8px',
            padding: '10px 12px',
            maxWidth: '88%',
            fontSize: '12px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            direction: isRtl ? 'rtl' : 'ltr',
            textAlign: isRtl ? 'right' : 'left',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            {getPreviewText()}
            <div style={{ fontSize: '9px', color: '#8696a0', marginTop: '4px', textAlign: isRtl ? 'left' : 'right' }}>
              1:30 PM ✓✓
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
