/**
 * src/lib/dashboardService.js
 * التحديث الشامل لدعم الإحصائيات العالمية، الـ Streaks، والروايات وأنظمة التسميع
 */

export async function getDashboardStats(supabase, profile) {
  try {
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Africa/Cairo' });

    // 🔴 صلاحية الأدمن العام 'super_admin'
    if (profile?.role === 'super_admin') {
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: academiesCount } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      return { 
        studentsCount: studentsCount || 0, 
        academiesCount: academiesCount || 0,
        attendanceRate: '0%',
        totalSessions: 0,
        overdueCount: 0,
        activeHalaqasData: [],
        avgStreak: 0
      };
    } 
    
    // 🟢 صلاحية مدير الأكاديمية أو المعلم
    else if (profile?.academy_id) {
      const academyId = profile.academy_id;

      // أ) إجمالي عدد طلاب الأكاديمية
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId);

      // ب) متوسط سلاسل الحفظ الاستمرارية (Streaks) للطلاب
      const { data: streakData } = await supabase
        .from('student_streaks')
        .select('current_streak')
        .eq('academy_id', academyId);

      let avgStreak = 0;
      if (streakData && streakData.length > 0) {
        const totalStreak = streakData.reduce((acc, curr) => acc + (curr.current_streak || 0), 0);
        avgStreak = Math.round(totalStreak / streakData.length);
      }

      // ج) حساب نسبة الحضور اليومي
      const { data: attendanceData, error: attError } = await supabase
        .from('attendance')
        .select('status, halaqa_id')
        .eq('academy_id', academyId)
        .eq('date', today);

      let attendanceRate = '0%';
      if (!attError && attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(a => a.status === 'present' || a.status === 'late').length;
        attendanceRate = `${((presentCount / attendanceData.length) * 100).toFixed(1)}%`;
      }

      // د) إجمالي ورد التسميع اليومي (يدعم نظام الآيات ونظام اللوح والراتب)
      const { count: progressCount } = await supabase
        .from('daily_progress')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('date', today);

      // هـ) الاشتراكات المتأخرة
      const { count: overdueCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'overdue');

      // و) جلب حلقات اليوم النشطة مع دعم الروايات والمعلمين
      const { data: halaqasData, error: halaqasError } = await supabase
        .from('halaqas')
        .select(`
          id,
          name,
          start_time,
          end_time,
          teaching_type,
          educational_track,
          teachers (
            name
          )
        `)
        .eq('academy_id', academyId)
        .eq('is_archived', false);

      let activeHalaqasData = [];

      if (!halaqasError && halaqasData) {
        const currentCairoTime = new Date().toLocaleTimeString('en-US', { 
          timeZone: 'Africa/Cairo', 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

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
          let status = 'upcoming';
          if (currentCairoTime >= halaqa.start_time && currentCairoTime <= halaqa.end_time) {
            status = 'live';
          } else if (currentCairoTime > halaqa.end_time) {
            status = 'finished';
          }

          const startFormatted = formatTimeDisplay(halaqa.start_time);
          const endFormatted = formatTimeDisplay(halaqa.end_time);

          const halaqaAttendance = attendanceData?.filter(a => a.halaqa_id === halaqa.id) || [];
          let attendance_rate = null;
          if (halaqaAttendance.length > 0) {
            const presentCount = halaqaAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
            attendance_rate = Math.round((presentCount / halaqaAttendance.length) * 100);
          }

          const nameObj = typeof halaqa.name === 'object' && halaqa.name !== null ? halaqa.name : {};
          const nameAr = nameObj.ar || nameObj.en || (typeof halaqa.name === 'string' ? halaqa.name : '');
          const nameEn = nameObj.en || nameObj.ar || (typeof halaqa.name === 'string' ? halaqa.name : '');

          return {
            id: halaqa.id,
            name_ar: nameAr,
            name_en: nameEn,
            teacher_name_ar: halaqa.teachers?.name || 'غير محدد',
            teacher_name_en: halaqa.teachers?.name || 'Not Assigned',
            time_display_ar: `${startFormatted.ar} - ${endFormatted.ar}`,
            time_display_en: `${startFormatted.en} - ${endFormatted.en}`,
            teaching_type: halaqa.teaching_type || 'حضوري',
            status,
            attendance_rate
          };
        });
      }

      return { 
        studentsCount: studentsCount || 0, 
        academiesCount: null,
        attendanceRate,
        totalSessions: progressCount || 0,
        overdueCount: overdueCount || 0,
        activeHalaqasData,
        avgStreak
      }; 
    }

    return { studentsCount: 0, academiesCount: 0, attendanceRate: '0%', totalSessions: 0, overdueCount: 0, activeHalaqasData: [], avgStreak: 0 };

  }احضار (error) {
    console.error('Error fetching dashboard stats:', error);
    return { studentsCount: 0, academiesCount: 0, attendanceRate: '0%', totalSessions: 0, overdueCount: 0, activeHalaqasData: [], avgStreak: 0 };
  }
}
