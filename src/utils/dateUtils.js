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
  if (!str) return '';
  return String(str)
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
};

export const toArNums = (str) => {
  if (!str && str !== 0) return '';
  return String(str).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
};

export const toUrNums = (str) => {
  if (!str && str !== 0) return '';
  return String(str).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
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
  const y = Number(hYear);
  const mIdx = Number(hMonthIdx);
  const d = Number(hDay) || 1;

  if (!y || isNaN(y) || y < 1000 || y > 1600) return null;
  if (isNaN(mIdx) || mIdx < 0 || mIdx > 11) return null;

  try {
    const m = moment();
    m.iYear(y);
    m.iMonth(mIdx);
    m.iDate(Math.min(Math.max(d, 1), 30));
    
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
