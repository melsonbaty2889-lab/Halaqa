/**
 * قوالب رسائل الواتساب للتطبيق
 * تطبيق سمارت حلقة (Smart Halaqa)
 */

import { formatName } from './formatters';

const getGradeText = (grade, isRtl) => {
  const numGrade = Number(grade);
  if (numGrade >= 10) return isRtl ? 'ممتاز (10/10) 🌟' : 'Excellent (10/10) 🌟';
  if (numGrade >= 8) return isRtl ? 'جيد جداً 👍' : 'Very Good 👍';
  if (numGrade >= 6) return isRtl ? 'قيد التحسين ⚠️' : 'Needs Improvement ⚠️';
  return isRtl ? `${numGrade} درجات` : `${numGrade} Points`;
};

export const getAttendanceReportTemplate = (student, record = {}, selectedDate, isRtl = true) => {
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

  const isPresent = currentStatus === 'present' || currentStatus === 'late';

  if (isRtl) {
    return `السلام عليكم ورحمة الله وبركاته 🌸
تقرير أداء الطالب/ة: *${studentName}*
📅 التاريخ: ${selectedDate}

📌 الحضور: ${statusMap[currentStatus] || 'حاضر 🟢'}
${isPresent ? `📖 الحفظ الجديد: ${record.new_memorization || 'لم يحدد'}
🔁 المراجعة والربط: ${record.retention_assignment || 'لم يحدد'}
⭐ التقييم: ${getGradeText(record.session_grade ?? 10, true)}` : ''}
📝 الملاحظات: ${record.notes || 'لا يوجد ملاحظات'}

شاكرين ومقدرين حسن متابعتكم معنا 🌿`;
  }

  return `Peace be upon you 🌸
Performance Report for: *${studentName}*
📅 Date: ${selectedDate}

📌 Attendance: ${statusMap[currentStatus] || 'Present 🟢'}
${isPresent ? `📖 New Memorization: ${record.new_memorization || 'Not specified'}
🔁 Revision: ${record.retention_assignment || 'Not specified'}
⭐ Daily Grade: ${getGradeText(record.session_grade ?? 10, false)}` : ''}
📝 Notes: ${record.notes || 'None'}

Thank you for your cooperation and support 🌿`;
};

export const getSubscriptionReminderTemplate = (student, amount, dueDate, isRtl = true) => {
  const lang = isRtl ? 'ar' : 'en';
  const studentName = formatName(student?.name, lang);

  if (isRtl) {
    return `السلام عليكم ورحمة الله وبركاته 🌸
نود تذكيركم بموعد تجديد اشتراك الحلقة للطالب/ة: *${studentName}*
💰 المبلغ المطلوب: ${amount}
📅 الموعد النهائي: ${dueDate}

شاكرين لكم تعاونكم المستمر معنا 🌿`;
  }

  return `Peace be upon you 🌸
Friendly reminder for subscription renewal for: *${studentName}*
💰 Amount Due: ${amount}
📅 Due Date: ${dueDate}

Thank you for your continued support 🌿`;
};

export const getAchievementTemplate = (student, achievementTitle, isRtl = true) => {
  const lang = isRtl ? 'ar' : 'en';
  const studentName = formatName(student?.name, lang);

  if (isRtl) {
    return `مبارك لكم هذا التميز! 🎉🌟
نبارك لكم وللطالب/ة البطل/ة *${studentName}* إتمام:
🏆 *${achievementTitle}*

نسأل الله أن يجعله حجة له لا عليه، وأن ينفع به إسلامنا وأمتنا 🌿`;
  }

  return `Congratulations! 🎉🌟
We celebrate student *${studentName}* for completing:
🏆 *${achievementTitle}*

Wishing them continued progress and success 🌿`;
};
