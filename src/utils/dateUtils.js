// src/utils/dateUtils.js
import moment from 'moment-hijri';

export const HIJRI_MONTHS = {
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  en: ['Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhul-Qi'dah", 'Dhul-Hijjah'],
  fr: ['Mouharram', 'Safar', 'Rabi I', 'Rabi II', 'Joumada I', 'Joumada II', 'Rajab', "Cha'bane", 'Ramadan', 'Chawwal', "Dhou al-Qi'da", 'Dhou al-Hijja'],
  tr: ['Muharrem', 'Sefer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'],
  ur: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  id: ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah']
};

export const toEngNums = (str) => {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶٧٨٩'.indexOf(d));
};

export const toArNums = (str) => {
  if (!str && str !== 0) return '';
  return String(str).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
};

export const toUrNums = (str) => {
  if (!str && str !== 0) return '';
  return String(str).replace(/\d/g, (d) => '۰۱۲۳۴۵۶٧٨٩'[d]);
};

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
    hour12: true
  }).format(date);

  if (cleanLang === 'ar') {
    return toArNums(formattedTime);
  } else if (cleanLang === 'ur') {
    return toUrNums(formattedTime);
  }

  return formattedTime;
};

export const formatGregorianDate = (dateObj, lang = 'ar') => {
  if (!dateObj) return '';
  const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (isNaN(date.getTime())) return '';

  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const formatted = new Intl.DateTimeFormat(cleanLang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);

  if (cleanLang === 'ar') return toArNums(formatted);
  if (cleanLang === 'ur') return toUrNums(formatted);
  return formatted;
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

  let dayStr = String(parts.day);
  let yearStr = String(parts.year);
  let suffix = ['ar', 'ur'].includes(cleanLang) ? 'هـ' : 'AH';

  if (cleanLang === 'ar') {
    dayStr = toArNums(parts.day);
    yearStr = toArNums(parts.year);
  } else if (cleanLang === 'ur') {
    dayStr = toUrNums(parts.day);
    yearStr = toUrNums(parts.year);
    suffix = 'ء';
  }

  return `${dayStr} ${monthName} ${yearStr} ${suffix}`;
};

// ==========================================
// معالجة وتحويل أوقات الحلقات والتوقيت (Postgres / UI)
// ==========================================

/**
 * تحويل نص الوقت (سواء 12-ساعة بصيغة ص/م أو 24-ساعة) إلى دقائق إجمالية للمقارنة
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const rawStr = toEngNums(timeStr).trim();
  if (!rawStr) return null;

  // التحقق من المؤشرات الصريحة للمساء والصباح قبل التنظيف
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

/**
 * التحقق من أن وقت البدء أسبق من وقت الانتهاء (مع دعم الحلقات المسائية التي تنتهي عند منتصف الليل 12:00 ص)
 */
export const isStartTimeBeforeEndTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true;

  let startMins = parseTimeToMinutes(startTime);
  let endMins = parseTimeToMinutes(endTime);

  if (startMins === null || endMins === null) return true;

  // إذا انتهت الحلقة الساعة 12:00 ص (منتصف الليل 00:00) وكان البدء مساءً، فإن وقت الانتهاء يعتبر 24:00 (1440 دقيقة)
  if (endMins === 0 && startMins > 0) {
    endMins = 1440;
  }

  return startMins < endMins;
};

/**
 * تحويل الوقت إلى صيغة HH:mm:ss القياسية المعتمدة في Postgres/Supabase
 */
export const formatTimeForDb = (timeStr) => {
  const totalMins = parseTimeToMinutes(timeStr);
  if (totalMins === null) return '00:00:00';

  const hours = Math.floor(totalMins / 60) % 24;
  const minutes = totalMins % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};
