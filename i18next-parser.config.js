module.exports = {
  // اللغة الافتراضية
  defaultNamespace: 'translation',

  // اللغات المعتمدة في المشروع
  locales: ['ar', 'en', 'fr', 'tr', 'ur', 'id'],

  // محلي ومحلل الأكواد لملفات React و Vite
  lexers: {
    js: ['JsxLexer'],
    jsx: ['JsxLexer'],
    ts: ['JsxLexer'],
    tsx: ['JsxLexer'],
    default: ['JsxLexer'],
  },

  // مسار حفظ وتحديث ملفات الـ JSON لكل لغة
  output: 'src/locales/$LOCALE.json',

  // المسارات التي سيتم مسحها داخل المشروع
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}', // استبعاد ملفات الاختبار
  ],

  // ترتيب المفاتيح أبجدياً لسهولة القراءة والمراجعة على GitHub
  sort: true,

  // عدم مسح الترجمات القديمة التي لم تعد مستخدمة مؤقتاً
  keepRemoved: true,

  // عدم تقسيم المفاتيح عبر النقاط لضمان ثبات النصوص
  keySeparator: false,
  namespaceSeparator: false,

  // التعرف على الدوال المستخدمة في المشروع لاستخراج النصوص منها
  functions: ['getText', 't', 'i18n.t'],

  // تنسيق ملف الـ JSON الناتج
  indentation: 2,

  // دعم وسوم HTML البسيطة داخل النصوص المترجمة
  transSupportBasicHtmlNodes: true,
  transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
};
