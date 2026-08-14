// src/components/SaaS/components/PromoCodeInput.jsx
import React from 'react';

export default function PromoCodeInput({ 
  couponInput, 
  setCouponInput, 
  handleApplyCoupon, 
  couponMessage, 
  isRTL 
}) {
  return (
    <div className="max-w-md w-full mx-auto mb-8 bg-slate-900/90 p-4 rounded-2xl border border-dashed border-slate-800">
      <label className="block text-slate-300 text-xs font-bold mb-2.5 text-center">
        {isRTL ? "هل لديك كود خصم مخصص؟" : "Have a promo discount code?"}
      </label>

      <div className="flex gap-2 items-center w-full">
        <input 
          type="text" 
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
          placeholder={isRTL ? "أدخل الكود (مثال: S20)" : "Enter code (e.g. S20)"}
          className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
        />
        <button 
          type="button"
          onClick={handleApplyCoupon}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs whitespace-nowrap shrink-0 transition-colors shadow-sm"
        >
          {isRTL ? "تطبيق" : "Apply"}
        </button>
      </div>

      {couponMessage && (
        <div className={`mt-2.5 text-center text-xs font-bold ${
          couponMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-500'
        }`}>
          {couponMessage.text}
        </div>
      )}
    </div>
  );
}
