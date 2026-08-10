/* src/utils/dateUtils.js */

export const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

export const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

/**
 * خوارزمية دقيقة لتحويل التاريخ الميلادي إلى هجري (Kuwaiti Algorithm)
 */
export const getHijriParts = (dateObj, offsetDays = 0) => {
  const date = new Date(dateObj);
  date.setDate(date.getDate() + offsetDays);

  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);

  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  let z = Math.floor(jd + 0.5);
  let f = (jd + 0.5) - z;

  let l = z - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;

  let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;

  let hMonth = Math.floor((24 * l) / 709);
  let hDay = l - Math.floor((709 * hMonth) / 24);
  let hYear = 30 * n + j - 30;

  return {
    day: hDay,
    month: hMonth, // 1 - 12
    year: hYear
  };
};

export const formatHijriDate = (dateObj, isArabic = true, offsetDays = 0) => {
  const { day, month, year } = getHijriParts(dateObj, offsetDays);
  const monthName = isArabic ? HIJRI_MONTHS_AR[month - 1] : HIJRI_MONTHS_EN[month - 1];
  return isArabic ? `${day} ${monthName} ${year} هـ` : `${monthName} ${day}, ${year} AH`;
};
