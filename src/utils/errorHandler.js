/**
 * مكتبة معالجة وترجمة الأخطاء المركزية
 * تطبيق سمارت حلقة (Smart Halaqa)
 */

// قاموس الأخطاء الشائعة المترجم
const ERROR_DICTIONARY = {
  // أخطاء الهوية والمصادقة (Auth Errors)
  'Email not confirmed': {
    ar: 'يرجى تفعيل بريدك الإلكتروني أولاً عبر الرابط المرسل لبريدك',
    en: 'Please verify your email address first via the link sent to your inbox'
  },
  'Invalid login credentials': {
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    en: 'Invalid email or password'
  },
  'User already registered': {
    ar: 'هذا البريد الإلكتروني مسجل بالفعل لدينا',
    en: 'This email is already registered'
  },
  'Password should be at least 6 characters': {
    ar: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام',
    en: 'Password should be at least 6 characters long'
  },
  'Invalid email': {
    ar: 'صيغة البريد الإلكتروني غير صالحة',
    en: 'Invalid email address format'
  },

  // أخطاء قاعدة البيانات والأنظمة (Database & API Errors)
  'Failed to fetch': {
    ar: 'تعذر الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت',
    en: 'Failed to connect to server. Check your internet connection'
  },
  'Unexpected end of JSON input': {
    ar: 'حدث خطأ في استجابة الخادم. يرجى إعادة المحاولة',
    en: 'Server response error. Please try again'
  },
  'PGRST116 Unknown resource': {
    ar: 'العنصر أو المورد المطلوب غير موجود',
    en: 'The requested resource was not found'
  },
  '23505': {
    ar: 'هذا السجل موجود بالفعل ومكرر',
    en: 'This record already exists'
  }
};

/**
 * 1. معالجة وترجمة الأخطاء العامة
 * @param {Error|object|string} error - كائن الخطأ أو النص
 * @param {string} context - موضع سياق الخطأ لتتبعه
 * @param {string|boolean} langOrIsArabic - اللغة ('ar' / 'en')
 */
export const handleError = (error, context = 'General', langOrIsArabic = 'ar') => {
  const isAr = typeof langOrIsArabic === 'boolean' ? langOrIsArabic : String(langOrIsArabic).startsWith('ar');
  const langKey = isAr ? 'ar' : 'en';

  const rawMessage = error?.message || error?.code || (typeof error === 'string' ? error : '');

  // البحث في قاموس الأخطاء
  const mapped = ERROR_DICTIONARY[rawMessage];
  const userMessage = mapped ? mapped[langKey] : (
    isAr 
      ? 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً أو مراجعة الدعم الفني' 
      : 'An unexpected error occurred. Please try again or contact support'
  );

  // تسجيل التفاصيل التقنية في بيئة التطوير
  console.error(`[${context}] Error:`, {
    rawMessage,
    fullError: error,
    timestamp: new Date().toISOString()
  });

  return userMessage;
};

/**
 * 2. معالجة أخطاء عمليات قاعدة البيانات (إضافة/تعديل/حذف/جلب)
 */
export const handleDatabaseError = (error, operation = 'operation', lang = 'ar') => {
  const isAr = String(lang).startsWith('ar');

  const operationNames = {
    insert: isAr ? 'إضافة' : 'adding',
    update: isAr ? 'تحديث' : 'updating',
    delete: isAr ? 'حذف' : 'deleting',
    fetch: isAr ? 'جلب' : 'fetching',
  };

  const opName = operationNames[operation] || operation;
  const translatedError = handleError(error, `Database:${operation}`, lang);

  return isAr
    ? `خطأ أثناء ${opName} البيانات: ${translatedError}`
    : `Error while ${opName} data: ${translatedError}`;
};

/**
 * 3. المعالجة الصامتة للأخطاء الثانوية (دون قطع تجربة المستخدم)
 */
export const silentError = (error, context = 'Background', fallback = null) => {
  console.warn(`[${context}] Silent Error Caught:`, error);
  if (typeof fallback === 'function') {
    try {
      fallback();
    } catch (e) {
      console.error(`Fallback execution failed in ${context}:`, e);
    }
  }
};

export default handleError;
