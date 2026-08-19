import i18n from '@/i18n'; // ربط مع نظام الترجمة المعتمد في المشروع

/**
 * تنظيف رقم الهاتف وإرجاع الصياغة الدولية فقط
 * @param {string} phone - رقم الهاتف المدخل
 * @param {string} defaultCountryCode - رمز الدولة الافتراضي (مثل '20' لمصر)
 */
export const cleanPhoneNumber = (phone = '', defaultCountryCode = '20') => {
  if (!phone) return '';

  // إزالة أي رموز غير رقمية باستثناء علامة +
  let cleaned = phone.toString().replace(/[^0-9+]/g, '');

  if (!cleaned) return '';

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    // إزالة الصفر المحلي وإضافة كود الدولة
    cleaned = defaultCountryCode + cleaned.substring(1);
  }

  return cleaned;
};

/**
 * توليد رابط واتساب عالمي يدعم كافة الدول
 */
export const generateWhatsAppLink = (phone = '', message = '', defaultCountryCode = '20') => {
  const cleanPhone = cleanPhoneNumber(phone, defaultCountryCode);
  if (!cleanPhone) return '#';

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
};

/**
 * تحويل متغيرات القالب إلى نص التقرير النهائي (مع دعم التدويل والشمولية)
 */
export const getParsedMessage = ({
  student,
  record,
  template,
  formattedDate,
  locale = i18n.language || 'ar',
  safeString = (val) => (val !== undefined && val !== null ? String(val) : '')
}) => {
  const isRtl = locale.startsWith('ar');

  const studentName = safeString(student?.name || student?.student_name || record?.student_name);
  const statusVal = record?.attendance_status || record?.status;

  // 1. معالجة التاريخ بناءً على المنطقة والثقافة المختارة
  const getDateDisplay = () => {
    if (!formattedDate) {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date());
    }
    if (formattedDate instanceof Date) {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(formattedDate);
    }
    return formattedDate;
  };

  // 2. معالجة حالة الحضور عبر مفاتيح i18n
  const getStatusText = () => {
    if (!statusVal) return i18n.t('reports.status.present', { defaultValue: isRtl ? 'حاضر ✅' : 'Present ✅' });
    
    const statusMap = {
      present: i18n.t('reports.status.present', { defaultValue: isRtl ? 'حاضر ✅' : 'Present ✅' }),
      absent: i18n.t('reports.status.absent', { defaultValue: isRtl ? 'غائب ❌' : 'Absent ❌' }),
      late: i18n.t('reports.status.late', { defaultValue: isRtl ? 'متأخر ⏳' : 'Late ⏳' }),
      excused: i18n.t('reports.status.excused', { defaultValue: isRtl ? 'غائب بعذر 📝' : 'Excused 📝' })
    };

    return statusMap[statusVal] || i18n.t('reports.status.present', { defaultValue: isRtl ? 'حاضر ✅' : 'Present ✅' });
  };

  // 3. تقييم الأداء بنظام ديناميكي
  const getGradeText = () => {
    const rawGrade = record?.session_grade ?? record?.rating ?? record?.score;
    if (rawGrade === null || rawGrade === undefined || rawGrade === '') {
      return i18n.t('reports.not_specified', { defaultValue: isRtl ? 'غير محدد' : 'Not specified' });
    }

    const grade = Number(rawGrade);
    if (isNaN(grade)) return safeString(rawGrade);

    if (grade >= 9) return i18n.t('reports.grades.excellent', { defaultValue: isRtl ? 'ممتاز ⭐⭐⭐' : 'Excellent ⭐⭐⭐' });
    if (grade >= 7.5) return i18n.t('reports.grades.very_good', { defaultValue: isRtl ? 'جيد جداً ⭐⭐' : 'Very Good ⭐⭐' });
    if (grade >= 6) return i18n.t('reports.grades.needs_focus', { defaultValue: isRtl ? 'يحتاج مزيد من التركيز 🎯' : 'Needs Focus 🎯' });
    return i18n.t('reports.grades.needs_improvement', { defaultValue: isRtl ? 'يحتاج تحسين ⚠️' : 'Needs Improvement ⚠️' });
  };

  let parsed = template || '';

  // خريطة الوسوم الديناميكية
  const replaceMap = {
    '{{student_name}}': studentName || i18n.t('reports.placeholders.student_name', { defaultValue: isRtl ? 'اسم الطالب' : 'Student Name' }),
    '{{date}}': getDateDisplay(),
    '{{status}}': getStatusText(),
    '{{memorization}}': safeString(record?.new_memorization || record?.memorization) || (statusVal === 'absent' ? '---' : i18n.t('reports.no_recitation', { defaultValue: isRtl ? 'لم يتم التسميع' : 'No recitation' })),
    '{{review}}': safeString(record?.review) || '---',
    '{{rating}}': getGradeText(),
    '{{test_name}}': safeString(record?.testName || record?.test_name) || i18n.t('reports.assessment_test', { defaultValue: isRtl ? 'اختبار التقييم' : 'Assessment Test' }),
    '{{score}}': safeString(record?.score) || '---',
    '{{notes}}': safeString(record?.session_notes || record?.notes) || i18n.t('reports.no_notes', { defaultValue: isRtl ? 'لا يوجد ملاحظات إضافية.' : 'No additional notes.' })
  };

  // 1. معالجة الوسوم الرئيسية {{variable}}
  Object.keys(replaceMap).forEach((tag) => {
    const regex = new RegExp(tag.replace(/[{()}]/g, '\\$&'), 'g');
    parsed = parsed.replace(regex, replaceMap[tag]);
  });

  // 2. دعم الأقواس القديمة والأقواس المفردة {اسم_الطالب} و [اسم_الطالب]
  parsed = parsed.replace(/\{اسم_الطالب\}|\[اسم_الطالب\]|\[Student_Name\]/gi, replaceMap['{{student_name}}']);
  parsed = parsed.replace(/\{التاريخ\}|\[التاريخ\]|\[Date\]/gi, replaceMap['{{date}}']);
  parsed = parsed.replace(/\{حالة_الحضور\}|\{الحالة\}|\[الحالة\]|\[Status\]/gi, replaceMap['{{status}}']);
  parsed = parsed.replace(/\{الحفظ\}|\[الحفظ\]|\[Memorization\]/gi, replaceMap['{{memorization}}']);
  parsed = parsed.replace(/\{المراجعة\}|\[المراجعة\]|\[Revision\]/gi, replaceMap['{{review}}']);
  parsed = parsed.replace(/\{التقييم\}|\[التقييم\]|\[Grade\]|\[Rating\]/gi, replaceMap['{{rating}}']);
  parsed = parsed.replace(/\{اسم_الاختبار\}|\[اسم_الاختبار\]/gi, replaceMap['{{test_name}}']);
  parsed = parsed.replace(/\{الدرجة\}|\[الدرجة\]/gi, replaceMap['{{score}}']);
  parsed = parsed.replace(/\{الملاحظات\}|\[الملاحظات\]|\[Notes\]/gi, replaceMap['{{notes}}']);

  return parsed;
};
