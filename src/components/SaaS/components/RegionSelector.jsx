import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Building2, Landmark } from 'lucide-react';
import { UI } from '@/theme/styles';

export default function RegionSelector({ region, setRegion, isRTL }) {
  const { t } = useTranslation();

  // قائمة العملات والنطاقات المالية المحايدة والمعيارية
  const options = [
    { 
      id: 'EGP', 
      label: t('subscription.currencies.egpLabel', 'الجنيه المصري'), 
      currency: 'EGP', 
      icon: Building2,
      desc: t('subscription.currencies.egpDesc', 'المحافظ والوسائل المحلية')
    },
    { 
      id: 'SAR', 
      label: t('subscription.currencies.sarLabel', 'الريال السعودي'), 
      currency: 'SAR', 
      icon: Landmark,
      desc: t('subscription.currencies.sarDesc', 'مدى وسداد والبطاقات')
    },
    { 
      id: 'USD', 
      label: t('subscription.currencies.usdLabel', 'الدولار الأمريكي'), 
      currency: 'USD', 
      icon: Globe,
      desc: t('subscription.currencies.usdDesc', 'جميع البطاقات والدول')
    }
  ];

  return (
    <div className={`${UI.card} p-5 mb-8 text-center max-w-2xl mx-auto shadow-2xl`}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <Globe size={16} className="text-semantic-success" />
        <h3 className="font-extrabold text-xs sm:text-sm text-semantic-textPrimary">
          {t('subscription.selectCurrencyTitle', 'اختر عملة ونطاق التسعير المناسب لك')}
        </h3>
      </div>
      <p className={`${UI.subtitle} text-[11px] mb-4`}>
        {t('subscription.selectCurrencyNotice', 'يمكنك الدفع ببطاقتك المحلية أو بالدولار الأمريكي من أي مكان في العالم')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((item) => {
          // التحقق من الاختيار مع التوافق مع الرموز القديمة (egypt, gcc, global)
          const isSelected = 
            region === item.id || 
            (region === 'egypt' && item.id === 'EGP') || 
            (region === 'gcc' && item.id === 'SAR') || 
            (region === 'global' && item.id === 'USD');

          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setRegion(item.id)}
              aria-selected={isSelected}
              aria-label={item.label}
              title={item.label}
              className={`flex flex-col items-center justify-between p-3.5 rounded-xl font-bold transition-all duration-200 border cursor-pointer ${
                isSelected 
                  ? 'bg-semantic-bgMain border-semantic-success text-semantic-textPrimary shadow-lg shadow-emerald-500/10 ring-1 ring-semantic-success' 
                  : 'bg-semantic-bgCard/40 border-semantic-borderCard text-semantic-textSecondary hover:border-semantic-borderInput opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComponent 
                  size={18} 
                  className={`shrink-0 ${isSelected ? 'text-semantic-success' : 'text-semantic-textMuted'}`}
                />
                <span className="text-xs">{item.label}</span>
              </div>

              <span 
                className={`text-[11px] px-3 py-0.5 rounded-md font-mono font-black shrink-0 tracking-wider ${
                  isSelected 
                    ? 'bg-semantic-success text-semantic-bgMain' 
                    : 'bg-semantic-bgMain text-semantic-textMuted border border-semantic-borderCard'
                }`}
              >
                {item.currency}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
