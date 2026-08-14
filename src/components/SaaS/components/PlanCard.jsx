// src/components/SaaS/components/PlanCard.jsx
import React from 'react';

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
        plan.badge ? 'mt-3' : 'mt-0'
      } ${
        isSelected 
          ? 'bg-slate-900 border-2 shadow-xl shadow-slate-950/50 scale-[1.02]' 
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
      }`}
      style={{ borderColor: isSelected ? plan.color : undefined }}
    >
      {plan.badge && (
        <span 
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-extrabold text-white whitespace-nowrap shadow-md"
          style={{ backgroundColor: plan.badgeBg }}
        >
          {plan.badge}
        </span>
      )}

      <div>
        <h3 className="text-slate-100 text-lg font-extrabold text-center mb-2">
          {plan.title}
        </h3>
        
        <div 
          className="text-3xl font-black text-center my-4"
          style={{ color: plan.color }}
        >
          {finalPrice} <span className="text-xs font-bold text-slate-400">/ {currency}</span>
        </div>

        <ul className="space-y-2.5 my-5 border-t border-dashed border-slate-800 pt-4 list-none p-0">
          {plan.features.map((feat, idx) => (
            <li key={idx} className="text-slate-300 text-xs flex items-center gap-2">
              <span style={{ color: plan.color }} className="font-bold">✓</span>
              {feat}
            </li>
          ))}
        </ul>
      </div>

      <button 
        type="button"
        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors mt-2 ${
          isSelected 
            ? 'text-slate-950 shadow-sm' 
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
        }`}
        style={{ backgroundColor: isSelected ? plan.color : undefined }}
      >
        {isSelected 
          ? (isRTL ? 'الخطة المحددة حالياً' : 'Current Selected') 
          : (isRTL ? 'اختيار هذه الخطة' : 'Select Plan')}
      </button>
    </div>
  );
}
