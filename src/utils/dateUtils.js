/* src/utils/dateUtils.js */

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

/**
 * استخراج تفاصيل التاريخ الهجري الحقيقي (اليوم، الشهر، السنة الهجرية)
 */
export const getHijriParts = (dateObj) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-uma', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(dateObj);
    
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1448', 10);

    return { day, month, year };
  } catch (e) {
    return { day: 1, month: 1, year: 1448 };
  }
};

/**
 * تنسيق التاريخ الهجري المكتوب بلغة الموفر
 */
export const formatHijriDate = (dateObj, isArabic = true) => {
  const { day, month, year } = getHijriParts(dateObj);
  const monthName = isArabic ? HIJRI_MONTHS_AR[month - 1] : HIJRI_MONTHS_EN[month - 1];
  return isArabic ? `${day} ${monthName} ${year} هـ` : `${monthName} ${day}, ${year} AH`;
};
