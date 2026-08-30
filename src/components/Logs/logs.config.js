// logs.config.js

// القائمة البيضاء/السوداء للمفاتيح التقنية
export const TECHNICAL_KEYS = [
  'id', 'created_at', 'updated_at', 'student_id', 'group_id', 
  'halaqa_id', 'academy_id', 'user_id', 'changed_by', 'parent_id',
  'added_by', 'avatar_url', 'level_score', 'current_surah_id', 
  'last_payment_date', 'next_payment_date', 'last_activity_date',
  'current_quarter_index', 'freeze_cards_remaining', 'badges', 'record_id'
];

// دالة تحويل القيم للغة مفهومة
export const toHumanValue = (val, t) => {
  if (val === null || val === undefined || val === '' || val === '{}') return '—';

  // 1. التعامل مع القيم البولينية (Boolean)
  if (typeof val === 'boolean') {
    return val ? (t ? t('values.true', 'نعم') : 'نعم') : (t ? t('values.false', 'لا') : 'لا');
  }

  // 2. التعامل مع الكائنات والمصفوفات (Objects & Arrays)
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map(item => toHumanValue(item, t)).filter(Boolean).join(', ');
    }
    if (val.ar || val.en) {
      return toHumanValue(val.ar || val.en, t);
    }
    try {
      return JSON.stringify(val);
    } catch {
      return '—';
    }
  }

  // 3. التعامل مع النصوص والأرقام والترجمات المباشرة عبر i18next
  const strVal = String(val).trim();
  const lowerKey = strVal.toLowerCase();

  // محاولة جلب الترجمة من مفتاح values.key عبر دالة t الآمنة
  if (t && typeof t === 'function') {
    const translationKey = `values.${lowerKey}`;
    const translated = t(translationKey, { defaultValue: '' });
    if (translated && translated !== translationKey) {
      return translated;
    }
  }

  return strVal;
};
