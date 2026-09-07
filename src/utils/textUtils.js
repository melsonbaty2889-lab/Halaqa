/**
 * دالة موحدة لاستخراج النصوص المترجمة بأمان مع نص افتراضي
 */
export const getText = (t, key, fallback) => {
  if (!t) return fallback;
  const translated = t(key, fallback);
  return translated || fallback;
};
