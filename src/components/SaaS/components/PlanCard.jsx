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
        isSelected 
          ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.01]' 
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-slate-950 shadow-sm">
          {plan.badge}
        </span>
      )}

      <div>
        <h3 className="text-slate-100 text-lg font-bold mb-2">
          {plan.title}
        </h3>
        
        <div className="text-3xl font-extrabold text-emerald-400 my-4 flex items-baseline gap-1.5">
          <span>{finalPrice}</span>
          <span className="text-xs font-semibold text-slate-400">{currency}</span>
        </div>

        <ul className="space-y-2.5 my-5 border-t border-slate-800/80 pt-4 list-none p-0">
          {plan.features.map((feat, idx) => (
            <li key={idx} className="text-slate-300 text-xs flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              {feat}
            </li>
          ))}
        </ul>
      </div>

      <button 
        type="button"
        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors mt-2 ${
          isSelected 
            ? 'bg-emerald-500 text-slate-950' 
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        {isSelected 
          ? (isRTL ? 'الخطة المحددة حالياً' : 'Current Selected') 
          : (isRTL ? 'اختيار هذه الخطة' : 'Select Plan')}
      </button>
    </div>
  );
}
