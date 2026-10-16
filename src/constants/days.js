/* src/constants/days.js */

/**
 * قائمة أيام الأسبوع مع دعم الترجمة الفورية
 * @param {Function} t - دالة الترجمة i18next
 * @returns {Array} مصفوفة خيارات الأيام
 */
export const getDaysOptions = (t) => [
  { value: 'Saturday', label: t ? t('days.saturday', 'السبت') : 'السبت', short: t ? t('days.sat', 'سبت') : 'سبت' },
  { value: 'Sunday', label: t ? t('days.sunday', 'الأحد') : 'الأحد', short: t ? t('days.sun', 'أحد') : 'أحد' },
  { value: 'Monday', label: t ? t('days.monday', 'الإثنين') : 'الإثنين', short: t ? t('days.mon', 'إثنين') : 'إثنين' },
  { value: 'Tuesday', label: t ? t('days.tuesday', 'الثلاثاء') : 'الثلاثاء', short: t ? t('days.tue', 'ثلاثاء') : 'ثلاثاء' },
  { value: 'Wednesday', label: t ? t('days.wednesday', 'الأربعاء') : 'الأربعاء', short: t ? t('days.wed', 'أربعاء') : 'أربعاء' },
  { value: 'Thursday', label: t ? t('days.thursday', 'الخميس') : 'الخميس', short: t ? t('days.thu', 'خميس') : 'خميس' },
  { value: 'Friday', label: t ? t('days.friday', 'الجمعة') : 'الجمعة', short: t ? t('days.fri', 'جمعة') : 'جمعة' },
];

/**
 * دالة مساعدة لجلب اسم اليوم المترجم بناءً على قيمته (Value)
 * @param {String} dayValue - قيمة اليوم باللغة الإنجليزية (مثل 'Saturday')
 * @param {Function} t - دالة الترجمة i18next
 * @returns {String} اسم اليوم المترجم
 */
export const getDayLabel = (dayValue, t) => {
  const options = getDaysOptions(t);
  const found = options.find(d => d.value.toLowerCase() === String(dayValue || '').toLowerCase());
  return found ? found.label : dayValue;
};

/**
 * خريطة سريعة (Dictionary) للأيام للوصول المباشر
 */
export const DAYS_ENUM = {
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
};
