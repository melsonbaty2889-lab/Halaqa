// src/constants/staffTitles.js

export const getStaffTitles = (t) => [
  { value: 'quran_teacher', label: t('staff.titles.quranTeacher', 'معلّم قرآن كريم وتسميع') },
  { value: 'sanad_teacher', label: t('staff.titles.sanadTeacher', 'مقرئ ومجيز بالسند والقراءات') },
  { value: 'nouraniyah_teacher', label: t('staff.titles.nouraniyahTeacher', 'معلّم تأسيس وقاعدة نورانية') },
  { value: 'islamic_studies_teacher', label: t('staff.titles.islamicStudies', 'معلّم مواد شرعية وعربية') },
  { value: 'admin', label: t('staff.titles.admin', 'مدير الأكاديمية') }
];
