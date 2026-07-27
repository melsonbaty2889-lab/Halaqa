/**
 * Src/lib/dashboardService.js
 * خدمات جلب البيانات للوحة التحكم مع معالجة دقيقة لتوقيت القاهرة
 */

export async function getDashboardStats(supabase, profile) {
  try {
    // 1️⃣ جلب تاريخ اليوم الفعلي بتوقيت القاهرة بصيغة YYYY-MM-DD
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Africa/Cairo' });

    // 🔴 صلاحية 'super_admin'
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
    
    // 🟢 صلاحية مدير أكاديمية أو معلم
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
        .select('status, halaqa_id')
        .eq('academy_id', academyId)
        .eq('date', today);

      let attendanceRate = '0%';
      if (!attError && attendanceData && attendanceData.length > 0) {
        const present = attendanceData.filter(a => a.status === 'present').length;
        attendanceRate = `${((present / attendanceData.length) * 100).toFixed(1)}%`;
      }

      // ج) حساب إجمالي الصفحات المسمّعة اليوم
      const { data: quranData, error: quranError } = await supabase
        .from('daily_progress')
        .select('pages_count')
        .eq('academy_id', academyId)
        .eq('date', today);

      const totalPages = quranError ? 0 : (quranData?.reduce((sum, item) => sum + (item.pages_count || 0), 0) || 0);

      // د) رصد الاشتراكات المتأخرة
      const { count: overdueCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'overdue');

      // هـ) جلب حلقات اليوم النشطة الحقيقية
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
        // 2️⃣ جلب الوقت الحالي بتوقيت القاهرة مع إجبار الخانات المزدوجة (مثال: "09:05:00")
        const currentCairoTime = new Date().toLocaleTimeString('en-US', { 
          timeZone: 'Africa/Cairo', 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        // دالة تحويل صيغة الوقت لعرَضها بالواجهة (16:00:00 -> 04:00 م)
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
          // حساب حالة الحلقة المباشرة
          let status = 'upcoming';
          if (currentCairoTime >= halaqa.start_time && currentCairoTime <= halaqa.end_time) {
            status = 'live';
          } else if (currentCairoTime > halaqa.end_time) {
            status = 'finished';
          }

          const startFormatted = formatTimeDisplay(halaqa.start_time);
          const endFormatted = formatTimeDisplay(halaqa.end_time);

          // حساب نسبة الحضور المخصصة لهذه الحلقة
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
        studentsCount: studentsCount || 0, 
        academiesCount: null,
        attendanceRate,
        totalPagesMuted: `${totalPages} صفحة`,
        overdueCount: overdueCount || 0,
        activeHalaqasData
      }; 
    }

    return { studentsCount: 0, academiesCount: 0, attendanceRate: '0%', totalPagesMuted: '0 صفحة', overdueCount: 0, activeHalaqasData: [] };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { studentsCount: 0, academiesCount: 0, attendanceRate: '0%', totalPagesMuted: '0 صفحة', overdueCount: 0, activeHalaqasData: [] };
  }
}
