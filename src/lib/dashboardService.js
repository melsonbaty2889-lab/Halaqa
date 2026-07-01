/**
 * هذا الملف يحتوي على وظائف جلب البيانات (Services)
 * لضمان نظافة كود الواجهة (UI)
 */

export async function getDashboardStats(supabase, profile) {
  try {
    const today = new Date().toISOString().split('T')[0]; // جلب تاريخ اليوم الحالي بدقة

    // 1. صلاحية 'super_admin'
    if (profile?.role === 'super_admin') {
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: academiesCount, error: academiesError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      if (studentsError || academiesError) throw new Error('خطأ في جلب بيانات الإدارة');

      return { 
        studentsCount, 
        academiesCount,
        attendanceRate: null,
        totalPagesMuted: null,
        overdueCount: null,
        activeHalaqasData: []
      };
    } 
    
    // 2. صلاحية مدير أكاديمية أو معلم (بيانات الأكاديمية الحية)
    else if (profile?.academy_id) {
      const academyId = profile.academy_id;

      // أ) عدد طلاب الأكاديمية الإجمالي
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId);

      if (studentsError) throw new Error('خطأ في جلب بيانات الأكاديمية');

      // ب) حساب نسبة الحضور اليومي الإجمالية لطلاب هذه الأكاديمية
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

      // ج) حساب إجمالي الصفحات المسمّعة اليوم
      const { data: quranData, error: quranError } = await supabase
        .from('daily_progress') // تعديل اسم الجدول ليتطابق مع الـ Schema المرفقة بالصورة daily_progress
        .select('pages_count')
        .eq('academy_id', academyId)
        .eq('date', today);

      const totalPages = quranError ? 0 : (quranData?.reduce((sum, item) => sum + (item.pages_count || 0), 0) || 0);

      // د) رصد الاشتراكات المتأخرة
      const { count: overdueCount } = await supabase
        .from('payments') // الاعتماد على جدول المدفوعات من صورتك لرصد الحالات المعلقة
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'overdue');

      // هـ) ⚡ جلب حلقات اليوم النشطة الحقيقية مع بيانات المعلم المرتبط بها
      const { data: halaqasData, error: halaqasError } = await supabase
        .from('halaqas')
        .select(`
          id,
          name_ar,
          name_en,
          start_time,
          end_time,
          teachers (
            name
          )
        `)
        .eq('academy_id', academyId);

      let activeHalaqasData = [];

      if (!halaqasError && halaqasData) {
        // جلب الوقت الحالي الفوري متوافقاً مع توقيت القاهرة المعتمد بالمنظومة لمنع فارق التوقيت العالمي
        const currentCairoTime = new Date().toLocaleTimeString('en-US', { 
          timeZone: 'Africa/Cairo', 
          hour12: false 
        }); // مخرجات بصيغة: "14:30:00"

        // دالة مساعدة مطورة لتحويل صيغة الوقت من السيرفر (16:00:00) إلى واجهة العرض (04:00 م)
        const formatTimeDisplay = (timeStr) => {
          if (!timeStr) return { ar: '', en: '' };
          const [hourStr, minuteStr] = timeStr.split(':');
          let hour = parseInt(hourStr, 10);
          const ampmAr = hour >= 12 ? 'م' : 'ص';
          const ampmEn = hour >= 12 ? 'PM' : 'AM';
          hour = hour % 12 || 12;
          const formattedHour = hour < 10 ? `0${hour}` : hour;
          return {
            ar: `${formattedHour}:${minuteStr} ${ampmAr}`,
            en: `${formattedHour}:${minuteStr} ${ampmEn}`
          };
        };

        activeHalaqasData = halaqasData.map(halaqa => {
          // 1. حساب الحالة اللحظية للحلقة تلقائياً بناءً على ساعة السيرفر الحالية
          let status = 'upcoming';
          if (currentCairoTime >= halaqa.start_time && currentCairoTime <= halaqa.end_time) {
            status = 'live';
          } else if (currentCairoTime > halaqa.end_time) {
            status = 'finished';
          }

          const startFormatted = formatTimeDisplay(halaqa.start_time);
          const endFormatted = formatTimeDisplay(halaqa.end_time);

          // 2. حساب نسبة الحضور الحقيقية المخصصة لهذه الحلقة تحديداً اليوم
          const halaqaAttendance = attendanceData?.filter(a => a.halaqa_id === halaqa.id) || [];
          let attendance_rate = null;
          if (halaqaAttendance.length > 0) {
            const presentCount = halaqaAttendance.filter(a => a.status === 'present').length;
            attendance_rate = Math.round((presentCount / halaqaAttendance.length) * 100);
          }

          return {
            id: halaqa.id,
            name_ar: halaqa.name_ar,
            name_en: halaqa.name_en || halaqa.name_ar,
            teacher_name_ar: halaqa.teachers?.name || 'غير محدد',
            teacher_name_en: halaqa.teachers?.name || 'Not Assigned',
            time_display_ar: `${startFormatted.ar} - ${endFormatted.ar}`,
            time_display_en: `${startFormatted.en} - ${endFormatted.en}`,
            status,
            attendance_rate
          };
        });
      }

      return { 
        studentsCount, 
        academiesCount: null,
        attendanceRate,
        totalPagesMuted: `${totalPages} صفحة`,
        overdueCount: overdueCount || 0,
        activeHalaqasData // إرسال مصفوفة الحلقات الحية للـ UI
      }; 
    }

    return { studentsCount: 0, academiesCount: 0, attendanceRate: '0%', totalPagesMuted: '0 صفحة', overdueCount: 0, activeHalaqasData: [] };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { studentsCount: 0, academiesCount: 0, attendanceRate: '0%', totalPagesMuted: '0 صفحة', overdueCount: 0, activeHalaqasData: [] };
  }
}
