// src/utils/dateUtils.js
import moment from 'moment-hijri';
import { formatDigits } from './formatters';

export const HIJRI_MONTHS = {
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  en: ['Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhul-Qi'dah", 'Dhul-Hijjah'],
  fr: ['Mouharram', 'Safar', 'Rabi I', 'Rabi II', 'Joumada I', 'Joumada II', 'Rajab', "Cha'bane", 'Ramadan', 'Chawwal', "Dhou al-Qi'da", 'Dhou al-Hijja'],
  tr: ['Muharrem', 'Sefer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'],
  ur: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  id: ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah']
};

// توحيد جميع دوال تحويل الأرقام لتستخدم الصيغة القياسية (1234) حصرياً
export const toEngNums = (str) => formatDigits(str);
export const toArNums = (str) => formatDigits(str);
export const toUrNums = (str) => formatDigits(str);

export const getSavedHijriOffset = () => {
  try {
    const saved = localStorage.getItem('hijri_offset');
    return saved !== null ? parseInt(saved, 10) : 0;
  } catch (e) {
    return 0;
  }
};

export const setSavedHijriOffset = (offset) => {
  try {
    localStorage.setItem('hijri_offset', String(offset));
  } catch (e) {
    console.error('Failed to save hijri offset:', e);
  }
};

export const getHijriParts = (dateObj) => {
  try {
    if (!dateObj) return { day: 1, month: 0, year: '' };
    const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
    if (isNaN(date.getTime())) {
      return { day: 1, month: 0, year: '' };
    }

    const m = moment(date);
    return {
      day: m.iDate(),
      month: m.iMonth(),
      year: m.iYear()
    };
  } catch (e) {
    return { day: 1, month: 0, year: '' };
  }
};

export const hijriToGregorian = (hYear, hMonthIdx, hDay) => {
  const y = parseInt(hYear, 10);
  const mIdx = parseInt(hMonthIdx, 10);
  const d = parseInt(hDay, 10) || 1;

  if (!y || isNaN(y) || y < 1000 || y > 1600) return null;
  if (isNaN(mIdx) || mIdx < 0 || mIdx > 11) return null;

  try {
    const monthNum = String(mIdx + 1).padStart(2, '0');
    const dayNum = String(Math.min(Math.max(d, 1), 30)).padStart(2, '0');

    const m = moment(`${y}/${monthNum}/${dayNum}`, 'iYYYY/iMM/iDD');

    if (!m.isValid()) return null;

    const resDate = m.toDate();
    if (isNaN(resDate.getTime())) return null;

    return resDate;
  } catch (e) {
    return null;
  }
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - birth.getFullYear();
  if (age < 0 || age > 130) return null;

  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age < 0 ? 0 : age;
};

export const formatTimeString = (dateObj, lang = 'ar') => {
  if (!dateObj) return '';
  const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (isNaN(date.getTime())) return '';

  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const formattedTime = new Intl.DateTimeFormat(cleanLang, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    numberingSystem: 'latn' // فرض الأرقام القياسية اللاتينية
  }).format(date);

  return formatDigits(formattedTime);
};

export const formatGregorianDate = (dateObj, lang = 'ar') => {
  if (!dateObj) return '';
  const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (isNaN(date.getTime())) return '';

  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const formatted = new Intl.DateTimeFormat(cleanLang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    numberingSystem: 'latn' // فرض الأرقام القياسية اللاتينية
  }).format(date);

  return formatDigits(formatted);
};

export const formatHijriDate = (dateObj, lang = 'ar') => {
  if (!dateObj) return '';
  const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (isNaN(date.getTime())) return '';

  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const parts = getHijriParts(date);
  if (!parts.year) return '';

  const currentLangMap = HIJRI_MONTHS[cleanLang] ? cleanLang : 'ar';
  const monthName = HIJRI_MONTHS[currentLangMap][parts.month] || HIJRI_MONTHS.ar[parts.month];

  const dayStr = formatDigits(parts.day);
  const yearStr = formatDigits(parts.year);
  const suffix = ['ar', 'ur'].includes(cleanLang) ? 'هـ' : 'AH';

  return `${dayStr} ${monthName} ${yearStr} ${suffix}`;
};

// ==========================================
// معالجة وتحويل أوقات الحلقات والتوقيت (Postgres / UI)
// ==========================================

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const rawStr = formatDigits(timeStr).trim();
  if (!rawStr) return null;

  const isPM = rawStr.includes('م') || /PM/i.test(rawStr);
  const isAM = rawStr.includes('ص') || /AM/i.test(rawStr);

  const cleanTime = rawStr.replace(/[^\d:]/g, '');
  const parts = cleanTime.split(':');

  if (parts.length < 2) return null;

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return null;

  if (isPM || isAM) {
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
  }

  return hours * 60 + minutes;
};

export const isStartTimeBeforeEndTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true;

  let startMins = parseTimeToMinutes(startTime);
  let endMins = parseTimeToMinutes(endTime);

  if (startMins === null || endMins === null) return true;

  if (endMins === 0 && startMins > 0) {
    endMins = 1440;
  }

  return startMins < endMins;
};

export const formatTimeForDb = (timeStr) => {
  const totalMins = parseTimeToMinutes(timeStr);
  if (totalMins === null) return '00:00:00';

  const hours = Math.floor(totalMins / 60) % 24;
  const minutes = totalMins % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};
