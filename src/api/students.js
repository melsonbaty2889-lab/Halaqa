import { supabase } from '../lib/supabase'; // تم التعديل بناءً على مجلد src/lib/supabase.js الخاص بك

/**
 * 1. جلب جميع الطلاب
 */
export const fetchAllStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching students:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * 2. إضافة طالب جديد ربطاً بجدول الـ staff والـ academies
 */
export const insertNewStudent = async (studentPayload) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          name: studentPayload.name,
          parent_phone: studentPayload.parent_phone || null,
          current_surah: studentPayload.current_surah || 'لم يحدد بعد',
          academy_id: studentPayload.academy_id || null,
          teacher_id: studentPayload.teacher_id || null, // يربط مع جدول staff تلقائياً
        }
      ])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error inserting student:', error.message);
    return { data: null, error: error.message };
  }
};
