// src/components/Logs/logs.config.js

// القائمة البيضاء/السوداء للمفاتيح التقنية
export const TECHNICAL_KEYS = [
  'id', 'created_at', 'updated_at', 'student_id', 'group_id', 
  'halaqa_id', 'academy_id', 'user_id', 'changed_by', 'parent_id',
  'added_by', 'avatar_url', 'level_score', 'current_surah_id', 
  'last_payment_date', 'next_payment_date', 'last_activity_date',
  'current_quarter_index', 'freeze_cards_remaining', 'badges', 'record_id'
];

// دالة تحويل القيم للغة مفهومة وآمنة ضد [object Object]
export const toHumanValue = (val, t) => {
  if (val === null || val === undefined || val === '' || val === '{}') return '—';

  // 1. التعامل مع القيم البولينية (Boolean)
  if (typeof val === 'boolean') {
    if (t && typeof t === 'function') {
      const translated = t(val ? 'values.true' : 'values.false', { defaultValue: val ? 'نعم' : 'لا' });
      return typeof translated === 'string' ? translated : (val ? 'نعم' : 'لا');
    }
    return val ? 'نعم' : 'لا';
  }

  // 2. التعامل مع الكائنات والمصفوفات (Objects & Arrays)
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      if (val.length === 0) return '—';
      return val.map(item => toHumanValue(item, t)).filter(Boolean).join(', ');
    }
    
    // استخراج النصوص المباشرة من الترجمات أو المعرفات
    if (typeof val.ar === 'string' && val.ar.trim() !== '') return val.ar;
    if (typeof val.en === 'string' && val.en.trim() !== '') return val.en;
    if (typeof val.full_name === 'string' && val.full_name.trim() !== '') return val.full_name;
    if (typeof val.name === 'string' && val.name.trim() !== '') return val.name;
    if (typeof val.title === 'string' && val.title.trim() !== '') return val.title;

    try {
      return JSON.stringify(val);
    } catch {
      return '—';
    }
  }

  // 3. التعامل مع التواريخ بصيغة ISO
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}(T|\b)/.test(val)) {
    const dateObj = new Date(val);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  // 4. التعامل مع النصوص والأرقام والترجمات المباشرة عبر i18next
  const strVal = String(val).trim();
  const lowerKey = strVal.toLowerCase();

  // محاولة جلب الترجمة من مفتاح values.key عبر دالة t الآمنة
  if (t && typeof t === 'function') {
    const translationKey = `values.${lowerKey}`;
    const translated = t(translationKey, { defaultValue: '' });
    if (translated && typeof translated === 'string' && translated !== translationKey) {
      return translated;
    }
    if (typeof translated === 'object') {
      return translated?.ar || translated?.en || strVal;
    }
  }

  return strVal;
};
