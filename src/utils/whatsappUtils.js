/**
 * أدوات تنفيذ وإرسال رسائل الواتساب
 * تطبيق سمارت حلقة (Smart Halaqa)
 */

import { formatPhoneNumber } from './formatters';
import { 
  getAttendanceReportTemplate, 
  getSubscriptionReminderTemplate, 
  getAchievementTemplate 
} from './whatsappTemplates';

const openWhatsAppLink = (phone, text) => {
  const cleanPhone = formatPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

export const sendWhatsAppAttendanceReport = (student, record = {}, selectedDate, isRtl = true) => {
  const parentPhone = student?.parent_phone || student?.phone;
  if (!parentPhone) return { success: false, error: 'NO_PHONE' };

  const cleanPhone = formatPhoneNumber(parentPhone);
  if (!cleanPhone || cleanPhone.length < 8) return { success: false, error: 'INVALID_PHONE' };

  const messageText = getAttendanceReportTemplate(student, record, selectedDate, isRtl);
  openWhatsAppLink(cleanPhone, messageText);
  return { success: true };
};

export const sendSubscriptionReminder = (student, amount, dueDate, isRtl = true) => {
  const parentPhone = student?.parent_phone || student?.phone;
  if (!parentPhone) return { success: false, error: 'NO_PHONE' };

  const messageText = getSubscriptionReminderTemplate(student, amount, dueDate, isRtl);
  openWhatsAppLink(parentPhone, messageText);
  return { success: true };
};

export const sendAchievementCongratulation = (student, achievementTitle, isRtl = true) => {
  const parentPhone = student?.parent_phone || student?.phone;
  if (!parentPhone) return { success: false, error: 'NO_PHONE' };

  const messageText = getAchievementTemplate(student, achievementTitle, isRtl);
  openWhatsAppLink(parentPhone, messageText);
  return { success: true };
};
