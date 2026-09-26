// src/utils/formatters.js
import { RIWAYAT_MAP } from '@/constants/riwayat';
import { COUNTRIES_MAP, COUNTRIES_LIST } from '@/constants/countries';

// ==========================================
// 1. تنسيق الأسماء وتعدد اللغات
// ==========================================
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

// ==========================================
// 2. تنسيق الأرقام والنسب والعملات دولياً
// ==========================================
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

// ==========================================
// 3. تنسيق وتوحيد الهواتف (للعرض وللتخزين وللاستمارات)
// ==========================================

/**
 * دالة الكشف الذكي والحيادي عن كود دولة المستخدم اعتماداً على المنطقة الزمنية ولغة المتصفح
 */
export const detectUserCountryCode = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const exactMatch = (COUNTRIES_LIST || []).find((c) => c.timezone === tz);
      if (exactMatch) return exactMatch.code;

      const tzCity = tz.split('/')[1];
      if (tzCity) {
        const partialMatch = (COUNTRIES_LIST || []).find(
          (c) => c.timezone && c.timezone.split('/')[1] === tzCity
        );
        if (partialMatch) return partialMatch.code;
      }
    }

    const lang = navigator.language || (navigator.languages && navigator.languages[0]);
    if (lang && lang.includes('-')) {
      const countryCodeFromLang = lang.split('-')[1].toUpperCase();
      const langMatch = (COUNTRIES_LIST || []).find((c) => c.code === countryCodeFromLang);
      if (langMatch) return langMatch.code;
    }
  } catch {
    // تجاهل الأخطاء
  }

  return '';
};

/**
 * دالة تفكيك رقم الهاتف الكامل إلى كود الدولة والرقم المحلي (تستخدم داخل المودالات واستمارات الإدخال)
 */
export const parsePhoneNumber = (rawPhone = '') => {
  if (!rawPhone) return { dialCode: '', phone: '' };

  const clean = rawPhone.trim();
  const countriesList = COUNTRIES_LIST || Object.values(COUNTRIES_MAP || {});

  const foundCountry = countriesList.find((c) => clean.startsWith(c.dialCode));
  if (foundCountry) {
    return {
      dialCode: foundCountry.dialCode,
      phone: clean.replace(foundCountry.dialCode, '').trim()
    };
  }

  return { dialCode: '', phone: clean };
};

/**
 * دالة لتنسيق الرقم شكلياً للعرض في الواجهات (تضيف + قبل الرقم)
 */
export const formatPhoneNumber = (phone, countryCode = 'EG') => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) return cleaned;

  // جلب كود الاتصال من ملف الدول
  const country = COUNTRIES_MAP[countryCode?.toUpperCase()];
  const dialCode = country ? country.dialCode : '+20';
  
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith('0')) return `${dialCode}${cleaned.slice(1)}`;
  
  return `${dialCode}${cleaned}`;
};

/**
 * دالة توحيد الرقم لتخزينه في قاعدة البيانات (بدون علامة +)
 * تطابق تماماً دالة normalize_phone في Supabase
 */
export const normalizePhone = (phone, countryCode = 'EG') => {
  if (!phone) return null;

  // تنظيف الرقم من كافة الرموز (حتى علامة +)
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned) return null;

  const country = COUNTRIES_MAP[countryCode?.toUpperCase()];
  const dialCode = country ? country.dialCode.replace('+', '') : '20';

  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = dialCode + cleaned.substring(1);
  } else if (!cleaned.startsWith(dialCode) && cleaned.length <= 10) {
    cleaned = dialCode + cleaned;
  }

  return cleaned;
};

// ==========================================
// 4. تنسيق الآيات والسور والأجزاء القرآنية
// ==========================================
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

// ==========================================
// 5. اقتطاع النصوص وحجم الملفات
// ==========================================
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

// ==========================================
// 6. تنسيق الروايات القرآنية
// ==========================================
export const formatRiwayah = (riwayahKey, lang = 'ar', fallback = 'غير محددة') => {
  if (!riwayahKey) return fallback;
  if (lang === 'ar') {
    return RIWAYAT_MAP[riwayahKey] || riwayahKey;
  }
  return riwayahKey;
};

// ==========================================
// 7. تنسيق أسماء الدول والجنسيات من القائمة الثابتة
// ==========================================
export const formatCountry = (countryCode, lang = 'ar', fallback = 'غير محددة') => {
  if (!countryCode) return fallback;
  const country = COUNTRIES_MAP[countryCode.toUpperCase()];
  if (country) {
    return lang === 'ar' ? country.nameAr : country.nameEn;
  }
  return countryCode;
};
