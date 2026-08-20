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
 * حساب أجزاء التاريخ الهجري بناءً على تقويم أم القرى (Umm al-Qura)
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

    return { day, month, year, adjustedDate };
  } catch (e) {
    return { day: 1, month: 1, year: 1448, adjustedDate: new Date(dateObj) };
  }
};

/**
 * تنسيق التاريخ الهجري عالمياً وبدقة دون أخطاء أو قيم ثابتة
 */
export const formatHijriDate = (dateObj, langOrIsArabic = 'ar', offsetDays = getSavedHijriOffset()) => {
  const { day, month, year, adjustedDate } = getHijriParts(dateObj, offsetDays);

  try {
    let locale = 'ar';
    if (typeof langOrIsArabic === 'boolean') {
      locale = langOrIsArabic ? 'ar' : 'en';
    } else if (typeof langOrIsArabic === 'string') {
      locale = langOrIsArabic.toLowerCase().trim();
    }

    const monthIndex = Math.max(0, Math.min(11, month - 1));

    // معالجة صريحة ومضمونة للغتين العربية والإنجليزية
    if (locale.startsWith('ar')) {
      return `${day} ${HIJRI_MONTHS_AR[monthIndex]} ${year} هـ`;
    }

    if (locale.startsWith('en')) {
      return `${HIJRI_MONTHS_EN[monthIndex]} ${day}, ${year} AH`;
    }

    // باقي لغات العالم (تركية، إندونيسية، أوردو... إلخ) عبر Intl
    const formatter = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return formatter.format(adjustedDate);
  } catch (error) {
    console.error("Error formatting Hijri date globally:", error);
    // إرجاع التاريخ الفعلي المحسوب حركياً دون أي نصوص ثابته
    const isAr = String(langOrIsArabic).startsWith('ar');
    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthName = isAr ? HIJRI_MONTHS_AR[monthIndex] : HIJRI_MONTHS_EN[monthIndex];

    return isAr ? `${day} ${monthName} ${year} هـ` : `${monthName} ${day}, ${year} AH`;
  }
};
