// src/utils/whatsappUtils.js

/**
 * إنشاء وإرسال تقرير الحضور والإنتاجية اليومية للواتساب
 */
export const sendWhatsAppAttendanceReport = (student, record, selectedDate, isRtl) => {
  const parentPhone = student.parent_phone || student.phone;
  if (!parentPhone) {
    alert(isRtl ? "لا يوجد رقم هاتف مسجل لولي الأمر!" : "No phone number registered for parent!");
    return;
  }

  const cleanPhone = parentPhone.replace(/\D/g, '');
  const currentStatus = record.status || 'present';
  const statusMap = { present: 'حاضر 🟢', absent: 'غائب 🔴', late: 'متأخر 🟡', excused: 'معتذر 🔵' };
  const gradeMap = { 10: 'ممتاز 🌟', 8: 'جيد جداً 👍', 6: 'يحتاج تحسين ⚠️' };

  const text = `السلام عليكم ورحمة الله وبركاته 🌸
تقرير أداء الطالب/ة: *${student.name}*
📅 التاريخ: ${selectedDate}

📌 الحضور: ${statusMap[currentStatus] || 'حاضر'}
📖 الحفظ الجديد: ${record.new_memorization || 'لم يحدد'}
🔁 المراجعة والربط: ${record.retention_assignment || 'لم يحدد'}
⭐ التقييم: ${gradeMap[record.session_grade] || 'ممتاز 🌟'}
📝 الملاحظات: ${record.notes || 'لا يوجد ملاحظات'}

شاكرين ومقدرين حسن متابعتكم معنا 🌿`;

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
};
