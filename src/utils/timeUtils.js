// src/utils/timeUtils.js

/**
 * تحويل نص الوقت (12 ساعة مع ص/م أو 24 ساعة) إلى دقائق إجمالية للمقارنة
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const str = timeStr.trim();
  if (!str) return null;

  const isPM = str.includes('م') || str.toUpperCase().includes('PM');
  const isAM = str.includes('ص') || str.toUpperCase().includes('AM');

  const cleanTime = str.replace(/[^\d:]/g, '');
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
 * التحقق من أن وقت البدء قبل وقت الانتهاء
 */
export const isStartTimeBeforeEndTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true;
  const startMins = parseTimeToMinutes(startTime);
  const endMins = parseTimeToMinutes(endTime);

  if (startMins !== null && endMins !== null) {
    return startMins < endMins;
  }
  return true;
};

/**
 * تحويل وقت الواجهة إلى صيغة HH:mm:ss القياسية لقواعد البيانات (Supabase / Postgres)
 */
export const formatTimeForDb = (timeStr) => {
  const totalMins = parseTimeToMinutes(timeStr);
  if (totalMins === null) return '00:00:00';

  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};
