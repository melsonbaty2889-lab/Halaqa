/**
 * src/lib/dashboardService.js
 * التحديث الشامل لدعم الإحصائيات العالمية، الـ Streaks، والروايات وأنظمة التسميع
 * مطابق تماماً لهيكل جداول Supabase المتعددة اللغات (JSONB)
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
        avgStreak: 0,
        atRiskStudents: [],
        topPerformers: []
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

      // ب) متوسط سلاسل الحفظ الاستمرارية (Streaks) والطلاب العالقين
      const { data: streakData } = await supabase
        .from('student_streaks')
        .select('student_id, current_streak, last_activity_date, students(name)')
        .eq('academy_id', academyId);

      let avgStreak = 0;
      let atRiskStudents = [];

      if (streakData && streakData.length > 0) {
        const totalStreak = streakData.reduce((acc, curr) => acc + (curr.current_streak || 0), 0);
        avgStreak = Math.round(totalStreak / streakData.length);

        // تصفية الطلاب الذين توقفوا عن التسميع أو انخفضت استمراريتهم
        atRiskStudents = streakData
          .filter(s => (s.current_streak === 0 || !s.last_activity_date || s.last_activity_date < today))
          .slice(0, 5)
          .map(s => ({
            id: s.student_id,
            name: s.students?.name || null, // كائن JSONB
            streak: s.current_streak || 0,
            lastActivity: s.last_activity_date
          }));
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

      // د) إجمالي ورد التسميع اليومي والمتصدرين
      const { data: progressData, count: progressCount } = await supabase
        .from('daily_progress')
        .select('student_id, grade, students(name)', { count: 'exact' })
        .eq('academy_id', academyId)
        .eq('date', today);

      let topPerformers = [];
      if (progressData && progressData.length > 0) {
        // تجميع التسميع اليومي حسب الطالب
        const studentMap = {};
        progressData.forEach(p => {
          if (!p.student_id) return;
          if (!studentMap[p.student_id]) {
            studentMap[p.student_id] = {
              id: p.student_id,
              name: p.students?.name || null,
              sessionsCount: 0
            };
          }
          studentMap[p.student_id].sessionsCount += 1;
        });

        topPerformers = Object.values(studentMap)
          .sort((a, b) => b.sessionsCount - a.sessionsCount)
          .slice(0, 5);
      }

      // هـ) الاشتراكات المتأخرة
      const { count: overdueCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'overdue');

      // و) جلب حلقات اليوم النشطة
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

          return {
            id: halaqa.id,
            name: halaqa.name,
            teacher_name: halaqa.teachers?.name || null,
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
        avgStreak,
        atRiskStudents,
        topPerformers
      }; 
    }

    return { 
      studentsCount: 0, 
      academiesCount: 0, 
      attendanceRate: '0%', 
      totalSessions: 0, 
      overdueCount: 0, 
      activeHalaqasData: [], 
      avgStreak: 0,
      atRiskStudents: [],
      topPerformers: []
    };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { 
      studentsCount: 0, 
      academiesCount: 0, 
      attendanceRate: '0%', 
      totalSessions: 0, 
      overdueCount: 0, 
      activeHalaqasData: [], 
      avgStreak: 0,
      atRiskStudents: [],
      topPerformers: []
    };
  }
}
