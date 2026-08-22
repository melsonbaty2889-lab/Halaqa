/**
 * أدوات ومعالجات البيانات القرآنية (أجزاء، أحزاب، أرباع، ونسب إنجاز)
 * تطبيق سمارت حلقة (Smart Halaqa)
 */

import { formatNumber, formatPercent } from './formatters';

// أرقام الأجزاء لفظياً باللغتين
const JUZ_NAMES_AR = [
  "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر",
  "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون",
  "الحادي والعشرون", "الثاني والعشرون", "الثالث والعشرون", "الرابع والعشرون", "الخامس والعشرون", "السادس والعشرون", "السابع والعشرون", "الثامن والعشرون", "التاسع والعشرون", "الثلاثون"
];

/**
 * 1. حساب تقدم الطالب بالقرآن بناءً على مؤشر الربع (1-240)
 */
export const getQuranProgress = (index, lang = 'ar') => {
  const isAr = lang === 'ar';
  
  if (!index || index < 1 || index > 240) {
    return { 
      juz: 0, 
      hizb: 0, 
      quarterInHizb: 0, 
      percentage: 0, 
      formattedPercent: formatPercent(0, isAr ? 'ar-EG' : 'en-US'),
      text: isAr ? 'لم يبدأ بعد' : 'Not started yet' 
    };
  }

  const rawPercentage = (index / 240) * 100;
  const juz = Math.ceil(index / 8);
  const hizb = Math.ceil(index / 4);
  const quarterInHizb = index % 4 === 0 ? 4 : index % 4;

  const juzText = isAr 
    ? `الجزء ${JUZ_NAMES_AR[juz - 1] || juz}` 
    : `Juz ${juz}`;
    
  const hizbText = isAr 
    ? `الحزب ${formatNumber(hizb, 'ar-EG')}` 
    : `Hizb ${hizb}`;

  const quarterText = isAr 
    ? `الربع ${formatNumber(quarterInHizb, 'ar-EG')}` 
    : `Quarter ${quarterInHizb}`;

  return {
    juz,
    hizb,
    quarterInHizb,
    percentage: Math.round(rawPercentage),
    formattedPercent: formatPercent(rawPercentage, isAr ? 'ar-EG' : 'en-US'),
    text: `${juzText} • ${hizbText} • ${quarterText}`
  };
};

/**
 * 2. حساب المتبقي لختم القرآن الكريم
 */
export const getRemainingProgress = (currentIndex) => {
  const current = Math.max(0, Math.min(240, Number(currentIndex) || 0));
  const remainingQuarters = 240 - current;
  const remainingJuz = Math.ceil(remainingQuarters / 8);

  return {
    remainingQuarters,
    remainingJuz,
    isCompleted: current === 240
  };
};

/**
 * 3. تنسيق اسم الجزء لفظياً
 */
export const formatJuzName = (juzNumber, lang = 'ar') => {
  const num = Number(juzNumber);
  if (!num || num < 1 || num > 30) return '';
  if (lang === 'ar') {
    return `الجزء ${JUZ_NAMES_AR[num - 1]}`;
  }
  return `Juz ${num}`;
};
