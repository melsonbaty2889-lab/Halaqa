import React from 'react';
import { Tag, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PromoCodeInput({ 
  promoCode, 
  setPromoCode, 
  onApply, 
  appliedDiscount, 
  error, 
  isRTL 
}) {
  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 mb-8 max-w-xl mx-auto shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Tag size={16} className="text-[#D97706]" />
        <span className="text-[#E2E8F0] font-bold text-xs">
          {isRTL ? 'هل لديك كود خصم مخصص؟' : 'Have a Promo Code?'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder={isRTL ? 'أدخل الكود (مثال: HALAQA20)' : 'Enter code (e.g. HALAQA20)'}
          className="app-input uppercase font-mono text-xs tracking-wider"
        />

        <button
          type="button"
          onClick={onApply}
          className="btn-primary shrink-0 text-xs py-2.5 px-5"
        >
          {isRTL ? 'تطبيق' : 'Apply'}
        </button>
      </div>

      {appliedDiscount > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[#34D399] text-xs font-semibold bg-[rgba(16,185,129,0.1)] p-2 rounded-lg border border-[rgba(16,185,129,0.25)]">
          <CheckCircle2 size={14} />
          <span>
            {isRTL 
              ? `تم تطبيق خصم بقيمة ${appliedDiscount}% بنجاح!` 
              : `${appliedDiscount}% discount applied successfully!`}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[#F87171] text-xs font-semibold bg-[rgba(239,68,68,0.1)] p-2 rounded-lg border border-[rgba(239,68,68,0.25)]">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
