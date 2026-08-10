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

// جلب التعديل المحفوظ في المتصفح (الافتراضي 0 لأن تقويم أم القرى دقيق)
export const getSavedHijriOffset = () => {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('app_hijri_offset');
  return saved !== null ? parseInt(saved, 10) : 0;
};

// حفظ تعديل الرؤية لتطبيقه على كل النظام دائماً
export const setSavedHijriOffset = (offset) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_hijri_offset', offset.toString());
  }
};

/**
 * حساب التاريخ الهجري الدقيق بناءً على تقويم أم القرى الرسمي (Umm al-Qura)
 */
export const getHijriParts = (dateObj, offsetDays = getSavedHijriOffset()) => {
  try {
    const adjustedDate = new Date(dateObj);
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

    return { day, month, year };
  } catch (e) {
    return { day: 1, month: 1, year: 1448 };
  }
};

export const formatHijriDate = (dateObj, isArabic = true, offsetDays = getSavedHijriOffset()) => {
  const { day, month, year } = getHijriParts(dateObj, offsetDays);
  const monthName = isArabic ? HIJRI_MONTHS_AR[month - 1] : HIJRI_MONTHS_EN[month - 1];
  return isArabic ? `${day} ${monthName} ${year} هـ` : `${monthName} ${day}, ${year} AH`;
};
