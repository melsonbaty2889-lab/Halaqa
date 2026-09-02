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

const SUPPORTED_LANGUAGES = ['ar', 'en', 'tr', 'ur', 'id'];
const RTL_LANGUAGES = ['ar', 'ur', 'fa', 'he', 'arc'];

export const getLanguageDirection = (lng) => {
  if (!lng) return 'rtl';
  const langCode = lng.split('-')[0];
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
    fallbackLng: (code) => {
      // 🟢 إذا كانت لغة المستخدم غير مدعومة (مثل الصينية zh، اليابانية ja، الكورية ko، إلخ)
      // يتم توجيهه تلقائياً للغة الإنجليزية en
      if (!code || !SUPPORTED_LANGUAGES.includes(code.split('-')[0])) {
        return ['en'];
      }
      return ['en'];
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    react: { useSuspense: false },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// 🟢 تحديد اللغة الأولية وضمان اختيار 'en' للغات غير المدعومة
const detectedLng = i18n.language ? i18n.language.split('-')[0] : 'en';
const initialLng = SUPPORTED_LANGUAGES.includes(detectedLng) ? detectedLng : 'en';

document.documentElement.setAttribute('dir', getLanguageDirection(initialLng));
document.documentElement.setAttribute('lang', initialLng);

i18n.on('languageChanged', (lng) => {
  const code = lng ? lng.split('-')[0] : 'en';
  const validLanguage = SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
  document.documentElement.setAttribute('dir', getLanguageDirection(validLanguage));
  document.documentElement.setAttribute('lang', validLanguage);
});

export default i18n;
