import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Building2, Landmark } from 'lucide-react';
import { colors } from '@/theme/colors';

export default function RegionSelector({ region, setRegion, isRTL }) {
  const { t } = useTranslation();

  // استخراج القيم الموحدة من كائن الثيم
  const cardBg = colors?.dark?.card || '#0F172A';
  const borderColor = colors?.dark?.cardBorder || '#1E293B';
  const accentEmerald = colors?.emerald?.light || '#10B981';
  const textPrimary = colors?.dark?.text || '#F8FAFC';
  const textMuted = colors?.dark?.textMuted || '#94A3B8';

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
    <div 
      style={{ backgroundColor: cardBg, borderColor: borderColor }}
      className="border rounded-2xl p-5 mb-8 text-center max-w-2xl mx-auto shadow-2xl"
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <Globe size={16} style={{ color: accentEmerald }} />
        <h3 style={{ color: textPrimary }} className="font-extrabold text-xs sm:text-sm">
          {t('subscription.selectCurrencyTitle', 'اختر عملة ونطاق التسعير المناسب لك')}
        </h3>
      </div>
      <p style={{ color: textMuted }} className="text-[11px] mb-4">
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
              style={{
                backgroundColor: isSelected ? colors?.dark?.bg : 'rgba(15, 23, 42, 0.4)',
                borderColor: isSelected ? accentEmerald : borderColor,
                color: isSelected ? textPrimary : textMuted,
                boxShadow: isSelected ? `0 4px 14px rgba(16, 185, 129, 0.15)` : 'none',
              }}
              className={`flex flex-col items-center justify-between p-3.5 rounded-xl font-bold transition-all duration-200 border cursor-pointer ${
                isSelected ? 'ring-1' : 'hover:border-slate-700 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComponent 
                  size={18} 
                  style={{ color: isSelected ? accentEmerald : textMuted }} 
                  className="shrink-0"
                />
                <span className="text-xs">{item.label}</span>
              </div>

              <span 
                style={{
                  backgroundColor: isSelected ? accentEmerald : borderColor,
                  color: isSelected ? colors?.dark?.bg : textMuted,
                }}
                className="text-[11px] px-3 py-0.5 rounded-md font-mono font-black shrink-0 tracking-wider"
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
