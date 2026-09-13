import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SmartHalaqaProLogo } from '@/components/UI/SmartHalaqaProLogo';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { C } from '@/theme/colors';

// خريطة أسماء التطبيق حسب كود كل لغة
const APP_NAMES = {
  ar: 'الحلقة الذكية',
  ur: 'اسمارٹ حلقہ',
  en: 'Smart Halaqa',
  fr: 'Smart Halaqa',
  tr: 'Akıllı Halaka',
  id: 'Halaqah Pintar',
};

export default function AuthLayout({ children, langBtn }) {
  const { t, i18n } = useTranslation();

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLangCode);

  // تحديد اسم التطبيق ديناميكياً بناءً على اللغة الحالية
  const appName = useMemo(() => {
    // 1. محاولة جلب الاسم المترجم من ملفات i18n إن وجد
    const translatedName = t('common.appName', { defaultValue: '' });
    if (translatedName) return translatedName;

    // 2. استخدام الخريطة كـ Fallback حسب كود اللغة
    return APP_NAMES[currentLangCode] || APP_NAMES.en;
  }, [t, currentLangCode]);

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
      className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-x-hidden font-cairo"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: C.dark?.bg,
        color: C.text?.title,
      }}
    >
      {/* الخلفية والتوهج الزمردي العلوي */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: C.gradients?.starsBg,
          backgroundSize: '100% 100%, 24px 24px',
        }}
      />

      {/* محول اللغات */}
      <div className="w-full max-w-sm sm:max-w-md flex justify-end relative z-20 mb-2">
        {langBtn || <LanguageSwitcher />}
      </div>

      {/* حاوية المحتوى الرئيسية */}
      <main
        role="main"
        aria-label={safeT('auth.containerLabel', 'حاوية تسجيل الدخول')}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-md rounded-2xl p-5 sm:p-8 relative z-10 border shadow-2xl space-y-6"
        style={{
          backgroundColor: C.dark?.card,
          borderColor: C.dark?.cardBorder,
        }}
      >
        {/* ترويسة الشعار الاحترافي الموحد */}
        <div className="flex flex-col items-center text-center space-y-2">
          <SmartHalaqaProLogo size={52} />
          <h1 className="text-xl font-black text-white tracking-tight">
            {appName}
          </h1>
        </div>

        {children}
      </main>

      {/* الفوتر السفلي */}
      <footer
        role="contentinfo"
        className="mt-4 text-[10px] sm:text-[11px] tracking-wider font-mono z-10 opacity-60 pointer-events-none"
        style={{ color: C.text?.muted }}
      >
        {appName} • v2.5
      </footer>
    </div>
  );
}
