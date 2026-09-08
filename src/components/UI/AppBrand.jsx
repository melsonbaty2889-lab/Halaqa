import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AppBrand({ className = "", showTagline = false }) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="font-bold text-base tracking-tight">
        {t('app.name')}
      </span>
      {showTagline && (
        <span className="text-xs opacity-75">
          {t('app.tagline')}
        </span>
      )}
    </div>
  );
}
