import { supabase } from './supabase';

/**
 * تسجيل الحصة اليومية للطالب (حضور + تسميع وحفظ جديد)
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

    // 1️⃣ أولاً: حفظ أو تحديث حالة الحضور والغياب لليوم
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
        { onConflict: 'student_id,date' } // يمنع تكرار التحضير لنفس الطالب في نفس اليوم
      );

    if (attendanceError) throw attendanceError;

    // 2️⃣ ثانياً: إذا كان الطالب حاضراً أو متأخراً، نسجل له ورد التسميع اليومي
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

        // 3️⃣ ثالثاً: تحديث الورد الحالي في جدول الطلاب الأساسي ليبقى مرجعاً سريعاً
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
 * تسجيل اختبار رسمي ومرحلي منفصل للطالب
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
          exam_type: examType,   // مثل: 'شهري'، 'جزء كامل'
          exam_target: examTarget, // مثل: 'جزء عم'، 'سورة البقرة'
          mistakes: mistakes || 0,
          prompts: prompts || 0,   // عدد التنبيهات والفتحات من الشيخ
          tajweed_grade: tajweedGrade, // 'ممتاز'، 'جيد'..
          final_score: finalScore,
          notes: notes || null,
          date: new Date().toISOString().split('T')[0],
        },
      ])
      .select();

    if (error) throw error;

    // تحديث درجات الطالب التراكمية في جدول الطلاب للمقارنة السريعة
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
