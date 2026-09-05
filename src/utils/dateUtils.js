// src/utils/dateUtils.js

export const HIJRI_MONTHS = {
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  en: ['Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhul-Qi'dah", 'Dhul-Hijjah'],
  fr: ['Mouharram', 'Safar', 'Rabi I', 'Rabi II', 'Joumada I', 'Joumada II', 'Rajab', "Cha'bane", 'Ramadan', 'Chawwal', "Dhou al-Qi'da", 'Dhou al-Hijja'],
  tr: ['Muharrem', 'Sefer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'],
  ur: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  id: ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah']
};

export const toEngNums = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
};

export const toArNums = (str) => {
  if (!str) return '';
  return String(str).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
};

export const toUrNums = (str) => {
  if (!str) return '';
  return String(str).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
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
 * حساب أجزاء التاريخ الهجري بدقة وبدون تداخل مع التقويم الميلادي
 */
export const getHijriParts = (dateObj = new Date(), offset = getSavedHijriOffset()) => {
  try {
    const date = dateObj instanceof Date ? new Date(dateObj) : new Date();
    if (offset !== 0) {
      date.setDate(date.getDate() + offset);
    }

    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });

    const formatted = formatter.format(date);
    const cleaned = toEngNums(formatted).replace(/[^\d/]/g, '');
    const parts = cleaned.split('/');

    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);

    if (parts[0] && parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }

    if (isNaN(year) || year > 1600) {
      const gYear = date.getFullYear();
      year = Math.floor((gYear - 622) * (33 / 32));
    }

    return { 
      day: isNaN(day) ? 1 : day, 
      month: (isNaN(month) || month < 0 || month > 11) ? 0 : month, 
      year 
    };
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

export const formatTimeString = (dateObj = new Date(), lang = 'ar') => {
  const date = dateObj instanceof Date ? new Date(dateObj) : new Date();
  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];

  // الفرنسية تعتمد نظام 24 ساعة
  if (cleanLang === 'fr') {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // التركية تعتمد ÖS / ÖÖ
  if (cleanLang === 'tr') {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'ÖS' : 'ÖÖ';
    hours = hours % 12 || 12;
    return `${period} ${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // العربية
  if (cleanLang === 'ar') {
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    const formattedHours = hours.toString().padStart(2, '0');
    return toArNums(`${formattedHours}:${minutes} ${ampm}`);
  }

  // الأوردو (أرقام أوردو شرقية)
  if (cleanLang === 'ur') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = hours.toString().padStart(2, '0');
    return `${toUrNums(formattedHours)}:${toUrNums(minutes)} ${ampm}`;
  }

  // الإنجليزية والإندونيسية
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedHours = hours.toString().padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
};

export const formatHijriDate = (dateObj = new Date(), lang = 'ar', offset = getSavedHijriOffset()) => {
  try {
    const { day, month, year } = getHijriParts(dateObj, offset);

    const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
    const currentLang = HIJRI_MONTHS[cleanLang] ? cleanLang : 'ar';
    const monthName = HIJRI_MONTHS[currentLang][month] || HIJRI_MONTHS.ar[month];

    if (currentLang === 'ar') {
      return `${toArNums(day)} ${monthName} ${toArNums(year)} هـ`;
    }

    if (currentLang === 'ur') {
      return `${toUrNums(day)} ${monthName} ${toUrNums(year)} ء`;
    }

    return `${day} ${monthName} ${year} AH`;
  } catch (e) {
    console.error('Hijri formatting error:', e);
    return '';
  }
};

export const formatGregorianDate = (dateObj = new Date(), lang = 'ar') => {
  try {
    const date = dateObj instanceof Date ? new Date(dateObj) : new Date();
    const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
    
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
      month: 'long',
      year: 'numeric'
    }).format(date);

    if (cleanLang === 'ar') {
      return toArNums(formatted);
    }

    if (cleanLang === 'ur') {
      return toUrNums(formatted);
    }

    return formatted;
  } catch (e) {
    return dateObj.toLocaleDateString();
  }
};
