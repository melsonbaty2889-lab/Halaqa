export const getLocalizedContent = (value, currentLang = 'ar', getLocalizedText = null) => {
  if (!value) return '';
  
  if (typeof getLocalizedText === 'function') {
    try {
      const result = getLocalizedText(value);
      if (result) return result;
    } catch (e) {
      console.warn('Error in getLocalizedText:', e);
    }
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'object' && value !== null) {
    return value[currentLang] || value.ar || value.en || value.fr || value.tr || value.ur || value.id || '';
  }

  return '';
};

/**
 * خيارات المسارات التعليمية المعتمدة (مربوطة بقاعدة البيانات)
 */
export const getTrackOptions = (t) => [
  { value: 'all', label: t('allTracks', 'جميع المسارات التعليمية') },
  { value: 'hifz', label: t('trackHifz', 'حفظ القرآن الكريم وتجويده') },
  { value: 'muraja', label: t('trackMuraja', 'المراجعة والتثبيت') },
  { value: 'tilawah', label: t('trackTilawah', 'التلاوة وتصحيح القراءة') },
  { value: 'ijazah', label: t('trackIjazah', 'الإجازة بالسند المتصل') },
  { value: 'mutun', label: t('trackMutun', 'المتون العلمية والتجويد النظرى') }
];

/**
 * خيارات الفئات المستهدفة
 */
export const getTargetAudienceOptions = (t) => [
  { value: 'all', label: t('audienceAll', 'جميع الفئات') },
  { value: 'kids', label: t('audienceKids', 'الأطفال') },
  { value: 'males', label: t('audienceMales', 'الرجال / الذكور') },
  { value: 'females', label: t('audienceFemales', 'النساء / الإناث') }
];

/**
 * نمط انعقاد الحلقة (مطابق لشرط halaqas_teaching_type_check في قاعدة البيانات)
 */
export const getHalaqaTypeOptions = (t) => [
  { value: 'online', label: t('typeOnline', 'عن بُعد (أونلاين)') },
  { value: 'offline', label: t('typeOffline', 'حضوري (في المقر / المسجد)') }
];
