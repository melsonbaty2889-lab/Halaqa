/* src/components/UI/AppBrand.jsx */
import React from 'react';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { C } from '@/theme/colors';

// أسماء المنصة الموحدة لجميع اللغات المعتمدة
const BRAND_NAMES = {
  ar: 'الحلقة الذكية',
  ur: 'اسمارٹ حلقہ',
  en: 'Smart Halaqa',
  fr: 'Smart Halaqa',
  tr: 'Smart Halaqa',
  id: 'Smart Halaqa',
};

export default function AppBrand({ 
  className = '', 
  subtitle,
  lang = 'ar',
  t = (key, fallback) => fallback 
}) {
  // الحصول على كود اللغة النظيف
  const currentLang = (lang || 'ar').toLowerCase().split('-')[0];

  // تحديد اسم البراند برمجياً بناءً على اللغة الحالية
  const brandName = BRAND_NAMES[currentLang] || t('common.appName', 'Smart Halaqa');

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* غلاف اللوجو والتوهج الزمردي */}
      <div className="relative mb-3 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-60 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${C?.brandEmerald?.DEFAULT || 'var(--color-success)'} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 drop-shadow-[0_0_15px_var(--emerald-logo-glow)]">
          <SmartHalaqaProLogo size={64} />
        </div>
      </div>

      {/* اسم المنصة */}
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1 text-semantic-textPrimary">
        {brandName}
      </h2>

      {/* العنوان الفرعي */}
      {subtitle && (
        <p className="text-xs sm:text-sm font-medium tracking-wide m-0 max-w-xs leading-relaxed text-semantic-textSecondary">
          {subtitle}
        </p>
      )}
    </div>
  );
}
