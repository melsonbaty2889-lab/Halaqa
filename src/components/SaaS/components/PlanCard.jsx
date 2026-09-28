import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { UI } from '@/theme/styles';

export default function PlanCard({ 
  plan, 
  isSelected, 
  onSelect, 
  finalPrice, 
  currency, 
  isRTL 
}) {
  const { t } = useTranslation();

  return (
    <div 
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect && onSelect();
        }
      }}
      className={`relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected 
          ? 'bg-semantic-bgCard border-semantic-actionPrimary shadow-xl ring-2 ring-semantic-actionPrimary scale-[1.01]' 
          : 'bg-semantic-bgCard/70 border-semantic-borderCard hover:border-semantic-actionPrimary/50'
      }`}
    >
      {/* شارة التمييز (مثل الخصم السنوي) */}
      {plan.badge && (
        <span 
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-extrabold shadow-lg bg-semantic-actionPrimary text-semantic-textOnAction"
        >
          {plan.badge}
        </span>
      )}

      <div>
        <h3 className="text-xl font-black text-center mb-1 text-semantic-textPrimary">
          {plan.title}
        </h3>
        
        {plan.description && (
          <p className={`${UI.subtitle} text-xs text-center mb-4`}>
            {plan.description}
          </p>
        )}

        {/* السعر والعملة */}
        <div className="text-3xl font-black my-4 text-center flex items-baseline justify-center gap-2 text-semantic-actionPrimary">
          <span>{Number(finalPrice).toLocaleString()}</span>
          <span className="text-xs font-bold text-semantic-textSecondary">{currency}</span>
          <span className="text-xs font-normal text-semantic-textMuted">
            / {plan.periodText}
          </span>
        </div>

        {/* مميزات الخطة */}
        <ul className="space-y-3 my-6 border-t border-semantic-borderCard pt-4 list-none p-0">
          {plan.features?.map((feat, idx) => (
            <li key={idx} className="text-xs flex items-center gap-2 text-semantic-textSecondary">
              <Check className="shrink-0 font-bold text-semantic-actionPrimary" size={16} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* زر التحديد */}
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect && onSelect();
        }}
        className={`w-full py-3 min-h-[44px] rounded-xl font-bold text-xs transition-all mt-2 cursor-pointer ${
          isSelected 
            ? UI.btnEmerald
            : 'bg-semantic-bgMuted text-semantic-textSecondary hover:bg-semantic-borderCard'
        }`}
      >
        {isSelected 
          ? t('subscription.currentPlan', 'خطتك المحددة حالياً') 
          : t('subscription.selectPlan', 'اختيار هذه الخطة')}
      </button>
    </div>
  );
}
