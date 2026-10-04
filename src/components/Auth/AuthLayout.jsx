// src/components/Auth/AuthLayout.jsx
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AppBrand from '@/components/UI/AppBrand';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';

export const APP_SUBTITLES = {
  ar: 'المنصة الذكية لإدارة حلقات القرآن الكريم',
  ur: 'قرآن مجید کے حلقوں کے انتظام کے لیے اسمارٹ پلیٹ فارم',
  en: 'Smart Platform for Quran Halaqa Management',
  fr: 'Plateforme intelligente pour la gestion des halaqas',
  tr: "Kur'an Halkaları Yönetimi İçin Akıllı Platform",
  id: 'Platform Pintar untuk Manajemen Halaqah',
};

export const APP_NAMES = {
  ar: 'الحلقة الذكية',
  ur: 'اسمارٹ حلقہ',
  en: 'Smart Halaqa',
  fr: 'Smart Halaqa',
  tr: 'Smart Halaqa',
  id: 'Smart Halaqa',
};

export default function AuthLayout({ children, langBtn, subtitle }) {
  const { t, i18n } = useTranslation();

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLangCode);

  const appSubtitle = useMemo(() => {
    if (subtitle) return subtitle;
    return APP_SUBTITLES[currentLangCode] || APP_SUBTITLES.ar;
  }, [subtitle, currentLangCode]);

  const safeT = useCallback(
    (key, fallback) => {
      if (typeof t === 'function') {
        return t(key, { defaultValue: fallback || key });
      }
      return fallback || key;
    },
    [t]
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-x-hidden max-w-full font-cairo bg-transparent">
      {/* حاوية المحتوى الرئيسية مع تحديد الاتجاه المباشر */}
      <main
        role="main"
        dir={isRtl ? 'rtl' : 'ltr'}
        aria-label={safeT('auth.containerLabel', 'حاوية تسجيل الدخول')}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-md rounded-2xl p-5 sm:p-8 relative z-10 border border-semantic-borderCard bg-dark-card text-semantic-textPrimary shadow-2xl space-y-6 box-border text-start"
      >
        {/* زر تغيير اللغة - يتطابق مع اتجاه الواجهة */}
        <div className="flex justify-end w-full -mb-2 relative z-50">
          {langBtn || <LanguageSwitcher dropDirection="down" placement="auth" />}
        </div>

        <AppBrand subtitle={appSubtitle} />

        {children}
      </main>

      {/* الفوتر الموحد */}
      <footer
        role="contentinfo"
        className="mt-4 text-[10px] sm:text-[11px] tracking-widest font-mono z-10 opacity-50 pointer-events-none text-center uppercase text-semantic-textMuted"
      >
        SMART HALAQA • v2.5
      </footer>
    </div>
  );
}
