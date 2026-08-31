/**
 * مكتبة معالجة وتنسيق التواريخ الهجرية والميلادية عالمياً
 * تطبيق سمارت حلقة (Smart Halaqa)
 */

export const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

export const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

// جلب وتعيين إزاحة الرؤية الهجرية في المتصفح
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
 * تنسيق التاريخ الهجري عالمياً
 */
export const formatHijriDate = (dateObj, langOrIsArabic = 'ar', offsetDays = getSavedHijriOffset()) => {
  if (!dateObj) return '';
  const { day, month, year, adjustedDate } = getHijriParts(dateObj, offsetDays);

  try {
    let locale = typeof langOrIsArabic === 'boolean' 
      ? (langOrIsArabic ? 'ar' : 'en') 
      : String(langOrIsArabic || 'ar').toLowerCase().trim();

    const monthIndex = Math.max(0, Math.min(11, month - 1));

    if (locale.startsWith('ar')) {
      return `${day} ${HIJRI_MONTHS_AR[monthIndex]} ${year} هـ`;
    }

    if (locale.startsWith('en')) {
      return `${HIJRI_MONTHS_EN[monthIndex]} ${day}, ${year} AH`;
    }

    const formatter = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return formatter.format(adjustedDate);
  } catch (error) {
    const isAr = String(langOrIsArabic).startsWith('ar');
    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthName = isAr ? HIJRI_MONTHS_AR[monthIndex] : HIJRI_MONTHS_EN[monthIndex];

    return isAr ? `${day} ${monthName} ${year} هـ` : `${monthName} ${day}, ${year} AH`;
  }
};

/**
 * تنسيق التاريخ الميلادي بأسلوب قياسي دولي
 */
export const formatGregorianDate = (dateObj, locale = 'ar-EG', options = {}) => {
  if (!dateObj) return '';
  const date = new Date(dateObj);
  if (isNaN(date.getTime())) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
};

/**
 * عرض التاريخين الهجري والميلادي معاً للتقارير
 */
export const formatDualDate = (dateObj, lang = 'ar') => {
  const hijri = formatHijriDate(dateObj, lang);
  const gregorian = formatGregorianDate(dateObj, lang === 'ar' ? 'ar-EG' : 'en-US');
  return `${hijri} (${gregorian})`;
};

/**
 * حساب العمر بالسنوات من تاريخ الميلاد
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
 * تحويل تاريخ هجري (سنة، شهر، يوم) إلى كائن Date ميلادي
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
