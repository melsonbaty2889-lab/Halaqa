import { supabase } from './supabase';

/**
 * 1️⃣ جلب الحضور والتسميع اليومي للأكاديمية بناءً على التاريخ
 */
export const fetchAttendance = async (academyId, date) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*') // نستخدم * لضمان جلب كافة الحقول (سواء الحضور أو التسميع المدمج) دون أخطاء
    .eq('academy_id', academyId)
    .eq('date', date);
  
  if (error) {
    console.error("Error fetching attendance:", error.message);
    throw error;
  }
  return data;
};

/**
 * 2️⃣ الحفظ المجمع والتحديث التلقائي (Upsert) للحضور والتسميع
 */
export const upsertAttendance = async (records) => {
  if (!records || records.length === 0) return true;

  const { error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,date' }); // يمنع التكرار لنفس الطالب في نفس اليوم

  if (error) {
    console.error("Error upserting attendance:", error.message);
    throw error;
  }
  return true;
};

/**
 * 3️⃣ تسجيل الحصة اليومية للطالب (حضور + تسميع وحفظ جديد)
 * مصممة لتنفيذ العمليات بسرعة فائقة لتناسب شبكات الهواتف المحمولة
 */
export const saveDailySession = async ({
  studentId,
  academyId,
  teacherId,
  attendanceStatus, // 'present', 'absent', 'late', 'excused'
  attendanceNotes,
  hifzData,        // object: { newStart, newEnd, reviewStart, reviewEnd, grade, mistakes }
}) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // حفظ أو تحديث حالة الحضور والغياب لليوم
    const { error: attendanceError } = await supabase
      .from('attendance')
      .upsert(
        {
          student_id: studentId,
          academy_id: academyId,
          date: today,
          status: attendanceStatus,
          notes: attendanceNotes || null,
        },
        { onConflict: 'student_id,date' }
      );

    if (attendanceError) throw attendanceError;

    // إذا كان الطالب حاضراً أو متأخراً، نسجل له ورد التسميع اليومي
    if (attendanceStatus === 'present' || attendanceStatus === 'late') {
      if (hifzData) {
        const { error: progressError } = await supabase
          .from('daily_progress')
          .insert([
            {
              student_id: studentId,
              academy_id: academyId,
              teacher_id: teacherId || null,
              date: today,
              new_hifz_start: hifzData.newStart || null,
              new_hifz_end: hifzData.newEnd || null,
              review_start: hifzData.reviewStart || null,
              review_end: hifzData.reviewEnd || null,
              grade: hifzData.grade || 'ممتاز',
              mistakes_count: parseInt(hifzData.mistakes) || 0,
              notes: hifzData.notes || null,
            },
          ]);

        if (progressError) throw progressError;

        // تحديث الورد الحالي في جدول الطلاب الأساسي ليبقى مرجعاً سريعاً
        await supabase
          .from('students')
          .update({
            current_surah: hifzData.newEnd || hifzData.newStart,
            updated_at: new Date().toISOString(),
          })
          .eq('id', studentId);
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving daily session:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 4️⃣ تسجيل اختبار رسمي ومرحلي منفصل للطالب
 */
export const saveStudentExam = async ({
  studentId,
  academyId,
  examType,
  examTarget,
  mistakes,
  prompts,
  tajweedGrade,
  finalScore,
  notes,
}) => {
  try {
    const { data, error } = await supabase
      .from('exams')
      .insert([
        {
          student_id: studentId,
          academy_id: academyId,
          exam_type: examType,
          exam_target: examTarget,
          mistakes: mistakes || 0,
          prompts: prompts || 0,
          tajweed_grade: tajweedGrade,
          final_score: finalScore,
          notes: notes || null,
          date: new Date().toISOString().split('T')[0],
        },
      ])
      .select();

    if (error) throw error;

    await supabase
      .from('students')
      .update({
        last_test_score: finalScore,
      })
      .eq('id', studentId);

    return { success: true, data };
  } catch (error) {
    console.error('Error saving exam:', error.message);
    return { success: false, error: error.message };
  }
};

// 👑 التصدير الموحد والذكي لمنع كسر أي استيراد قديم وحل مشكلة بناء التطبيق فوراً
export const sessionService = {
  fetchAttendance,
  upsertAttendance,
  saveDailySession,
  saveStudentExam,
};
