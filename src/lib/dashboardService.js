/**
 * هذا الملف يحتوي على وظائف جلب البيانات (Services)
 * لضمان نظافة كود الواجهة (UI)
 */

export async function getDashboardStats(supabase, profile) {
  try {
    // تم التوحيد على 'super_admin' لضمان التطابق مع واجهة المستخدم
    if (profile?.role === 'super_admin') {
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: academiesCount, error: academiesError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      if (studentsError || academiesError) throw new Error('خطأ في جلب بيانات الإدارة');

      return { studentsCount, academiesCount };
    } 
    
    // إذا كان مستخدم عادي (مدير أكاديمية أو معلم) -> جلب بيانات أكاديميته فقط
    else if (profile?.academy_id) {
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', profile.academy_id);

      if (studentsError) throw new Error('خطأ في جلب بيانات الأكاديمية');

      return { studentsCount, academiesCount: null }; 
    }

    // القيمة الافتراضية إذا لم يتطابق أي شرط
    return { studentsCount: 0, academiesCount: 0 };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { studentsCount: 0, academiesCount: 0 };
  }
}
