// src/utils/dateUtils.js

export const HIJRI_MONTHS = {
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  en: ['Muḥarram', 'Ṣafar', "Rabīʿ I", "Rabīʿ II", 'Jumādá I', 'Jumādá II', 'Rajab', 'Shaʿbān', 'Ramaḍān', 'Shawwāl', 'Dhū al-Qaʿdah', 'Dhū al-Ḥijjah'],
  fr: ['Muḥarram', 'Ṣafar', "Rabīʿ I", "Rabīʿ II", 'Jumādá I', 'Jumādá II', 'Rajab', 'Shaʿbān', 'Ramadan', 'Shawwāl', 'Dhū al-Qiʿdah', 'Dhū al-Ḥijjah'],
  tr: ['Muharrem', 'Sefer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'],
  ur: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  id: ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah']
};

export const toEngNums = (str) => {
  if (!str) return '';
  return String(str).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
};

export const toArNums = (str) => {
  if (!str) return '';
  return String(str).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
};

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
 * استخراج أجزاء التاريخ الهجري بدقة وبدون تداخل مع التقويم الميلادي
 */
export const getHijriParts = (dateObj = new Date(), offset = getSavedHijriOffset()) => {
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
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1;
    let year = parseInt(parts.find(p => p.type === 'year')?.value || '1448', 10);

    // صمام أمان: لو رجع المتصفح السنة ميلادية بطريق الخطأ، يتم تحويلها للتقريبي الهجري
    if (year > 1600) {
      year = Math.floor((year - 622) * (33 / 32));
    }

    return { day, month, year };
  } catch (e) {
    return { day: 1, month: 0, year: 1448 };
  }
};

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

export const formatTimeString = (dateObj = new Date(), lang = 'en') => {
  const date = dateObj instanceof Date ? new Date(dateObj) : new Date();
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

export const formatHijriDate = (dateObj = new Date(), lang = 'en', offset = getSavedHijriOffset()) => {
  try {
    const { day, month, year } = getHijriParts(dateObj, offset);

    const cleanLang = (lang || 'en').toLowerCase().split('-')[0];
    const currentLang = HIJRI_MONTHS[cleanLang] ? cleanLang : 'en';
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

export const formatGregorianDate = (dateObj = new Date(), lang = 'en') => {
  try {
    const date = dateObj instanceof Date ? new Date(dateObj) : new Date();
    const cleanLang = (lang || 'en').toLowerCase().split('-')[0];
    
    const localeMap = {
      ar: 'ar-EG',
      en: 'en-US',
      fr: 'fr-FR',
      tr: 'tr-TR',
      ur: 'ur-PK',
      id: 'id-ID'
    };

    const targetLocale = localeMap[cleanLang] || 'en-US';

    const formatted = new Intl.DateTimeFormat(targetLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);

    if (['ar', 'ur'].includes(cleanLang)) {
      return toArNums(formatted);
    }

    return formatted;
  } catch (e) {
    return dateObj.toLocaleDateString();
  }
};
