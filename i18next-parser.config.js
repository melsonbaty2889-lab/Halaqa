// i18next-parser.config.js
export default {
  // اللغة الافتراضية
  defaultNamespace: 'translation',

  // اللغات المعتمدة في المشروع
  locales: ['ar', 'en', 'fr', 'tr', 'ur', 'id'],

  // تعيين القيم الافتراضية عند الاستخراج لمنع السلاسل الفارغة ("")
  defaultValue: (locale, namespace, key, value) => {
    // إذا وجد قيم احتياطية (Fallback/Default Text) في دالة الترجمة، استخدمها
    if (value) return value;
    
    // للغة العربية: استخدم المفتاح كقيمة مؤقتة بدلاً من السلسلة الفارغة إذا لم يجد قيم
    if (locale === 'ar') return key;

    // للغات الأخرى: إرجاع السلسلة الفارغة للتعبئة لاحقاً
    return '';
  },

  // محلي ومحلل الأكواد لملفات React و Vite مع دعم safeT و getText
  lexers: {
    js: [
      {
        lexer: 'JsxLexer',
        functions: ['t', 'i18n.t', 'getText', 'safeT'],
      },
    ],
    jsx: [
      {
        lexer: 'JsxLexer',
        functions: ['t', 'i18n.t', 'getText', 'safeT'],
      },
    ],
    ts: [
      {
        lexer: 'JsxLexer',
        functions: ['t', 'i18n.t', 'getText', 'safeT'],
      },
    ],
    tsx: [
      {
        lexer: 'JsxLexer',
        functions: ['t', 'i18n.t', 'getText', 'safeT'],
      },
    ],
    default: [
      {
        lexer: 'JsxLexer',
        functions: ['t', 'i18n.t', 'getText', 'safeT'],
      },
    ],
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

  // السماح بإنشاء كائنات متداخلة (Nested JSON Objects) بناءً على Dot Notation
  keySeparator: '.',
  namespaceSeparator: false,

  // القائمة العامة للدوال المستهدفة
  functions: ['getText', 't', 'i18n.t', 'safeT'],

  // تنسيق ملف الـ JSON الناتج
  indentation: 2,

  // دعم وسوم HTML البسيطة داخل النصوص المترجمة
  transSupportBasicHtmlNodes: true,
  transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
};
