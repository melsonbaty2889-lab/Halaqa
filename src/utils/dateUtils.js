// src/utils/dateUtils.js

export const formatHijriDate = (date = new Date(), locale = 'ar') => {
  // 1. تحويل التاريخ والتحقق من صحته فوراً
  const targetDate = date instanceof Date ? date : new Date(date);
  
  if (isNaN(targetDate.getTime())) {
    console.warn("formatHijriDate: تم تمرير تاريخ غير صالح");
    return "";
  }

  // 2. فحص مرن للغة
  const isArabic = locale && locale.toLowerCase().startsWith('ar');

  if (isArabic) {
    // التقويم الهجري باللغة العربية مدعوم بشكل ممتاز ومستقر في جميع المتصفحات
    try {
      return new Intl.DateTimeFormat('ar-EG-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(targetDate);
    } catch (error) {
      console.error("Error formatting Arabic Hijri date:", error);
      return "";
    }
  } else {
    // لتجنب bug المتصفحات (January .. BC)، نأخذ الأرقام الصافية ونركب النص بنفسنا
    try {
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
      
      // تفكيك التاريخ إلى أجزاء رقمية
      const parts = formatter.formatToParts(targetDate);
      const day = parts.find(p => p.type === 'day')?.value;
      const monthNum = parseInt(parts.find(p => p.type === 'month')?.value, 10);
      const year = parts.find(p => p.type === 'year')?.value;

      // مصفوفة الأشهر الهجرية بالإنجليزية المعتمدة عالمياً
      const hijriMonthsEn = [
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
        "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
        "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
      ];

      const monthName = hijriMonthsEn[monthNum - 1] || "";

      // النتيجة النهائية بصيغة احترافية ومستقرة: Muharram 16, 1448 AH
      return `${monthName} ${day}, ${year} AH`;

    } catch (error) {
      console.error("Error formatting English Hijri date:", error);
      return "";
    }
  }
};
