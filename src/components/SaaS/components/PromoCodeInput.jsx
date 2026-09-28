import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { UI } from '@/theme/styles';

const getText = (t, key, fallback, options = {}) => {
  const translated = t(key, options);
  return translated && translated !== key ? translated : fallback;
};

export default function PromoCodeInput({ 
  promoCode = '', 
  setPromoCode, 
  onApply, 
  onRemove, 
  appliedDiscount = 0, 
  error = '' 
}) {
  const { t } = useTranslation();

  const safeCode = typeof promoCode === 'string' ? promoCode : '';
  const cleanCode = safeCode.trim();
  const isApplyDisabled = !cleanCode;

  // 1. تطبيق الكود (عبر الزر أو مفتاح Enter)
  const handleApply = useCallback(() => {
    if (cleanCode && typeof onApply === 'function') {
      onApply(cleanCode);
    }
  }, [cleanCode, onApply]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  }, [handleApply]);

  // 2. زر X: مسح نص حقل الإدخال فقط بدون مسح الخصم المطبق في الأب
  const handleClearInput = useCallback(() => {
    if (typeof setPromoCode === 'function') {
      setPromoCode('');
    }
  }, [setPromoCode]);

  // 3. زر إلغاء الخصم: يستدعي onRemove الصريحة والمخصصة من الأب
  const handleRemoveDiscount = useCallback(() => {
    if (typeof onRemove === 'function') {
      onRemove();
    } else if (typeof setPromoCode === 'function') {
      // fallback أمني للتنظيف المحترس دون إرسال null أو استدعاء API
      setPromoCode('');
    }
  }, [onRemove, setPromoCode]);

  return (
    <div className={`${UI.card} border-dashed border-semantic-actionPrimary/40 rounded-2xl p-4 mb-8 max-w-xl mx-auto shadow-xl transition-all duration-200`}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Tag size={16} className="text-semantic-actionPrimary" />
        <span className="font-bold text-xs text-semantic-textPrimary">
          {getText(t, 'subscription.promo.haveCode', 'هل لديك كود خصم مخصص؟')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input 
            type="text"
            value={safeCode}
            onChange={(e) => setPromoCode && setPromoCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder={getText(t, 'subscription.promo.placeholder', 'أدخل الكود (مثال: S20)')}
            aria-label={getText(t, 'subscription.promo.label', 'كود الخصم')}
            className={`${UI.input} w-full h-[44px] min-h-[44px] px-3 pe-8 font-mono text-xs tracking-wider uppercase`}
          />

          {safeCode && (
            <button
              type="button"
              onClick={handleClearInput}
              aria-label={getText(t, 'common.clear', 'مسح')}
              title={getText(t, 'common.clear', 'مسح')}
              className="absolute inset-y-0 end-2.5 flex items-center text-semantic-textMuted hover:text-semantic-textPrimary transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleApply}
          disabled={isApplyDisabled}
          aria-label={getText(t, 'subscription.promo.apply', 'تطبيق')}
          className={`${UI.btnPrimary} !w-auto shrink-0 h-[44px] min-h-[44px] px-6 text-xs disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {getText(t, 'subscription.promo.apply', 'تطبيق')}
        </button>
      </div>

      {appliedDiscount > 0 && (
        <div className="mt-2.5 flex items-center justify-between p-2.5 px-3 rounded-lg border border-semantic-successBorder/30 bg-semantic-successBg/10 text-semantic-success text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>
              {getText(
                t, 
                'subscription.promo.success', 
                `تم تطبيق خصم بقيمة ${appliedDiscount}% بنجاح!`,
                { discount: appliedDiscount }
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRemoveDiscount}
            aria-label={getText(t, 'subscription.promo.remove', 'إلغاء الخصم')}
            className="text-[10px] underline hover:opacity-80 transition-opacity cursor-pointer text-semantic-success"
          >
            {getText(t, 'subscription.promo.remove', 'إلغاء الخصم')}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2.5 flex items-center gap-1.5 p-2.5 rounded-lg border border-semantic-danger/30 bg-semantic-dangerBg text-semantic-danger text-xs font-semibold">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
