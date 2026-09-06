// i18next-parser.config.js
export default {
  // اللغة الافتراضية للترجمة
  defaultNamespace: 'translation',

  // اللغات المعتمدة
  locales: ['ar', 'en', 'fr', 'tr', 'ur', 'id'],

  // المسار الصحيح لإخراج ملفات JSON
  output: 'src/locales/$LOCALE.json',

  // المسارات المستهدفة للاستخراج
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
  ],

  // تعيين القيم الافتراضية لمنع الحقول الفارغة وضمان بقاء المفتاح منظماً
  defaultValue: (locale, namespace, key, value) => {
    // إذا وُجد نص افتراضي في الدالة t('key', 'Default Text')
    if (value) return value;

    // للغة العربية: عدم إرجاع المفتاح كاملاً لتجنب الكائنات المتداخلة التالفة
    if (locale === 'ar') {
      const lastKeyPart = key.split('.').pop();
      return lastKeyPart || key;
    }

    return '';
  },

  // إعدادات الـ Lexers لدعم React / JSX / TSX ومكون Trans
  lexers: {
    js: [{ lexer: 'JsxLexer', functions: ['t', 'i18n.t', 'getText', 'safeT'] }],
    jsx: [{ lexer: 'JsxLexer', functions: ['t', 'i18n.t', 'getText', 'safeT'] }],
    ts: [{ lexer: 'JsxLexer', functions: ['t', 'i18n.t', 'getText', 'safeT'] }],
    tsx: [{ lexer: 'JsxLexer', functions: ['t', 'i18n.t', 'getText', 'safeT'] }],
    default: [{ lexer: 'JsxLexer', functions: ['t', 'i18n.t', 'getText', 'safeT'] }],
  },

  // الدوال المعتمدة لاستخراج النصوص
  functions: ['t', 'i18n.t', 'getText', 'safeT'],

  // دعم مكون <Trans /> الخاص بـ react-i18next
  componentFunctions: ['Trans'],

  // الفواصل الهيكلية (مهمة جداً لـ Plurals والـ Nested Keys)
  keySeparator: '.',
  namespaceSeparator: ':',
  pluralSeparator: '_',
  contextSeparator: '_',

  // ترتيب المفاتيح أبجدياً
  sort: true,

  // عدم مسح الترجمات القديمة تلقائياً (تمنع ضياع البيانات)
  keepRemoved: true,

  // تنسيق ملف JSON
  indentation: 2,

  // دعم وسوم HTML داخل مكون Trans
  transSupportBasicHtmlNodes: true,
  transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span', 'b'],

  // تجاهل تحذيرات المفاتيح المكررة أثناء المسح
  failOnWarnings: false,
  failOnUpdate: false,
};
