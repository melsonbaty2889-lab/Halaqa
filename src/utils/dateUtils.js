/* src/utils/dateUtils.js */

/**
 * أسماء الأشهر الهجرية باللغة العربية
 */
export const HIJRI_MONTHS_AR = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة"
];

/**
 * أسماء الأشهر الهجرية باللغة الإنجليزية
 */
export const HIJRI_MONTHS_EN = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah"
];

/**
 * التحقق الآمن من صحة التاريخ وتحويله إلى Date Object
 * @param {Date|string|number} date 
 * @returns {Date|null}
 */
export const toSafeDate = (date) => {
  if (!date) return null;
  const target = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  return !isNaN(target.getTime()) ? target : null;
};

/**
 * التحقق مما إذا كان المدخل تاريخاً صالحاً
 * @param {any} date 
 * @returns {boolean}
 */
export const isValidDate = (date) => {
  return toSafeDate(date) !== null;
};

/**
 * استخراج أجزاء التاريخ الهجري (اليوم، الشهر، السنة) بدقة
 * @param {Date} targetDate 
 * @returns {{ day: string, monthNum: number, year: string } | null}
 */
const getHijriParts = (targetDate) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(targetDate);
    const day = parts.find((p) => p.type === 'day')?.value;
    const monthNumStr = parts.find((p) => p.type === 'month')?.value;
    const year = parts.find((p) => p.type === 'year')?.value;

    if (!day || !monthNumStr || !year) return null;

    return {
      day,
      monthNum: parseInt(monthNumStr, 10),
      year
    };
  } catch (error) {
    console.error("[dateUtils] Error extracting Hijri parts:", error);
    return null;
  }
};

/**
 * تنسيق التاريخ الهجري الموحد (عربي / إنجليزي)
 * 
 * @param {Date|string|number} date - التاريخ المراد تحويله
 * @param {string} locale - رمز اللغة ('ar' أو 'en')
 * @param {number} dayOffset - تعديل إثبات رؤية الهلال (+1 أو -1 يوم)
 * @returns {string} النص المنسق للتاريخ الهجري
 */
export const formatHijriDate = (date = new Date(), locale = 'ar', dayOffset = 0) => {
  const targetDate = toSafeDate(date);

  if (!targetDate) {
    console.warn("[dateUtils] formatHijriDate: تم تمرير تاريخ غير صالح");
    return "";
  }

  // تطبيق تعديل رؤية الهلال إذا وجد
  if (dayOffset !== 0) {
    targetDate.setDate(targetDate.getDate() + dayOffset);
  }

  const isArabic = Boolean(locale && String(locale).toLowerCase().startsWith('ar'));

  try {
    const parts = getHijriParts(targetDate);
    if (!parts) throw new Error("تعذر تحليل أجزاء التاريخ الهجري");

    const { day, monthNum, year } = parts;

    if (isArabic) {
      const monthName = HIJRI_MONTHS_AR[monthNum - 1] || "";
      return `${day} ${monthName} ${year} هـ`;
    } else {
      const monthName = HIJRI_MONTHS_EN[monthNum - 1] || "";
      return `${monthName} ${day}, ${year} AH`;
    }
  } catch (error) {
    console.error("[dateUtils] Error formatting Hijri date:", error);
    return "";
  }
};

/**
 * تنسيق التاريخ الميلادي
 * 
 * @param {Date|string|number} date 
 * @param {string} locale - ('ar' أو 'en')
 * @returns {string} التاريخ الميلادي المنسق
 */
export const formatGregorianDate = (date = new Date(), locale = 'ar') => {
  const targetDate = toSafeDate(date);
  if (!targetDate) return "";

  const isArabic = Boolean(locale && String(locale).toLowerCase().startsWith('ar'));

  try {
    return new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(targetDate);
  } catch (error) {
    console.error("[dateUtils] Error formatting Gregorian date:", error);
    return targetDate.toLocaleDateString();
  }
};

/**
 * تنسيق الوقت اللحظي (ساعة : دقيقة : ثانية)
 * 
 * @param {Date|string|number} date 
 * @param {string} locale - ('ar' أو 'en')
 * @returns {string} الوقت المنسق
 */
export const formatLiveTime = (date = new Date(), locale = 'ar') => {
  const targetDate = toSafeDate(date);
  if (!targetDate) return "";

  const isArabic = Boolean(locale && String(locale).toLowerCase().startsWith('ar'));

  try {
    return targetDate.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    console.error("[dateUtils] Error formatting Live Time:", error);
    return targetDate.toLocaleTimeString();
  }
};

/**
 * التصدير الافتراضي لشمل كافة الأدوات
 */
const dateUtils = {
  HIJRI_MONTHS_AR,
  HIJRI_MONTHS_EN,
  toSafeDate,
  isValidDate,
  formatHijriDate,
  formatGregorianDate,
  formatLiveTime,
};

export default dateUtils;
