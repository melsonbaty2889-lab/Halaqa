/**
 * هذا الملف يحتوي على وظائف جلب البيانات (Services)
 * لضمان نظافة كود الواجهة (UI)
 */

export async function getDashboardStats(supabase, profile) {
  try {
    const today = new Date().toISOString().split('T')[0]; // جلب تاريخ اليوم الحالي بدقة

    // 1. صلاحية 'super_admin' (إحصائيات المنصة الشاملة ككل)
    if (profile?.role === 'super_admin') {
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: academiesCount, error: academiesError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      if (studentsError || academiesError) throw new Error('خطأ في جلب بيانات الإدارة');

      // إرجاع البيانات الأساسية مع تصفير مؤشرات الأكاديميات الخاصة لعدم حدوث تضارب
      return { 
        studentsCount, 
        academiesCount,
        attendanceRate: null,
        totalPagesMuted: null,
        overdueCount: null
      };
    } 
    
    // 2. صلاحية مدير أكاديمية أو معلم (جلب بيانات الأكاديمية الحية بالتفصيل)
    else if (profile?.academy_id) {
      const academyId = profile.academy_id;

      // أ) جلب عدد طلاب الأكاديمية الإجمالي (كودك الأصلي)
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId);

      if (studentsError) throw new Error('خطأ في جلب بيانات الأكاديمية');

      // ب) حساب نسبة الحضور اليومي الفورية لطلاب هذه الأكاديمية
      const { data: attendanceData, error: attError } = await supabase
        .from('attendance')
        .select('status')
        .eq('academy_id', academyId)
        .eq('date', today);

      let attendanceRate = '0%';
      if (!attError && attendanceData && attendanceData.length > 0) {
        const present = attendanceData.filter(a => a.status === 'present').length;
        attendanceRate = `${((present / attendanceData.length) * 100).toFixed(1)}%`;
      }

      // ج) حساب إجمالي الصفحات المسمّعة اليوم (لتغذية موديول التقييم الذكي)
      const { data: quranData, error: quranError } = await supabase
        .from('quran_progress')
        .select('pages_count')
        .eq('academy_id', academyId)
        .eq('date', today);

      const totalPages = quranError ? 0 : (quranData?.reduce((sum, item) => sum + (item.pages_count || 0), 0) || 0);

      // د) رصد الاشتراكات المتأخرة أو التنبيهات المالية التي تحتاج إجراءً فورياً
      const { count: overdueCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'overdue');

      return { 
        studentsCount, 
        academiesCount: null,
        attendanceRate,
        totalPagesMuted: `${totalPages} صفحة`,
        overdueCount: overdueCount || 0
      }; 
    }

    // القيمة الافتراضية الآمنة إذا لم يتطابق أي شرط
    return { studentsCount: 0, academiesCount: 0, attendanceRate: '0%', totalPagesMuted: '0 صفحة', overdueCount: 0 };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { studentsCount: 0, academiesCount: 0, attendanceRate: '0%', totalPagesMuted: '0 صفحة', overdueCount: 0 };
  }
}
