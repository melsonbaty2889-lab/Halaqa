// src/utils/whatsappUtils.js

/**
 * دالة مساعدة لاستخراج الاسم بنص صريح مجرد من أطر JSON
 */
const formatName = (nameData, isRtl) => {
  if (!nameData) return '';
  if (typeof nameData === 'string') return nameData;
  if (typeof nameData === 'object') {
    return isRtl 
      ? (nameData.ar || nameData.en || nameData.full_name || Object.values(nameData)[0] || '')
      : (nameData.en || nameData.ar || nameData.full_name || Object.values(nameData)[0] || '');
  }
  return String(nameData);
};

/**
 * دالة لتنسيق رقم الهاتف وتنظيفه مع إضافة الرمز الدولي الافتراضي إذا لزم الأمر
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let clean = String(phone).replace(/\D/g, '');
  
  // إذا كان الرقم مصرياً يبدأ بـ 01
  if (clean.startsWith('01') && clean.length === 11) {
    clean = '2' + clean;
  }
  return clean;
};

/**
 * إنشاء وإرسال تقرير الحضور والإنتاجية اليومية للواتساب
 */
export const sendWhatsAppAttendanceReport = (student, record = {}, selectedDate, isRtl = true) => {
  const parentPhone = student.parent_phone || student.phone;
  
  if (!parentPhone) {
    alert(isRtl ? "لا يوجد رقم هاتف مسجل لولي الأمر!" : "No phone number registered for parent!");
    return;
  }

  const cleanPhone = formatPhoneNumber(parentPhone);
  if (!cleanPhone || cleanPhone.length < 8) {
    alert(isRtl ? "رقم الهاتف المسجل غير صالح!" : "Registered phone number is invalid!");
    return;
  }

  const studentName = formatName(student.name, isRtl) || (isRtl ? 'الطالب' : 'Student');
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

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
};
