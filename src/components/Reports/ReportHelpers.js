/**
 * تحويل متغيرات القالب إلى نص التقرير النهائي للطلب (المعيار العالمي الموحد)
 */
export const getParsedMessage = ({ student, record, template, formattedDate, isRtl, safeString = (val) => val || '' }) => {
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
    const rawGrade = record?.session_grade || record?.rating || record?.score;
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

  // خريطة الوسوم العالمية الموحدة
  const replaceMap = {
    '{{student_name}}': studentName || (isRtl ? 'اسم الطالب' : 'Student Name'),
    '{{date}}': formattedDate || new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US'),
    '{{status}}': getStatusText(),
    '{{memorization}}': safeString(record?.new_memorization || record?.memorization) || (statusVal === 'absent' ? '---' : (isRtl ? 'لم يتم التسميع' : 'No recitation')),
    '{{review}}': safeString(record?.review) || '---',
    '{{rating}}': getGradeText(),
    '{{test_name}}': safeString(record?.testName || record?.test_name) || (isRtl ? 'اختبار التقييم' : 'Assessment Test'),
    '{{score}}': safeString(record?.score) || '---',
    '{{notes}}': safeString(record?.session_notes || record?.notes) || (isRtl ? 'لا يوجد ملاحظات إضافية.' : 'No additional notes.')
  };

  // 1. معالجة الوسوم العالمية الرئيسية {{variable}}
  Object.keys(replaceMap).forEach((tag) => {
    const regex = new RegExp(tag.replace(/[{()}]/g, '\\$&'), 'g');
    parsed = parsed.replace(regex, replaceMap[tag]);
  });

  // 2. التوافق الخلفي للأقواس القديمة [Student_Name] لعدم كسر القوالب السابقة
  parsed = parsed.replace(/\[اسم_الطالب\]|\[Student_Name\]/g, replaceMap['{{student_name}}']);
  parsed = parsed.replace(/\[التاريخ\]|\[Date\]/g, replaceMap['{{date}}']);
  parsed = parsed.replace(/\[الحالة\]|\[Status\]/g, replaceMap['{{status}}']);
  parsed = parsed.replace(/\[الحفظ\]|\[Memorization\]/g, replaceMap['{{memorization}}']);
  parsed = parsed.replace(/\[المراجعة\]|\[Revision\]/g, replaceMap['{{review}}']);
  parsed = parsed.replace(/\[التقييم\]|\[Grade\]|\[Rating\]/g, replaceMap['{{rating}}']);
  parsed = parsed.replace(/\[الملاحظات\]|\[Notes\]/g, replaceMap['{{notes}}']);

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
