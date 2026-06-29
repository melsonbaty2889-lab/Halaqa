// src/utils/dateUtils.js

export const formatHijriDate = (date = new Date(), locale = 'ar') => {
  // 1. تحويل التاريخ والتحقق من صحته فوراً
  const targetDate = date instanceof Date ? date : new Date(date);
  
  // إذا كان التاريخ غير صحيح (Invalid Date) نرجع نصاً فارغاً دون إحداث خطأ
  if (isNaN(targetDate.getTime())) {
    console.warn("formatHijriDate: تم تمرير تاريخ غير صالح");
    return "";
  }

  // 2. فحص مرن للغة لتشمل الصيغ المركبة مثل ar-EG أو ar-SA
  const isArabic = locale && locale.toLowerCase().startsWith('ar');

  const localeConfig = isArabic 
    ? 'ar-EG-u-ca-islamic-umalqura' // يعرض أرقاماً مريحة 123، استبدلها بـ ar-SA للأرقام ١٢٣
    : 'en-US-u-ca-islamic-umalqura';

  try {
    return new Intl.DateTimeFormat(localeConfig, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      // era: 'short' // 👈 مفيد جداً: أزل التعليق عن هذا السطر إذا أردت إضافة "هـ" أو "AH" تلقائياً من المتصفح
    }).format(targetDate);
  } catch (error) {
    console.error("Error formatting Hijri date:", error);
    return "";
  }
};
