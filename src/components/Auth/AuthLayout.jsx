import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AppBrand from '@/components/UI/AppBrand';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { C } from '@/theme/colors';

export const APP_SUBTITLES = {
  ar: 'المنصة الذكية لإدارة حلقات القرآن الكريم',
  ur: 'قرآن مجید کے حلقوں کے انتظام کے لیے اسمارٹ پلیٹ فارم',
  en: 'Smart Platform for Quran Halaqa Management',
  fr: 'Plateforme intelligente pour la gestion des halaqas',
  tr: "Kur'an Halkaları Yönetimi İçin Akıllı Platform",
  id: 'Platform Pintar untuk Manajemen Halaqah',
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
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-x-hidden max-w-full font-cairo"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: C?.dark?.bg || '#0F172A',
        color: C?.text?.title || '#FFFFFF',
      }}
    >
      {/* الخلفية والتوهج العلوي */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
        style={{
          backgroundImage: C?.gradients?.starsBg,
          backgroundSize: '100% 100%, 24px 24px',
        }}
      />

      {/* حاوية المحتوى الرئيسية */}
      <main
        role="main"
        aria-label={safeT('auth.containerLabel', 'حاوية تسجيل الدخول')}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-md rounded-2xl p-5 sm:p-8 relative z-10 border shadow-2xl space-y-6 box-border"
        style={{
          backgroundColor: C?.dark?.card || '#1E293B',
          borderColor: C?.dark?.cardBorder || 'rgba(255,255,255,0.1)',
        }}
      >
        {/* زر اللغات مثبت أعلى الكارت من الداخل */}
        <div className="flex justify-end w-full -mb-2">
          {langBtn || <LanguageSwitcher />}
        </div>

        <AppBrand subtitle={appSubtitle} />

        {children}
      </main>

      {/* الفوتر السفلي */}
      <footer
        role="contentinfo"
        className="mt-4 text-[10px] sm:text-[11px] tracking-wider font-mono z-10 opacity-60 pointer-events-none text-center"
        style={{ color: C?.text?.muted }}
      >
        Smart Halaqa • v2.5
      </footer>
    </div>
  );
}
