// src/utils/dateUtils.js

// 1. قاموس الشهور الهجرية للغات الستة
export const HIJRI_MONTHS = {
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  en: ['Muḥarram', 'Ṣafar', "Rabīʿ I", "Rabīʿ II", 'Jumādá I', 'Jumādá II', 'Rajab', 'Shaʿbān', 'Ramaḍān', 'Shawwāl', 'Dhū al-Qaʿdah', 'Dhū al-Ḥijjah'],
  fr: ['Muḥarram', 'Ṣafar', "Rabīʿ I", "Rabīʿ II", 'Jumādá I', 'Jumādá II', 'Rajab', 'Shaʿbān', 'Ramadan', 'Shawwāl', 'Dhū al-Qiʿdah', 'Dhū al-Ḥijjah'],
  tr: ['Muharrem', 'Sefer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'],
  ur: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  id: ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah']
};

// تحويل الأرقام الهندية/العربية لأرقام إنجليزية standard
export const toEngNums = (str) => {
  if (!str) return '';
  return String(str).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
};

// تحويل الأرقام الإنجليزية لأرقام عربية (للأردو والعربي)
export const toArNums = (str) => {
  if (!str) return '';
  return String(str).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
};

/**
 * إدارة فارق الأيام في التقويم الهجري (LocalStorage)
 */
export const getSavedHijriOffset = () => {
  try {
    const saved = localStorage.getItem('hijri_offset');
    return saved !== null ? parseInt(saved, 10) : 0;
  } catch (e) {
    return 0;
  }
};

export const setSavedHijriOffset = (offset) => {
  try {
    localStorage.setItem('hijri_offset', String(offset));
  } catch (e) {
    console.error('Failed to save hijri offset:', e);
  }
};

/**
 * استخراج أجزاء التاريخ الهجري (اليوم، الشهر، السنة)
 */
export const getHijriParts = (dateObj = new Date(), offset = 0) => {
  try {
    const date = dateObj instanceof Date ? new Date(dateObj) : new Date();
    if (offset !== 0) {
      date.setDate(date.getDate() + offset);
    }

    const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic-uma', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });

    const parts = formatter.formatToParts(date);
    return {
      day: parseInt(parts.find(p => p.type === 'day')?.value || '1', 10),
      month: parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1,
      year: parseInt(parts.find(p => p.type === 'year')?.value || '1448', 10)
    };
  } catch (e) {
    return { day: 1, month: 0, year: 1448 };
  }
};

/**
 * حساب العمر بناءً على تاريخ الميلاد
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

  return age < 0 ? 0 : age;
};

/**
 * تنسيق الوقت بشكل موحد ونظيف
 */
export const formatTimeString = (dateObj = new Date(), lang = 'en') => {
  const date = dateObj instanceof Date ? dateObj : new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const isArOrUr = ['ar', 'ur'].includes(lang);
  
  const ampm = hours >= 12 ? (isArOrUr ? 'م' : 'PM') : (isArOrUr ? 'ص' : 'AM');
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  const formattedHours = hours.toString().padStart(2, '0');
  const timeStr = `${formattedHours}:${minutes} ${ampm}`;
  
  return isArOrUr ? toArNums(timeStr) : timeStr;
};

/**
 * تنسيق التاريخ الهجري بحسب اللغة
 */
export const formatHijriDate = (dateObj = new Date(), lang = 'en', offset = getSavedHijriOffset()) => {
  try {
    const { day, month, year } = getHijriParts(dateObj, offset);

    const currentLang = HIJRI_MONTHS[lang] ? lang : 'en';
    const monthName = HIJRI_MONTHS[currentLang][month] || HIJRI_MONTHS.en[month];

    const isArOrUr = ['ar', 'ur'].includes(currentLang);
    const suffix = isArOrUr ? 'هـ' : 'AH';

    if (isArOrUr) {
      return `${toArNums(day)} ${monthName} ${toArNums(year)} ${suffix}`;
    }

    return `${monthName} ${day}, ${year} ${suffix}`;
  } catch (e) {
    console.error('Hijri formatting error:', e);
    return '';
  }
};

/**
 * تنسيق التاريخ الميلادي بحسب اللغة
 */
export const formatGregorianDate = (dateObj = new Date(), lang = 'en') => {
  try {
    const date = dateObj instanceof Date ? dateObj : new Date();
    
    const localeMap = {
      ar: 'ar-EG',
      en: 'en-US',
      fr: 'fr-FR',
      tr: 'tr-TR',
      ur: 'ur-PK',
      id: 'id-ID'
    };

    const targetLocale = localeMap[lang] || 'en-US';

    const formatted = new Intl.DateTimeFormat(targetLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);

    if (['ar', 'ur'].includes(lang)) {
      return toArNums(formatted);
    }

    return formatted;
  } catch (e) {
    return dateObj.toLocaleDateString();
  }
};
