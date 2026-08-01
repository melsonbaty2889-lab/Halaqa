/**
 * src/lib/dashboardService.js
 * تم التحديث للتوافق مع حقول Supabase الحقيقية (JSONB name)
 */

export async function getDashboardStats(supabase, profile) {
  try {
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Africa/Cairo' });

    // 🔴 صلاحية الأدمن العام 'super_admin'
    if (profile?.role === 'super_admin') {
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: academiesCount, error: academiesError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      if (studentsError || academiesError) throw new Error('خطأ في جلب بيانات الإدارة العامة');

      return { 
        studentsCount: studentsCount || 0, 
        academiesCount: academiesCount || 0,
        attendanceRate: '0%',
        totalSessions: 0,
        overdueCount: 0,
        activeHalaqasData: []
      };
    } 
    
    // 🟢 صلاحية مدير الأكاديمية أو المعلم
    else if (profile?.academy_id) {
      const academyId = profile.academy_id;

      // أ) إجمالي عدد طلاب الأكاديمية
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId);

      if (studentsError) console.warn('خطأ في جلب عدد الطلاب:', studentsError);

      // ب) حساب نسبة الحضور اليومي
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

      // ج) إجمالي ورد التسميع اليومي
      const { count: progressCount, error: progressError } = await supabase
        .from('daily_progress')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('date', today);

      if (progressError) console.warn('خطأ في جلب التسميع اليومي:', progressError);

      // د) الاشتراكات المتأخرة
      const { count: overdueCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'overdue');

      // هـ) جلب حلقات اليوم النشطة (تحديد الحقل name الجيسون)
      const { data: halaqasData, error: halaqasError } = await supabase
        .from('halaqas')
        .select(`
          id,
          name,
          start_time,
          end_time,
          teachers (
            name
          )
        `)
        .eq('academy_id', academyId)
        .eq('status', 'active')
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

          // معالجة حقل name الجيسون
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
        activeHalaqasData
      }; 
    }

    return { 
      studentsCount: 0, 
      academiesCount: 0, 
      attendanceRate: '0%', 
      totalSessions: 0, 
      overdueCount: 0, 
      activeHalaqasData: [] 
    };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { 
      studentsCount: 0, 
      academiesCount: 0, 
      attendanceRate: '0%', 
      totalSessions: 0, 
      overdueCount: 0, 
      activeHalaqasData: [] 
    };
  }
}
