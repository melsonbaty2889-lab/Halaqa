/* src/constants/ijazat.js */

// أشهر وأغلبية الإجازات القرآنية المعتمدة
export const getIjazatOptions = (t) => [
  {
    id: 'hafs_asim',
    label: t ? t('ijazat.hafsAsim', 'إجازة برواية حفص عن عاصم') : 'إجازة برواية حفص عن عاصم'
  },
  {
    id: 'warsh_nafi',
    label: t ? t('ijazat.warshNafi', 'إجازة برواية ورش عن نافع') : 'إجازة برواية ورش عن نافع'
  },
  {
    id: 'qalun_nafi',
    label: t ? t('ijazat.qalunNafi', 'إجازة برواية قالون عن نافع') : 'إجازة برواية قالون عن نافع'
  },
  {
    id: 'qiraat_sab',
    label: t ? t('ijazat.qiraatSab', 'إجازة بالقراءات السبع') : 'إجازة بالقراءات السبع'
  },
  {
    id: 'qiraat_ashr_sughra',
    label: t ? t('ijazat.qiraatAshrSughra', 'إجازة بالقراءات العشر الصغرى') : 'إجازة بالقراءات العشر الصغرى'
  },
  {
    id: 'qiraat_ashr_kubra',
    label: t ? t('ijazat.qiraatAshrKubra', 'إجازة بالقراءات العشر الكبرى') : 'إجازة بالقراءات العشر الكبرى'
  },
  {
    id: 'other_riwayat',
    label: t ? t('ijazat.otherRiwayat', 'روايات وإجازات أخرى') : 'روايات وإجازات أخرى'
  }
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
