/* src/locales/i18n.js */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// استيراد ملفات الترجمة المنفصلة من نفس المجلد
import arTranslation from './ar.json';
import enTranslation from './en.json';

const resources = {
  ar: { translation: arTranslation },
  en: { translation: enTranslation }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    react: { useSuspense: false },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// تثبيت الاتجاه الأولي لمنع وميض الواجهة (Layout Shift)
const initialLng = i18n.language || 'ar';
document.documentElement.setAttribute('dir', initialLng === 'ar' ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', initialLng);

// مراقبة وضبط الاتجاه ديناميكياً عند تبديل اللغة
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
