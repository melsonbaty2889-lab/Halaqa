// src/utils/dateUtils.js

// 1. قاموس الشهور الهجرية للغات الستة
export const HIJRI_MONTHS = {
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  en: ['Muḥarram', 'Ṣafar', "Rabīʿ I", "Rabīʿ II", 'Jumādá I', 'Jumādá II', 'Rajab', 'Shaʿbān', 'Ramaḍān', 'Shawwāl', 'Dhū al-Qaʿdah', 'Dhū al-Ḥijjah'],
  fr: ['Muḥarram', 'Ṣafar', "Rabīʿ I", "Rabīʿ II", 'Jumādá I', 'Jumādá II', 'Rajab', 'Shaʿbān', 'Ramadan', 'Shawwāl', 'Dhū al-Qiʿdah', 'Dhū al-Ḥijjah'],
  tr: ['Muharrem', 'Sefer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'],
  ur: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  id: ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawal', 'Dzulqa'dah', 'Dzulhijjah']
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
 * تنسيق الوقت بشكل موحد ونظيف (12 ساعة AM/PM أو م)
 */
export const formatTimeString = (dateObj = new Date(), lang = 'en') => {
  const date = dateObj instanceof Date ? dateObj : new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const isArOrUr = ['ar', 'ur'].includes(lang);
  
  const ampm = hours >= 12 ? (isArOrUr ? 'م' : 'PM') : (isArOrUr ? 'ص' : 'AM');
  hours = hours % 12;
  hours = hours ? hours : 12; // الساعة 0 تبقى 12
  
  const formattedHours = hours.toString().padStart(2, '0');
  const timeStr = `${formattedHours}:${minutes} ${ampm}`;
  
  return isArOrUr ? toArNums(timeStr) : timeStr;
};

/**
 * تنسيق التاريخ الهجري بحسب اللغة
 */
export const formatHijriDate = (dateObj = new Date(), lang = 'en') => {
  try {
    const date = dateObj instanceof Date ? dateObj : new Date();
    
    // استخدام Intl لحساب التاريخ الهجري دقيقاً
    const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic-uma', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '1';
    const monthIndex = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1;
    const year = parts.find(p => p.type === 'year')?.value || '1448';

    // اختيار اللغة المناسبة (fallback لـ en)
    const currentLang = HIJRI_MONTHS[lang] ? lang : 'en';
    const monthName = HIJRI_MONTHS[currentLang][monthIndex] || HIJRI_MONTHS.en[monthIndex];

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
    
    // إعدادات الـ Locale لكل لغة
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
