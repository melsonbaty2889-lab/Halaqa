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
    fallbackLng: ['ar', 'en'], // 🟢 تحديد اللغة الاحتياطية بوضوح وببساطة
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true, // يضمن تحويل tr-TR إلى tr تلقائياً
    lowerCaseLng: true,
    load: 'languageOnly', // يقرأ tr بدلاً من البحث عن tr-TR
    react: { useSuspense: false },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

// 🟢 تحديد اتجاه الصفحة ولغتها في الـ DOM عند بدء التشغيل
const getCleanLang = (lng) => {
  if (!lng) return 'en';
  const code = lng.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
};

const initialLng = getCleanLang(i18n.language);

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('dir', getLanguageDirection(initialLng));
  document.documentElement.setAttribute('lang', initialLng);
}

// 🟢 التحديث التلقائي لاتصالية الواجهة عند تغيير اللغة
i18n.on('languageChanged', (lng) => {
  const validLanguage = getCleanLang(lng);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', getLanguageDirection(validLanguage));
    document.documentElement.setAttribute('lang', validLanguage);
  }
});

export default i18n;
