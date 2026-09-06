import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Landmark, Globe } from 'lucide-react';
import { colors } from '@/theme';

export default function RegionSelector({ region, setRegion, isRTL }) {
  const { t } = useTranslation();

  // استخراج القيم من كائن الثيم الموحد
  const cardBg = colors?.dark?.card || '#0F172A';
  const borderColor = colors?.dark?.border || '#1E293B';
  const primaryAmber = colors?.accent?.amber || '#D97706';
  const textPrimary = colors?.dark?.text || '#F8FAFC';
  const textMuted = colors?.dark?.textMuted || '#94A3B8';

  const regions = [
    { 
      id: 'egypt', 
      label: t('subscription.regions.egypt', 'جمهورية مصر العربية'), 
      currency: t('subscription.currencies.egp', 'EGP'), 
      icon: Building2 
    },
    { 
      id: 'gcc', 
      label: t('subscription.regions.gcc', 'دول مجلس التعاون الخليجي'), 
      currency: t('subscription.currencies.sar', 'SAR'), 
      icon: Landmark 
    },
    { 
      id: 'global', 
      label: t('subscription.regions.global', 'النطاق الدولي وباقي دول العالم'), 
      currency: t('subscription.currencies.usd', 'USD'), 
      icon: Globe 
    }
  ];

  return (
    <div 
      style={{
        backgroundColor: cardBg,
        borderColor: borderColor,
      }}
      className="border rounded-2xl p-5 mb-8 text-center max-w-xl mx-auto shadow-2xl"
    >
      <h3 style={{ color: textPrimary }} className="font-bold text-sm mb-1">
        {t('subscription.selectRegionNotice', 'حدد النطاق الجغرافي لتفعيل بروتوكولات الدفع المتوافقة مع منطقتك:')}
      </h3>

      <div className="grid grid-cols-1 gap-3 mt-4">
        {regions.map((item) => {
          const isSelected = region === item.id;
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
                backgroundColor: isSelected ? borderColor : 'rgba(9, 15, 22, 0.6)',
                borderColor: isSelected ? primaryAmber : 'rgba(34, 49, 71, 0.8)',
                color: isSelected ? textPrimary : textMuted,
                boxShadow: isSelected ? `0 4px 12px rgba(0, 0, 0, 0.15), 0 0 10px ${primaryAmber}26` : 'none',
              }}
              className={`flex items-center justify-between p-3.5 min-h-[44px] rounded-xl font-bold text-xs transition-all duration-200 border ${
                isSelected ? 'ring-1' : 'hover:opacity-90'
              }`}
            >
              <div className="flex items-center gap-3 text-start">
                <IconComponent 
                  size={18} 
                  style={{ color: isSelected ? primaryAmber : textMuted }} 
                  className="shrink-0"
                />
                <span>{item.label}</span>
              </div>
              <span 
                style={{
                  backgroundColor: isSelected ? primaryAmber : borderColor,
                  color: isSelected ? '#FFFFFF' : textMuted,
                }}
                className="text-[10px] px-2.5 py-1 rounded-md font-mono font-extrabold shrink-0"
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
