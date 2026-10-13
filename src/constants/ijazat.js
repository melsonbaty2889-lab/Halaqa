/* src/constants/ijazat.js */

// أنواع الإجازات التي يمكن للمعلم الحصول عليها
export const getIjazatOptions = (t) => [
  {
    id: 'hafs_asim',
    label: t('ijazat.hafsAsim', 'إجازة برواية حفص عن عاصم')
  },
  {
    id: 'warsh_nafi',
    label: t('ijazat.warshNafi', 'إجازة برواية ورش عن نافع')
  },
  {
    id: 'qalun_nafi',
    label: t('ijazat.qalunNafi', 'إجازة برواية قالون عن نافع')
  },
  {
    id: 'other_riwayat',
    label: t('ijazat.otherRiwayat', 'إجازة برواية قرآنية أخرى')
  },
  {
    id: 'qiraat_sab',
    label: t('ijazat.qiraatSab', 'إجازة بالقراءات السبع')
  },
  {
    id: 'qiraat_ashr_sughra',
    label: t('ijazat.qiraatAshrSughra', 'إجازة بالقراءات العشر الصغرى')
  },
  {
    id: 'qiraat_ashr_kubra',
    label: t('ijazat.qiraatAshrKubra', 'إجازة بالقراءات العشر الكبرى')
  },
  {
    id: 'tajweed',
    label: t('ijazat.tajweed', 'إجازة في التجويد')
  },
  {
    id: 'jazariyyah',
    label: t('ijazat.jazariyyah', 'إجازة بمتن المقدمة الجزرية')
  },
  {
    id: 'tuhfat_atfal',
    label: t('ijazat.tuhfatAtfal', 'إجازة بمتن تحفة الأطفال')
  },
  {
    id: 'other_matun',
    label: t('ijazat.otherMatun', 'إجازة بمتون علمية أخرى')
  },
  {
    id: 'other_ijazah',
    label: t('ijazat.otherIjazah', 'إجازة أخرى')
  }
];

export default getIjazatOptions;
