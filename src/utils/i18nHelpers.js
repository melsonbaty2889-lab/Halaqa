// src/utils/i18nHelpers.js

/**
 * دالة مساعدة للحصول على النصوص بأمان لمنع أخطاء الترجمة
 * @param {Function} tFunc - دالة الترجمة t
 * @param {string} key - مفتاح النص
 * @param {string} fallback - النص الافتراضي في حال عدم وجود الترجمة
 * @returns {string} النص المترجم أو النص الافتراضي
 */
export const getText = (tFunc, key, fallback) => {
  if (typeof tFunc === 'function') {
    const res = tFunc(key, fallback);
    if (res && res !== key) return res;
  }
  return fallback;
};
