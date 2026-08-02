// src/lib/sessionService.js
import { supabase } from './supabase';

/**
 * دالة مساعدة للحصول على تاريخ اليوم بالتوقيت المحلي بصيغة YYYY-MM-DD
 */
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 1️⃣ جلب الحضور والتسميع اليومي للأكاديمية بناءً على التاريخ
 */
export const fetchAttendance = async (academyId, date) => {
  if (!academyId || !date) return [];

  const { data, error } = await supabase
    .from('attendance')
    .select('*') 
    .eq('academy_id', academyId)
    .eq('date', date);
  
  if (error) {
    console.error("🚨 Error fetching attendance:", error.message);
    throw error;
  }
  return data || [];
};

/**
 * 2️⃣ الحفظ المجمع والتحديث التلقائي (Upsert) للحضور والتسميع
 */
export const upsertAttendance = async (records) => {
  if (!records || !Array.isArray(records) || records.length === 0) return true;

  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,halaqa_id,date' });

  if (error) {
    console.error("🚨 Error upserting attendance:", error.message);
    throw error;
  }
  return data || true;
};

/**
 * 3️⃣ تسجيل الحصة اليومية للطالب (حضور + تسميع وحفظ جديد)
 */
export const saveDailySession = async ({
  studentId,
  academyId,
  halaqaId,
  teacherId,
  attendanceStatus = 'present', // 'present', 'absent', 'late', 'excused'
  attendanceNotes,
  hifzData,        
}) => {
  try {
    const today = getTodayDateString();

    // حفظ أو تحديث حالة الحضور والغياب لليوم
    const { error: attendanceError } = await supabase
      .from('attendance')
      .upsert(
        {
          student_id: studentId,
          academy_id: academyId,
          halaqa_id: halaqaId || null,
          date: today,
          status: attendanceStatus,
          notes: attendanceNotes || null,
        },
        { onConflict: 'student_id,halaqa_id,date' }
      );

    if (attendanceError) throw attendanceError;

    // إذا كان الطالب حاضراً أو متأخراً، نسجل له ورد التسميع اليومي
    if ((attendanceStatus === 'present' || attendanceStatus === 'late') && hifzData) {
      const { error: progressError } = await supabase
        .from('daily_progress')
        .insert([
          {
            student_id: studentId,
            academy_id: academyId,
            teacher_id: teacherId || null,
            halaqa_id: halaqaId || null,
            date: today,
            hifz_surah_id: hifzData.hifzSurahId || null,
            hifz_from_ayah: hifzData.hifzFromAyah || null,
            hifz_to_ayah: hifzData.hifzToAyah || null,
            review_surah_id: hifzData.reviewSurahId || null,
            review_from_ayah: hifzData.reviewFromAyah || null,
            review_to_ayah: hifzData.reviewToAyah || null,
            grade: hifzData.grade || 'ممتاز',
            mistakes_count: Number(hifzData.mistakes) || 0,
            notes: hifzData.notes || null,
          },
        ]);

      if (progressError) throw progressError;

      if (hifzData.hifzSurahId) {
        await supabase
          .from('students')
          .update({
            current_surah_id: hifzData.hifzSurahId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', studentId);
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('🚨 Error saving daily session:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 4️⃣ تسجيل اختبار رسمي ومرحلي منفصل للطالب
 */
export const saveStudentExam = async ({
  studentId,
  academyId,
  teacherId,
  halaqaId,
  examType,
  fromSurahId,
  toSurahId,
  fromAyah,
  toAyah,
  mistakes,
  prompts,
  tajweedGrade,
  finalScore,
  notes,
}) => {
  try {
    const today = getTodayDateString();

    const { data, error } = await supabase
      .from('exams')
      .insert([
        {
          student_id: studentId,
          academy_id: academyId,
          teacher_id: teacherId || null,
          halaqa_id: halaqaId || null,
          exam_type: examType,
          from_surah_id: fromSurahId || null,
          to_surah_id: toSurahId || null,
          from_ayah: fromAyah || null,
          to_ayah: toAyah || null,
          mistakes: Number(mistakes) || 0,
          prompts: Number(prompts) || 0,
          tajweed_grade: tajweedGrade || null,
          final_score: Number(finalScore) || 0,
          notes: notes || null,
          date: today,
        },
      ])
      .select();

    if (error) throw error;

    await supabase
      .from('students')
      .update({
        last_test_score: Number(finalScore) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId);

    return { success: true, data };
  } catch (error) {
    console.error('🚨 Error saving exam:', error.message);
    return { success: false, error: error.message };
  }
};

export const sessionService = {
  fetchAttendance,
  upsertAttendance,
  saveDailySession,
  saveStudentExam,
};
