/* src/locales/i18n.js */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 1. استيراد ملفات اللغات
import arTranslation from '@/locales/ar.json';
import enTranslation from '@/locales/en.json';
import trTranslation from '@/locales/tr.json';
import urTranslation from '@/locales/ur.json';
import idTranslation from '@/locales/id.json';

// قائمة اللغات التي تكتب من اليمين إلى اليسار (RTL)
const RTL_LANGUAGES = ['ar', 'ur', 'fa', 'he', 'arc'];

// دالة فحص اتجاه اللغة تلقائياً
export const getLanguageDirection = (lng) => {
  if (!lng) return 'rtl';
  const langCode = lng.split('-')[0]; // للتعامل مع رموز مثل ar-EG
  return RTL_LANGUAGES.includes(langCode) ? 'rtl' : 'ltr';
};

const resources = {
  ar: { translation: arTranslation },
  en: { translation: enTranslation },
  tr: { translation: trTranslation },
  ur: { translation: urTranslation },
  id: { translation: idTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en', 'tr', 'ur', 'id'], // تم إضافة اللغات الجديدة هنا
    react: { useSuspense: false },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// تثبيت الاتجاه واللغة المبدئية عند التشغيل لمنع الوميض (Layout Shift)
const initialLng = i18n.language || 'ar';
document.documentElement.setAttribute('dir', getLanguageDirection(initialLng));
document.documentElement.setAttribute('lang', initialLng);

// مراقبة وضبط الاتجاه واللغة ديناميكياً عند التبديل
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('dir', getLanguageDirection(lng));
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
