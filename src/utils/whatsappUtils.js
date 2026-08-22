/**
 * مكتبة التواصل وإرسال التقارير عبر واتساب
 * تطبيق سمارت حلقة (Smart Halaqa)
 */

import { formatName, formatPhoneNumber } from './formatters';

/**
 * فتح رابط الواتساب بأمان
 */
const openWhatsAppLink = (phone, text) => {
  const cleanPhone = formatPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

/**
 * 1. إرسال تقرير الحضور والإنتاجية اليومية
 */
export const sendWhatsAppAttendanceReport = (student, record = {}, selectedDate, isRtl = true) => {
  const parentPhone = student?.parent_phone || student?.phone;
  
  if (!parentPhone) {
    return { success: false, reason: 'NO_PHONE' };
  }

  const cleanPhone = formatPhoneNumber(parentPhone);
  if (!cleanPhone || cleanPhone.length < 8) {
    return { success: false, reason: 'INVALID_PHONE' };
  }

  const lang = isRtl ? 'ar' : 'en';
  const studentName = formatName(student?.name, lang) || (isRtl ? 'الطالب' : 'Student');
  const currentStatus = record.status || 'present';

  const statusMap = isRtl ? {
    present: 'حاضر 🟢',
    absent: 'غائب 🔴',
    late: 'متأخر 🟡',
    excused: 'معتذر 🔵'
  } : {
    present: 'Present 🟢',
    absent: 'Absent 🔴',
    late: 'Late 🟡',
    excused: 'Excused 🔵'
  };

  const getGradeText = (grade) => {
    const numGrade = Number(grade);
    if (numGrade >= 10) return isRtl ? 'ممتاز (10/10) 🌟' : 'Excellent (10/10) 🌟';
    if (numGrade >= 8) return isRtl ? 'جيد جداً 👍' : 'Very Good 👍';
    if (numGrade >= 6) return isRtl ? 'قيد التحسين ⚠️' : 'Needs Improvement ⚠️';
    return isRtl ? `${numGrade} درجات` : `${numGrade} Points`;
  };

  const isPresent = currentStatus === 'present' || currentStatus === 'late';

  const text = isRtl ? `السلام عليكم ورحمة الله وبركاته 🌸
تقرير أداء الطالب/ة: *${studentName}*
📅 التاريخ: ${selectedDate}

📌 الحضور: ${statusMap[currentStatus] || 'حاضر 🟢'}
${isPresent ? `📖 الحفظ الجديد: ${record.new_memorization || 'لم يحدد'}
🔁 المراجعة والربط: ${record.retention_assignment || 'لم يحدد'}
⭐ التقييم: ${getGradeText(record.session_grade ?? 10)}` : ''}
📝 الملاحظات: ${record.notes || 'لا يوجد ملاحظات'}

شاكرين ومقدرين حسن متابعتكم معنا 🌿`
: `Peace be upon you 🌸
Performance Report for: *${studentName}*
📅 Date: ${selectedDate}

📌 Attendance: ${statusMap[currentStatus] || 'Present 🟢'}
${isPresent ? `📖 New Memorization: ${record.new_memorization || 'Not specified'}
🔁 Revision: ${record.retention_assignment || 'Not specified'}
⭐ Daily Grade: ${getGradeText(record.session_grade ?? 10)}` : ''}
📝 Notes: ${record.notes || 'None'}

Thank you for your cooperation and support 🌿`;

  openWhatsAppLink(parentPhone, text);
  return { success: true };
};
