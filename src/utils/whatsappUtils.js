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
 * إنشاء وإرسال تقرير الحضور والإنتاجية اليومية للواتساب
 */
export const sendWhatsAppAttendanceReport = (student, record = {}, selectedDate, isRtl = true) => {
  const parentPhone = student.parent_phone || student.phone;
  
  if (!parentPhone) {
    alert(isRtl ? "لا يوجد رقم هاتف مسجل لولي الأمر!" : "No phone number registered for parent!");
    return;
  }

  const cleanPhone = String(parentPhone).replace(/\D/g, '');
  if (!cleanPhone) {
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

  const gradeMap = isRtl ? {
    10: 'ممتاز 🌟',
    8: 'جيد جداً 👍',
    6: 'يحتاج تحسين ⚠️'
  } : {
    10: 'Excellent 🌟',
    8: 'Very Good 👍',
    6: 'Needs Improvement ⚠️'
  };

  const text = isRtl ? `السلام عليكم ورحمة الله وبركاته 🌸
تقرير أداء الطالب/ة: *${studentName}*
📅 التاريخ: ${selectedDate}

📌 الحضور: ${statusMap[currentStatus] || 'حاضر 🟢'}
📖 الحفظ الجديد: ${record.new_memorization || 'لم يحدد'}
🔁 المراجعة والربط: ${record.retention_assignment || 'لم يحدد'}
⭐ التقييم: ${gradeMap[record.session_grade] || 'ممتاز 🌟'}
📝 الملاحظات: ${record.notes || 'لا يوجد ملاحظات'}

شاكرين ومقدرين حسن متابعتكم معنا 🌿`
: `Peace be upon you 🌸
Performance Report for: *${studentName}*
📅 Date: ${selectedDate}

📌 Attendance: ${statusMap[currentStatus] || 'Present 🟢'}
📖 New Memorization: ${record.new_memorization || 'Not specified'}
🔁 Revision: ${record.retention_assignment || 'Not specified'}
⭐ Daily Grade: ${gradeMap[record.session_grade] || 'Excellent 🌟'}
📝 Notes: ${record.notes || 'None'}

Thank you for your cooperation and support 🌿`;

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
};
