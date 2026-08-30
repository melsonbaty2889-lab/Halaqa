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
  const strVal = String(val).toLowerCase();
  
  if (t?.values && t.values[strVal] !== undefined) {
    return t.values[strVal];
  }
  
  if (typeof val === 'boolean') return val ? (t?.values?.true || 'نعم') : (t?.values?.false || 'لا');
  if (typeof val === 'string' || typeof val === 'number') return String(val);

  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map(item => toHumanValue(item, t)).filter(Boolean).join(', ');
    }
    if (val.ar) return toHumanValue(val.ar, t);
    if (val.en) return toHumanValue(val.en, t);
    try {
      return JSON.stringify(val);
    } catch {
      return '';
    }
  }
  return String(val);
};
