/* src/components/Halaqat/HalaqaConstants.js */

/**
 * دالة جلب النص المترجم بمرونة حسب اللغة الحالية واللغات الست المعتمدة
 */
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
    return (
      value[currentLang] ||
      value.ar ||
      value.en ||
      value.fr ||
      value.tr ||
      value.ur ||
      value.id ||
      Object.values(value)[0] ||
      ''
    );
  }

  return String(value);
};

/**
 * المسارات التعليمية الأساسية (تستخدم في نماذج الإنشاء والتعديل)
 */
export const getTrackOptions = (t) => [
  { value: 'hifz', label: typeof t === 'function' ? t('trackHifz', 'حفظ القرآن الكريم وتجويده') : 'حفظ القرآن الكريم وتجويده' },
  { value: 'muraja', label: typeof t === 'function' ? t('trackMuraja', 'المراجعة والتثبيت') : 'المراجعة والتثبيت' },
  { value: 'tilawah', label: typeof t === 'function' ? t('trackTilawah', 'التلاوة وتصحيح القراءة') : 'التلاوة وتصحيح القراءة' },
  { value: 'ijazah', label: typeof t === 'function' ? t('trackIjazah', 'الإجازة بالسند المتصل') : 'الإجازة بالسند المتصل' },
  { value: 'mutun', label: typeof t === 'function' ? t('trackMutun', 'المتون العلمية والتجويد النظري') : 'المتون العلمية والتجويد النظري' },
  { value: 'general', label: typeof t === 'function' ? t('trackGeneral', 'الحلقة الشاملة (حفظ + مراجعة + درس تربوي)') : 'الحلقة الشاملة (حفظ + مراجعة + درس تربوي)' }
];

/**
 * مسارات الفلترة (تستخدم في شريط الفلترة فقط عبر إضافة خيار "الكل")
 */
export const getFilterTrackOptions = (t) => [
  { value: 'all', label: typeof t === 'function' ? t('allTracks', 'جميع المسارات التعليمية') : 'جميع المسارات التعليمية' },
  ...getTrackOptions(t)
];

/**
 * الفئات المستهدفة الأساسية (تستخدم في النماذج)
 */
export const getTargetAudienceOptions = (t) => [
  { value: 'kids', label: typeof t === 'function' ? t('audienceKids', 'الأطفال') : 'الأطفال' },
  { value: 'males', label: typeof t === 'function' ? t('audienceMales', 'الرجال / الذكور') : 'الرجال / الذكور' },
  { value: 'females', label: typeof t === 'function' ? t('audienceFemales', 'النساء / الإناث') : 'النساء / الإناث' }
];

/**
 * فئات الفلترة المستهدفة (تستخدم في الفلاتر)
 */
export const getFilterTargetAudienceOptions = (t) => [
  { value: 'all', label: typeof t === 'function' ? t('audienceAll', 'جميع الفئات') : 'جميع الفئات' },
  ...getTargetAudienceOptions(t)
];

/**
 * نمط انعقاد الحلقة (مطابق لشرط halaqas_teaching_type_check في قاعدة البيانات)
 */
export const getHalaqaTypeOptions = (t) => [
  { value: 'online', label: typeof t === 'function' ? t('typeOnline', 'عن بُعد (أونلاين)') : 'عن بُعد (أونلاين)' },
  { value: 'offline', label: typeof t === 'function' ? t('typeOffline', 'حضوري (في المقر / المسجد)') : 'حضوري (في المقر / المسجد)' }
];
