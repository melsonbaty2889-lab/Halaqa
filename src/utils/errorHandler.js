/**
 * Centralized error handling utility
 * Maps Supabase and app errors to user-friendly messages
 * Logs errors for debugging and monitoring
 */

const ERROR_MESSAGE_MAP = {
  'Email not confirmed': 'يرجى تفعيل بريدك الإلكتروني أولاً',
  'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'User already registered': 'هذا البريد الإلكتروني مسجل بالفعل',
  'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  'Invalid email': 'البريد الإلكتروني غير صحيح',
  'Unexpected end of JSON input': 'خطأ في الاتصال. يرجى المحاولة لاحقاً',
  'Failed to fetch': 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت',
  'PGRST116 Unknown resource': 'المورد المطلوب غير موجود',
};

/**
 * Handle and translate errors
 * @param {Error|object} error - The error object
 * @param {string} context - Where the error occurred (for logging)
 * @param {boolean} isArabic - Whether to return Arabic or English message
 * @returns {string} User-friendly error message
 */
export const handleError = (error, context = 'Unknown', isArabic = true) => {
  let errorMessage = error?.message || 'حدث خطأ غير متوقع';
  
  // Check if error message exists in our map
  const mappedMessage = ERROR_MESSAGE_MAP[errorMessage];
  const userMessage = mappedMessage || (
    isArabic 
      ? 'حدث خطأ. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني'
      : 'An error occurred. Please try again later or contact support'
  );

  // Log error for debugging (in production, send to error tracking service)
  console.error(`[${context}] Error:`, {
    message: errorMessage,
    fullError: error,
    timestamp: new Date().toISOString(),
  });

  return userMessage;
};

/**
 * Format Supabase auth errors specifically
 * @param {Error} error - Supabase auth error
 * @param {boolean} isArabic - Language preference
 * @returns {string} Localized error message
 */
export const handleAuthError = (error, isArabic = true) => {
  const authErrors = {
    'Email not confirmed': isArabic 
      ? 'يرجى تفعيل بريدك الإلكتروني. تفقد صندوق الوارد أو الـ Spam'
      : 'Please verify your email. Check your inbox or spam folder',
    'Invalid login credentials': isArabic
      ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      : 'Invalid email or password',
    'User already registered': isArabic
      ? 'هذا البريد الإلكتروني مسجل بالفعل'
      : 'This email is already registered',
  };

  return authErrors[error?.message] || handleError(error, 'AuthError', isArabic);
};

/**
 * Format database operation errors
 * @param {Error} error - Database error
 * @param {string} operation - What operation failed (e.g., 'insert', 'update')
 * @param {boolean} isArabic - Language preference
 * @returns {string} Localized error message
 */
export const handleDatabaseError = (error, operation = 'operation', isArabic = true) => {
  const operationNames = {
    insert: isArabic ? 'إضافة' : 'adding',
    update: isArabic ? 'تحديث' : 'updating',
    delete: isArabic ? 'حذف' : 'deleting',
    fetch: isArabic ? 'جلب' : 'fetching',
  };

  const operationName = operationNames[operation] || operation;
  
  const message = isArabic
    ? `حدث خطأ أثناء ${operationName} البيانات: ${error?.message || 'خطأ غير معروف'}`
    : `Error ${operationName} data: ${error?.message || 'Unknown error'}`;

  console.error(`[DatabaseError] ${operation}:`, error);
  return message;
};

/**
 * Handle and log errors without user disruption
 * Useful for non-critical operations
 * @param {Error} error - The error
 * @param {string} context - Context for logging
 * @param {Function} fallback - Optional fallback function
 */
export const silentError = (error, context = 'Unknown', fallback = null) => {
  console.warn(`[${context}] Silent error:`, error);
  if (fallback && typeof fallback === 'function') {
    try {
      fallback();
    } catch (e) {
      console.error(`Fallback function failed:`, e);
    }
  }
};

export default handleError;
