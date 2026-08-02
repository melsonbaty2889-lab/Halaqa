/**
 * تنسيق وترجمة أسماء الطلاب والحلقات لدعم النصوص العادية أو كائنات JSONB.
 * 
 * @param {string|object} name - الاسم المراد تنسيقه (إما نص أو JSON)
 * @param {string} lang - اللغة المطلوبة ('ar' أو 'en')
 * @param {string} fallback - النص الافتراضي في حال عدم وجود قيمة
 * @returns {string} الاسم المنسق
 */
export const formatName = (name, lang = 'ar', fallback = 'غير محدد') => {
  if (!name) return fallback;
  if (typeof name === 'string') return name;
  if (typeof name === 'object') {
    return name[lang] || name['ar'] || name['en'] || Object.values(name)[0] || fallback;
  }
  return fallback;
};
