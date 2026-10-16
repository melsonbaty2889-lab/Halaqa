/* src/constants/ijazat.js */

// أشهر وأهم الإجازات القرآنية والعلمية المعتمدة
export const getIjazatOptions = (t) => [
  // 1. أشهر الروايات المنفردة
  { id: 'hafs_asim', label: t ? t('ijazat.hafsAsim', 'حفص عن عاصم') : 'حفص عن عاصم' },
  { id: 'warsh_nafi', label: t ? t('ijazat.warshNafi', 'ورش عن نافع') : 'ورش عن نافع' },
  { id: 'qalun_nafi', label: t ? t('ijazat.qalunNafi', 'قالون عن نافع') : 'قالون عن نافع' },
  { id: 'duri_abi_amr', label: t ? t('ijazat.duriAbiAmr', 'الدوري عن أبي عمرو') : 'الدوري عن أبي عمرو' },

  // 2. إجازات جمع القراءات
  { id: 'qiraat_sab', label: t ? t('ijazat.qiraatSab', 'القراءات السبع') : 'القراءات السبع' },
  { id: 'qiraat_ashr_sughra', label: t ? t('ijazat.qiraatAshrSughra', 'العشر الصغرى (الشاطبية والدرة)') : 'العشر الصغرى (الشاطبية والدرة)' },
  { id: 'qiraat_ashr_kubra', label: t ? t('ijazat.qiraatAshrKubra', 'العشر الكبرى (طيبة النشر)') : 'العشر الكبرى (طيبة النشر)' },

  // 3. إجازات المتون العلمية التجويدية
  { id: 'jazariyyah', label: t ? t('ijazat.jazariyyah', 'المقدمة الجزرية') : 'المقدمة الجزرية' },
  { id: 'tuhfat_atfal', label: t ? t('ijazat.tuhfatAtfal', 'تحفة الأطفال') : 'تحفة الأطفال' },
  { id: 'shatibiyyah', label: t ? t('ijazat.shatibiyyah', 'متن الشاطبية') : 'متن الشاطبية' },

  // 4. إجازات أخرى عامة
  { id: 'other_riwayat', label: t ? t('ijazat.otherRiwayat', 'روايات قرآنية أخرى') : 'روايات قرآنية أخرى' },
  { id: 'general_sanad', label: t ? t('ijazat.generalSanad', 'إجازة عامة في الحديث والسنة') : 'إجازة عامة في الحديث والسنة' }
];

/**
 * دالة مساعدة لجلب تسمية الإجازة المترجمة بناءً على معرفها
 */
export const getIjazaLabel = (ijazaId, t) => {
  const list = getIjazatOptions(t);
  const found = list.find(item => item.id === ijazaId);
  return found ? found.label : (ijazaId || '');
};

export default getIjazatOptions;
