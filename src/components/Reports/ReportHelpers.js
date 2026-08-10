// src/components/Reports/reportHelpers.js

/**
 * تحويل متغيرات القالب إلى نص التقرير النهائي للطلب
 */
export const getParsedMessage = ({ student, record, template, formattedDate, isRtl, safeString }) => {
  const studentName = safeString(student?.name || student?.student_name || record?.student_name);
  const statusVal = record?.attendance_status || record?.status;

  const getStatusText = () => {
    if (!record || !statusVal) return isRtl ? 'حاضر ✅' : 'Present ✅';
    switch (statusVal) {
      case 'present': return isRtl ? 'حاضر ✅' : 'Present ✅';
      case 'absent': return isRtl ? 'غائب ❌' : 'Absent ❌';
      case 'late': return isRtl ? 'متأخر ⏳' : 'Late ⏳';
      case 'excused': return isRtl ? 'غائب بعذر 📝' : 'Excused 📝';
      default: return isRtl ? 'حاضر ✅' : 'Present ✅';
    }
  };

  const getGradeText = () => {
    const rawGrade = record?.session_grade;
    if (!record || rawGrade === null || rawGrade === undefined) {
      return isRtl ? 'لم يحدد' : 'Not specified';
    }
    const grade = Number(rawGrade);
    if (isNaN(grade)) return safeString(rawGrade);
    if (grade >= 10) return isRtl ? 'ممتاز ⭐⭐⭐' : 'Excellent ⭐⭐⭐';
    if (grade >= 8)  return isRtl ? 'جيد جداً ⭐⭐' : 'Very Good ⭐⭐';
    if (grade >= 6)  return isRtl ? 'يحتاج مزيد من التركيز 🎯' : 'Needs Focus 🎯';
    return isRtl ? 'ضعيف ⚠️' : 'Needs Improvement ⚠️';
  };

  let parsed = template || '';
  
  parsed = parsed.replace(/\[اسم_الطالب\]|\[Student_Name\]/g, studentName || (isRtl ? "اسم الطالب" : "Student Name"));
  parsed = parsed.replace(/\[التاريخ\]|\[Date\]/g, formattedDate || '');
  parsed = parsed.replace(/\[الحالة\]|\[Status\]/g, getStatusText());
  parsed = parsed.replace(/\[الحفظ\]|\[Memorization\]/g, safeString(record?.new_memorization) || (statusVal === 'absent' ? '---' : (isRtl ? 'لم يتم التسميع' : 'No recitation')));
  parsed = parsed.replace(/\[المراجعة\]|\[Revision\]/g, safeString(record?.review) || '---');
  parsed = parsed.replace(/\[الماضي\]|\[Distant_Revision\]/g, '---');
  parsed = parsed.replace(/\[التقييم\]|\[Grade\]/g, getGradeText());
  parsed = parsed.replace(/\[الملاحظات\]|\[Notes\]/g, safeString(record?.session_notes) || (isRtl ? 'لا يوجد ملاحظات إضافية.' : 'No additional notes.'));

  return parsed;
};

/**
 * تنظيف رقم الهاتف وتوليد رابط واتساب مباشر
 */
export const generateWhatsAppLink = (phone, message) => {
  let cleanPhone = (phone || '').replace(/\s+/g, '').replace(/[+\-]/g, '');
  if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
    cleanPhone = '20' + cleanPhone;
  }
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
};
