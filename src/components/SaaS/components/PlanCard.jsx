import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { colors } from '@/theme';

export default function PlanCard({ 
  plan, 
  isSelected, 
  onSelect, 
  finalPrice, 
  currency, 
  isRTL 
}) {
  const { t } = useTranslation();

  // جلب القيم من ثيم الألوان الموحد مع وجود قيم افتراضية آمنة
  const cardBg = colors?.dark?.card || '#0F172A';
  const borderColor = colors?.dark?.border || '#1E293B';
  const primaryGold = colors?.accent?.gold || '#F59E0B';
  const primaryAmber = colors?.accent?.amber || '#D97706';
  const textPrimary = colors?.dark?.text || '#F8FAFC';
  const textMuted = colors?.dark?.textMuted || '#94A3B8';
  const textSubtle = colors?.dark?.textSubtle || '#64748B';

  return (
    <div 
      onClick={onSelect}
      style={{
        backgroundColor: isSelected ? cardBg : `${cardBg}B3`,
        borderColor: isSelected ? primaryAmber : borderColor,
        boxShadow: isSelected ? `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 15px ${primaryAmber}26` : 'none',
      }}
      className={`relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected ? 'ring-2 scale-[1.01]' : 'hover:border-slate-700'
      }`}
    >
      {plan.badge && (
        <span 
          style={{ backgroundColor: plan.badgeBg || primaryAmber }}
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-extrabold text-white shadow-lg"
        >
          {plan.badge}
        </span>
      )}

      <div>
        <h3 style={{ color: textPrimary }} className="text-xl font-black text-center mb-1">
          {plan.title}
        </h3>
        {plan.description && (
          <p style={{ color: textMuted }} className="text-xs text-center mb-4">
            {plan.description}
          </p>
        )}

        <div style={{ color: primaryGold }} className="text-3xl font-black my-4 text-center flex items-baseline justify-center gap-2">
          <span>{Number(finalPrice).toLocaleString()}</span>
          <span style={{ color: textMuted }} className="text-xs font-bold">{currency}</span>
          <span style={{ color: textSubtle }} className="text-xs font-normal">
            / {plan.periodText}
          </span>
        </div>

        <ul style={{ borderColor: borderColor }} className="space-y-3 my-6 border-t pt-4 list-none p-0">
          {plan.features.map((feat, idx) => (
            <li key={idx} style={{ color: textMuted }} className="text-xs flex items-center gap-2">
              <Check style={{ color: primaryAmber }} className="shrink-0 font-bold" size={16} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        type="button"
        style={{
          backgroundColor: isSelected ? primaryAmber : borderColor,
          color: isSelected ? '#FFFFFF' : textMuted
        }}
        className="w-full py-3 min-h-[44px] rounded-xl font-bold text-xs transition-all mt-2 hover:opacity-90"
      >
        {isSelected 
          ? t('subscription.currentPlan', 'رخصتك المحددة حالياً') 
          : t('subscription.selectPlan', 'اختيار هذه الخطة')}
      </button>
    </div>
  );
}
