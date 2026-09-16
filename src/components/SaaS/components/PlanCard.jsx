import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { colors } from '@/theme/colors';

export default function PlanCard({ 
  plan, 
  isSelected, 
  onSelect, 
  finalPrice, 
  currency, 
  isRTL 
}) {
  const { t } = useTranslation();

  // الاعتماد المباشر على شجرة ألوان النظام الموحد
  const cardBg = colors?.dark?.card;
  const borderColor = colors?.dark?.cardBorder;
  const primaryAccent = colors?.emerald?.light;
  const textPrimary = colors?.dark?.text;
  const textMuted = colors?.dark?.textMuted;
  const textSubtle = colors?.dark?.textSubtle;

  return (
    <div 
      onClick={onSelect}
      style={{
        backgroundColor: isSelected ? cardBg : `${cardBg}B3`,
        borderColor: isSelected ? primaryAccent : borderColor,
        boxShadow: isSelected ? `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 15px ${primaryAccent}26` : 'none',
      }}
      className={`relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected ? 'ring-2 scale-[1.01]' : 'hover:border-slate-700'
      }`}
    >
      {plan.badge && (
        <span 
          style={{ backgroundColor: plan.badgeBg || primaryAccent, color: colors?.dark?.bg }}
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-extrabold shadow-lg"
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

        <div style={{ color: primaryAccent }} className="text-3xl font-black my-4 text-center flex items-baseline justify-center gap-2">
          <span>{Number(finalPrice).toLocaleString()}</span>
          <span style={{ color: textMuted }} className="text-xs font-bold">{currency}</span>
          <span style={{ color: textSubtle }} className="text-xs font-normal">
            / {plan.periodText}
          </span>
        </div>

        <ul style={{ borderColor: borderColor }} className="space-y-3 my-6 border-t pt-4 list-none p-0">
          {plan.features?.map((feat, idx) => (
            <li key={idx} style={{ color: textMuted }} className="text-xs flex items-center gap-2">
              <Check style={{ color: primaryAccent }} className="shrink-0 font-bold" size={16} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        type="button"
        style={{
          backgroundColor: isSelected ? primaryAccent : borderColor,
          color: isSelected ? colors?.dark?.bg : textMuted
        }}
        className="w-full py-3 min-h-[44px] rounded-xl font-bold text-xs transition-all mt-2 hover:opacity-90"
      >
        {isSelected 
          ? t('subscription.currentPlan', 'خطتك المحددة حالياً') 
          : t('subscription.selectPlan', 'اختيار هذه الخطة')}
      </button>
    </div>
  );
}
