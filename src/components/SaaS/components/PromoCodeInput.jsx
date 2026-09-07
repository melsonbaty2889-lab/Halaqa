import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { C } from '@/theme/colors';

// Helper آمن لجلب النصوص ومنع الـ Hardcoded Strings
const getText = (t, key, fallback) => {
  const translated = t(key);
  return translated && translated !== key ? translated : fallback;
};

export default function PromoCodeInput({ 
  promoCode = '', 
  setPromoCode, 
  onApply, 
  appliedDiscount = 0, 
  error = '' 
}) {
  const { t } = useTranslation();

  // معالجة الضغط على زر Enter داخل حقل الإدخال
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (promoCode.trim() && typeof onApply === 'function') {
        onApply();
      }
    }
  }, [promoCode, onApply]);

  // مسح كود الخصم وإعادة الضبط
  const handleClear = useCallback(() => {
    if (typeof setPromoCode === 'function') {
      setPromoCode('');
    }
    if (typeof onApply === 'function') {
      onApply('');
    }
  }, [setPromoCode, onApply]);

  return (
    <div 
      style={{
        backgroundColor: C.dark?.card || 'rgba(15, 23, 42, 0.85)',
        borderColor: C.amber?.DEFAULT || '#D97706',
      }}
      className="border border-dashed rounded-2xl p-4 mb-8 max-w-xl mx-auto shadow-xl transition-all"
    >
      {/* عنوان القسم */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Tag size={16} style={{ color: C.amber?.DEFAULT || '#D97706' }} />
        <span 
          style={{ color: C.text?.body || '#E2E8F0' }} 
          className="font-bold text-xs"
        >
          {getText(t, 'subscription.promo.haveCode', 'هل لديك كود خصم مخصص؟')}
        </span>
      </div>

      {/* حقل الإدخال والأزرار */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input 
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode && setPromoCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder={getText(t, 'subscription.promo.placeholder', 'أدخل الكود (مثال: S20)')}
            aria-label={getText(t, 'subscription.promo.label', 'كود الخصم')}
            style={{
              backgroundColor: C.inputs?.bg || 'rgba(10, 15, 28, 0.8)',
              borderColor: C.inputs?.border || 'rgba(255, 255, 255, 0.12)',
              color: C.text?.title || '#FFFFFF'
            }}
            className="w-full h-[44px] min-h-[44px] px-3 pe-8 rounded-xl border font-mono text-xs tracking-wider uppercase focus:outline-none transition-colors"
          />

          {promoCode && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={getText(t, 'common.clear', 'مسح')}
              title={getText(t, 'common.clear', 'مسح')}
              style={{ color: C.text?.muted || '#94A3B8' }}
              className="absolute inset-y-0 pe-2.5 flex items-center hover:opacity-80 transition-opacity"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onApply}
          disabled={!promoCode.trim()}
          aria-label={getText(t, 'subscription.promo.apply', 'تطبيق')}
          style={{
            background: C.gradients?.primaryBtn || 'linear-gradient(180deg, #E67E00 0%, #D97706 100%)',
            color: C.text?.title || '#FFFFFF',
            boxShadow: `0 4px 12px ${C.amber?.buttonGlow || 'rgba(217, 119, 6, 0.3)'}`
          }}
          className="shrink-0 h-[44px] min-h-[44px] px-6 text-xs font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer"
        >
          {getText(t, 'subscription.promo.apply', 'تطبيق')}
        </button>
      </div>

      {/* حالة الخصم المطبق بنجاح */}
      {appliedDiscount > 0 && (
        <div 
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: C.emerald?.DEFAULT || '#10B981',
            color: C.emerald?.DEFAULT || '#10B981'
          }}
          className="mt-2.5 flex items-center justify-between p-2.5 px-3 rounded-lg border text-xs font-semibold"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>
              {getText(
                t, 
                'subscription.promo.success', 
                `تم تطبيق خصم بقيمة ${appliedDiscount}% بنجاح!`
              ).replace('{{discount}}', appliedDiscount)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClear}
            aria-label={getText(t, 'subscription.promo.remove', 'إلغاء الخصم')}
            style={{ color: C.emerald?.DEFAULT || '#10B981' }}
            className="text-[10px] underline hover:opacity-80 transition-opacity cursor-pointer"
          >
            {getText(t, 'subscription.promo.remove', 'إلغاء الخصم')}
          </button>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div 
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: C.error?.DEFAULT || '#EF4444',
            color: C.error?.DEFAULT || '#EF4444'
          }}
          className="mt-2.5 flex items-center gap-1.5 p-2.5 rounded-lg border text-xs font-semibold"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
