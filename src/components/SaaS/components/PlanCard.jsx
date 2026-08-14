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
          ? 'bg-[#0F172A] border-[#D97706] shadow-xl shadow-[rgba(217,119,6,0.15)] ring-2 ring-[#D97706] scale-[1.01]' 
          : 'bg-[#0F172A]/70 border-[#1E293B] hover:border-[#334155]'
      }`}
    >
      {plan.badge && (
        <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-extrabold text-white shadow-lg ${plan.badgeBg || 'bg-[#D97706]'}`}>
          {plan.badge}
        </span>
      )}

      <div>
        <h3 className="text-[#F8FAFC] text-xl font-black text-center mb-1">
          {plan.title}
        </h3>
        {plan.description && (
          <p className="text-[#94A3B8] text-xs text-center mb-4">
            {plan.description}
          </p>
        )}

        <div className="text-3xl font-black text-[#F59E0B] my-4 text-center flex items-baseline justify-center gap-2">
          <span>{finalPrice.toLocaleString()}</span>
          <span className="text-xs font-bold text-[#94A3B8]">{currency}</span>
          <span className="text-xs text-[#64748B] font-normal">
            / {plan.periodText}
          </span>
        </div>

        <ul className="space-y-3 my-6 border-t border-[#1E293B] pt-4 list-none p-0">
          {plan.features.map((feat, idx) => (
            <li key={idx} className="text-[#CBD5E1] text-xs flex items-center gap-2">
              <span className="text-[#D97706] shrink-0 font-bold">
                ✓
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        type="button"
        className={`w-full py-3 rounded-xl font-bold text-xs transition-all mt-2 ${
          isSelected 
            ? 'bg-[#D97706] text-white shadow-md hover:bg-[#B45309]' 
            : 'bg-[#1E293B] text-[#CBD5E1] hover:bg-[#223147]'
        }`}
      >
        {isSelected 
          ? (isRTL ? 'رخصتك المحددة حالياً' : 'Current Plan') 
          : (isRTL ? 'اختيار هذه الخطة' : 'Select Plan')}
      </button>
    </div>
  );
}
