/**
 * مكتبة التنسيق الموحدة والمستقبلية لتطبيق سمارت حلقة (Smart Halaqa)
 * تدعم المعايير الدولية (Intl) والتعدد اللغوي الكامل.
 */

// 1. تنسيق الأسماء وتعدد اللغات
export const formatName = (name, lang = 'ar', fallback = 'غير محدد') => {
  if (!name) return fallback;
  
  let resultName = fallback;
  if (typeof name === 'string') {
    resultName = name;
  } else if (typeof name === 'object') {
    resultName = name[lang] || name['ar'] || name['en'] || Object.values(name)[0] || fallback;
  }

  // تنظيف المسافات الزائدة
  return resultName.trim().replace(/\s+/g, ' ');
};

// اقتطاع الاسم الأول والأخير فقط للبطاقات المصغرة
export const formatShortName = (name, lang = 'ar') => {
  const fullName = formatName(name, lang);
  const parts = fullName.split(' ');
  if (parts.length <= 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

// 2. تنسيق الأرقام والنسب والعملات دولياً
export const formatNumber = (number, locale = 'ar-EG', options = {}) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  return new Intl.NumberFormat(locale, options).format(number);
};

export const formatCurrency = (amount, currency = 'EGP', locale = 'ar-EG') => {
  if (amount === null || amount === undefined || isNaN(amount)) amount = 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercent = (value, locale = 'ar-EG', decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) value = 0;
  // تحويل القيمة إذا كانت مدخلة بنسبة 100 بدلاً من 1.0
  const normalizedValue = value > 1 ? value / 100 : value;
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: decimals,
  }).format(normalizedValue);
};

// 3. تنسيق الهواتف الدولية
export const formatPhoneNumber = (phone, defaultCountryCode = '+20') => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith('0')) return `${defaultCountryCode}${cleaned.slice(1)}`;
  
  return `${defaultCountryCode}${cleaned}`;
};

// 4. تنسيق الآيات والسور والأجزاء القرآ نية
export const formatAyahRange = (surahName, startAyah, endAyah, lang = 'ar') => {
  if (!surahName) return '';
  const surah = typeof surahName === 'object' ? formatName(surahName, lang) : surahName;
  
  if (!startAyah) return surah;
  if (!endAyah || startAyah === endAyah) {
    return lang === 'ar' ? `${surah}: آية ${startAyah}` : `${surah}: Ayah ${startAyah}`;
  }
  return lang === 'ar' 
    ? `${surah}: من آية ${startAyah} إلى ${endAyah}` 
    : `${surah}: Ayah ${startAyah}-${endAyah}`;
};

// 5. اقتطاع النصوص وحجم الملفات
export const truncateText = (text, maxLength = 50, fallback = '') => {
  if (!text) return fallback;
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
};

export const formatFileSize = (bytes, lang = 'ar') => {
  if (!bytes || bytes === 0) return lang === 'ar' ? '0 بايت' : '0 Bytes';
  const k = 1024;
  const sizes = lang === 'ar' 
    ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'] 
    : ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${formatNumber(size, lang === 'ar' ? 'ar-EG' : 'en-US')} ${sizes[i]}`;
};
