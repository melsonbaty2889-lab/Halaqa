// src/components/UI/AppBrand.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { C } from '@/theme/colors';

// أسماء المنصة الموحدة
const BRAND_NAMES = {
  ar: 'الحلقة الذكية',
  ur: 'اسمارٹ حلقہ',
  // تثبيت الاسم الإنجليزي لكافة اللغات اللاتينية
  en: 'Smart Halaqa',
  fr: 'Smart Halaqa',
  tr: 'Smart Halaqa',
  id: 'Smart Halaqa',
};

export default function AppBrand({ className = '', subtitle }) {
  const { t, i18n } = useTranslation();

  // الحصول على كود اللغة الحالي (مثلاً: 'id' أو 'tr')
  const currentLang = i18n?.language?.split('-')[0] || 'ar';

  // تحديد اسم البراند برمجياً مع إمكانية التراجع لـ t()
  const brandName = BRAND_NAMES[currentLang] || t('common.appName', 'Smart Halaqa');

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* غلاف اللوجو والتوهج */}
      <div className="relative mb-3 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-60 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${C?.emerald?.DEFAULT || '#10B981'} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 animate-pulse drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <SmartHalaqaProLogo size={64} />
        </div>
      </div>

      {/* اسم المنصة باللون الأبيض */}
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1 text-white">
        {brandName}
      </h2>

      {/* العنوان الفرعي المترجم */}
      {subtitle && (
        <p
          className="text-xs sm:text-sm font-medium tracking-wide m-0 max-w-xs leading-relaxed"
          style={{ color: C?.text?.muted || '#94A3B8' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
