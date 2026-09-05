// src/utils/dateUtils.js

/**
 * مكتبة معالجة وتنسيق التواريخ الهجرية والميلادية عالمياً
 * تطبيق سمارت حلقة (Smart Halaqa)
 */

// قاموس الشهور الهجرية الشامل للغات الست المعتمدة
export const HIJRI_MONTHS = {
  ar: ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"],
  en: ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"],
  fr: ["Mouharram", "Safar", "Rabi' al-Awwal", "Rabi' ath-Thani", "Djoumada al-Oula", "Djoumada ath-Thania", "Rajab", "Cha'bane", "Ramadan", "Chawwal", "Dhou al-Qi'dah", "Dhou al-Hijja"],
  tr: ["Muharrem", "Sefer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"],
  id: ["Muharram", "Safar", "Rabi'ul Awwal", "Rabi'ul Akhir", "Jumadil Awwal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadhan", "Syawwal", "Dzulqa'dah", "Dzulhijjah"],
  ur: ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الثانية", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"]
};

// للحفاظ على التوافق الكامل مع أي استيراد قديم في مكونات المشروع
export const HIJRI_MONTHS_AR = HIJRI_MONTHS.ar;
export const HIJRI_MONTHS_EN = HIJRI_MONTHS.en;

// الرموز المخصصة لـ (هـ / AH) لكل لغة لضمان الاتساق
export const HIJRI_SUFFIX = {
  ar: "هـ",
  en: "AH",
  fr: "AH",
  tr: "H",
  id: "H",
  ur: "ھ"
};

// تحويل أي أرقام هندية/عربية إلى أرقام إنجليزية قياسية (1, 2, 3)
export const toEngNums = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
};

// استخراج رمز اللغة الأساسي وتطبيقه بأمان
const normalizeLang = (lang) => {
  if (!lang) return 'ar';
  if (typeof lang === 'boolean') return lang ? 'ar' : 'en';
  const cleanLang = String(lang).toLowerCase().split('-')[0].trim();
  return HIJRI_MONTHS[cleanLang] ? cleanLang : 'en';
};

// جلب وتعيين إزاحة الرؤية الهجرية من LocalStorage
export const getSavedHijriOffset = () => {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('app_hijri_offset');
  return saved !== null ? parseInt(saved, 10) : 0;
};

export const setSavedHijriOffset = (offset) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_hijri_offset', offset.toString());
  }
};

/**
 * استخراج أجزاء التاريخ الهجري بدقة بناءً على تقويم أم القرى
 */
export const getHijriParts = (dateObj, offsetDays = getSavedHijriOffset()) => {
  try {
    const adjustedDate = new Date(dateObj || Date.now());
    adjustedDate.setDate(adjustedDate.getDate() + offsetDays);

    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });

    const parts = formatter.formatToParts(adjustedDate);

    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1448', 10);

    return { day, month, year, adjustedDate };
  } catch (e) {
    return { day: 1, month: 1, year: 1448, adjustedDate: new Date(dateObj || Date.now()) };
  }
};

/**
 * تنسيق التاريخ الهجري بدقة لجميع اللغات (تقبل كود اللغة كـ String أو Boolean للتوافق القديم)
 */
export const formatHijriDate = (dateObj, langOrIsArabic = 'ar', offsetDays = getSavedHijriOffset()) => {
  if (!dateObj) return '';
  const { day, month, year } = getHijriParts(dateObj, offsetDays);
  const lang = normalizeLang(langOrIsArabic);
  const monthIndex = Math.max(0, Math.min(11, month - 1));
  
  const monthName = HIJRI_MONTHS[lang][monthIndex];
  const suffix = HIJRI_SUFFIX[lang] || 'AH';

  // تنسيق اللغات التي تبدأ من اليمين (RTL)
  if (lang === 'ar' || lang === 'ur') {
    return toEngNums(`${day} ${monthName} ${year} ${suffix}`);
  }

  // تنسيق اللغات التي تبدأ من اليسار (LTR)
  return toEngNums(`${monthName} ${day}, ${year} ${suffix}`);
};

/**
 * تنسيق التاريخ الميلادي وضمان الأرقام وتفادي رموز النظام التشويشية
 */
export const formatGregorianDate = (dateObj, locale = 'ar', options = {}) => {
  if (!dateObj) return '';
  const date = new Date(dateObj);
  if (isNaN(date.getTime())) return '';

  const lang = normalizeLang(locale);

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  try {
    const formatted = new Intl.DateTimeFormat(lang, defaultOptions).format(date);
    return toEngNums(formatted);
  } catch (error) {
    const formatted = new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
    return toEngNums(formatted);
  }
};

/**
 * تنسيق الوقت بصيغة قياسية ثابتة (12 ساعة) دون الاعتماد على حروف النظام المشوهة
 */
export const formatTimeString = (dateObj) => {
  if (!dateObj) return '';
  const date = new Date(dateObj);
  if (isNaN(date.getTime())) return '';

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
};

/**
 * عرض التاريخين الهجري والميلادي معاً للتقارير
 */
export const formatDualDate = (dateObj, lang = 'ar') => {
  const hijri = formatHijriDate(dateObj, lang);
  const gregorian = formatGregorianDate(dateObj, lang);
  return `${hijri} (${gregorian})`;
};

/**
 * حساب العمر بالسنوات
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

/**
 * تحويل تاريخ هجري إلى ميلادي
 */
export const hijriToGregorian = (hYear, hMonth, hDay) => {
  try {
    const julianDay = Math.floor((11 * hYear + 3) / 30) + 354 * hYear + 30 * hMonth - Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385;
    const l = julianDay + 68569;
    const n = Math.floor((4 * l) / 146097);
    const l2 = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l2 + 1)) / 1461001);
    const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l3) / 2447);
    const day = l3 - Math.floor((2447 * j) / 80);
    const l4 = Math.floor(j / 11);
    const month = j + 2 - 12 * l4;
    const year = 100 * (n - 49) + i + l4;

    return new Date(year, month - 1, day);
  } catch (error) {
    return new Date();
  }
};
