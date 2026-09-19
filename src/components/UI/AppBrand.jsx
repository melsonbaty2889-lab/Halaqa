/* src/components/UI/AppBrand.jsx */
import React from 'react';
import { useTranslation } from 'react-i18next';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { C } from '@/theme/colors';

// أسماء المنصة الموحدة لكل لغة
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
  lang,
  t: customT
}) {
  const { i18n, t: i18nT } = useTranslation();

  // تحديد دالة الترجمة ولغة النظام تلقائياً من i18n إن لم تُمرر
  const t = customT || i18nT;
  const activeLang = lang || i18n?.language || 'ar';

  // تنظيف كود اللغة (مثل 'en-US' -> 'en')
  const currentLang = activeLang.toLowerCase().split('-')[0];

  // تحديد اسم البراند برمجياً مع التراجع إلى القيمة الافتراضية
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
          <SmartHalaqaProLogo size={76} />
        </div>
      </div>

      {/* اسم المنصة المتغير ديناميكياً بحسب اللغة */}
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
