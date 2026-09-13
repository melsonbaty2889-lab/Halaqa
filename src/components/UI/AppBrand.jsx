import React from 'react';
import { useTranslation } from 'react-i18next';
import { C } from '@/theme/colors';

export default function AppBrand({ className = "", showTagline = true }) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span 
        className="font-extrabold text-lg sm:text-xl tracking-tight leading-snug"
        style={{ color: C?.text?.title }}
      >
        {t('app.name', 'المنصة القرآنية')}
      </span>
      {showTagline && (
        <span 
          className="text-xs font-semibold mt-0.5 tracking-wide"
          style={{ color: C?.amber?.DEFAULT || '#D97706' }}
        >
          {t('app.tagline', 'الحلقة الذكية')}
        </span>
      )}
    </div>
  );
}
