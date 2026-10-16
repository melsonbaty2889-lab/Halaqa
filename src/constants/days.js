/* src/constants/days.js */

export const getDaysOptions = (t) => [
  { value: 'Saturday', label: t ? t('days.saturday', 'السبت') : 'السبت' },
  { value: 'Sunday', label: t ? t('days.sunday', 'الأحد') : 'الأحد' },
  { value: 'Monday', label: t ? t('days.monday', 'الإثنين') : 'الإثنين' },
  { value: 'Tuesday', label: t ? t('days.tuesday', 'الثلاثاء') : 'الثلاثاء' },
  { value: 'Wednesday', label: t ? t('days.wednesday', 'الأربعاء') : 'الأربعاء' },
  { value: 'Thursday', label: t ? t('days.thursday', 'الخميس') : 'الخميس' },
  { value: 'Friday', label: t ? t('days.friday', 'الجمعة') : 'الجمعة' },
];
