/* src/constants/staffTitles.js */

export const getStaffTitles = (t) => [
  { value: 'quran_teacher', label: t ? t('staff.titles.quranTeacher', 'معلّم قرآن كريم وتسميع') : 'معلّم قرآن كريم وتسميع' },
  { value: 'sanad_teacher', label: t ? t('staff.titles.sanadTeacher', 'مقرئ ومجيز بالسند والقراءات') : 'مقرئ ومجيز بالسند والقراءات' },
  { value: 'nouraniyah_teacher', label: t ? t('staff.titles.nouraniyahTeacher', 'معلّم تأسيس وقاعدة نورانية') : 'معلّم تأسيس وقاعدة نورانية' },
  { value: 'islamic_studies_teacher', label: t ? t('staff.titles.islamicStudies', 'معلّم مواد شرعية وعربية') : 'معلّم مواد شرعية وعربية' },
  { value: 'admin', label: t ? t('staff.titles.admin', 'مدير الأكاديمية') : 'مدير الأكاديمية' }
];

/**
 * دالة مساعدة لجلب تسمية المسمى الوظيفي المترجم بناءً على قيمته
 */
export const getStaffTitleLabel = (titleValue, t) => {
  const titles = getStaffTitles(t);
  const found = titles.find(item => item.value === titleValue);
  return found ? found.label : (titleValue || 'معلّم');
};
