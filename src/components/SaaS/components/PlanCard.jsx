import React from 'react';
import { Check } from 'lucide-react';

export default function PlanCard({ 
  plan, 
  isSelected, 
  onSelect, 
  finalPrice, 
  currency, 
  isRTL 
}) {
  return (
    <div 
      onClick={onSelect}
      className={`relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected 
          ? 'bg-[#0F172A] border-[#D97706] shadow-xl shadow-[rgba(217,119,6,0.15)] ring-2 ring-[#D97706] scale-[1.02]' 
          : 'bg-[#0F172A]/70 border-[#1E293B] hover:border-[#334155]'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#D97706] text-white shadow-md">
          {plan.badge}
        </span>
      )}

      <div>
        <h3 className="text-[#F8FAFC] text-lg font-bold mb-1">
          {plan.title}
        </h3>
        <p className="text-[#94A3B8] text-xs mb-4">
          {plan.description}
        </p>

        <div className="text-3xl font-black text-[#F59E0B] my-3 flex items-baseline gap-1.5">
          <span>{finalPrice.toLocaleString()}</span>
          <span className="text-xs font-bold text-[#94A3B8]">{currency}</span>
          <span className="text-xs text-[#64748B] font-normal">
            / {plan.period === 'monthly' ? (isRTL ? 'شهرياً' : 'month') : (isRTL ? 'سنوياً' : 'year')}
          </span>
        </div>

        <ul className="space-y-2.5 my-5 border-t border-[#1E293B] pt-4 list-none p-0">
          {plan.features.map((feat, idx) => (
            <li key={idx} className="text-[#CBD5E1] text-xs flex items-center gap-2">
              <span className="bg-[rgba(16,185,129,0.15)] text-[#34D399] p-0.5 rounded-full shrink-0">
                <Check size={12} />
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        type="button"
        className={`w-full py-3 rounded-xl font-bold text-xs transition-all mt-3 ${
          isSelected 
            ? 'bg-[#D97706] text-white shadow-md hover:bg-[#B45309]' 
            : 'bg-[#1E293B] text-[#CBD5E1] hover:bg-[#223147]'
        }`}
      >
        {isSelected 
          ? (isRTL ? 'الخطة المحددة حالياً' : 'Selected Plan') 
          : (isRTL ? 'اختيار هذه الخطة' : 'Select Plan')}
      </button>
    </div>
  );
}
