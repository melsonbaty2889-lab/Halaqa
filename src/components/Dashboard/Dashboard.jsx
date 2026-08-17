import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { getDashboardStats } from '@/lib/dashboardService';
import styles from '@/components/Dashboard/Dashboard.module.css';
import { colors as C } from '@/theme/colors';
import { 
  GraduationCap, 
  TrendingUp, 
  BookOpen, 
  AlertTriangle, 
  Plus, 
  ClipboardCheck, 
  Clock, 
  User, 
  CheckCircle2, 
  Hourglass, 
  RefreshCw, 
  Landmark,
  Flame,
  Award
} from 'lucide-react';

const AdminDashboard = lazy(() => import('@/components/Dashboard/AdminDashboard'));

export default function Dashboard({ 
  session, 
  userRole,
  setActiveTab, 
  preloadedDashboardData
}) {
  const { i18n } = useTranslation();
  
  const isArabic = !i18n.language || i18n.language.startsWith('ar');
  const isRtl = i18n.dir() === 'rtl' || isArabic;
  const currentLang = i18n.language || 'ar';
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    studentsCount: 0,
    academiesCount: 0,
    attendanceRate: '0%',
    totalSessions: 0,
    overdueCount: 0,
    activeHalaqasData: [],
    avgStreak: 0
  });
  
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const safeText = useCallback((val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return isArabic ? (val.ar || val.en || fallback) : (val.en || val.ar || fallback);
    }
    return fallback;
  }, [isArabic]);

  const isSuperAdmin = userRole === 'super_admin';
  const rawAcademyName = preloadedDashboardData?.academyName || preloadedDashboardData?.name || "";
  const rawUserName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';
  
  const displayName = useMemo(() => {
    const parsedAcademyName = safeText(rawAcademyName);
    if (parsedAcademyName) return parsedAcademyName;
    const parsedUserName = safeText(rawUserName);
    if (!parsedUserName || parsedUserName === 'Global Platform Admin' || parsedUserName.toLowerCase().includes('admin')) {
      return isArabic ? 'إدارة المنصة' : 'Platform Administration';
    }
    return parsedUserName;
  }, [rawAcademyName, rawUserName, isArabic, safeText]);

  const academyId = preloadedDashboardData?.academy_id || preloadedDashboardData?.id || session?.user?.user_metadata?.academy_id;

  const fetchDashboardData = useCallback(async (showOverlay = true) => {
    if (showOverlay) setLoading(true);
    try {
      const profile = { role: userRole, academy_id: academyId };
      const data = await getDashboardStats(supabase, profile);
      if (data) {
        setStats(data);
      }
      setLastSyncTime(new Date().toLocaleTimeString(currentLang, { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [userRole, academyId, currentLang]);

  useEffect(() => {
    fetchDashboardData(true);
    if (!academyId) return;

    const filterCondition = `academy_id=eq.${academyId}`;
    let debounceTimer = null;

    const handleRealtimeChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchDashboardData(false);
      }, 300);
    };

    const channel = supabase
      .channel(`dashboard-realtime-${academyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: filterCondition }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_progress', filter: filterCondition }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: filterCondition }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'halaqas', filter: filterCondition }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_streaks', filter: filterCondition }, handleRealtimeChange)
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData, academyId]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer} style={{ padding: '16px' }}>
        <div style={{ height: '32px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', width: '50%', marginBottom: '16px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '100px', background: C.dark.card, border: `1px solid ${C.dark.border}`, borderRadius: '14px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (isSuperAdmin) {
    return (
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: C.text.muted }}>⏳ جاري تحميل لوحة التحكم...</div>}>
        <AdminDashboard isRtl={isRtl} academyName={displayName} onLogout={() => supabase.auth.signOut()} />
      </Suspense>
    );
  }

  return (
    <div className={styles.dashboardContainer} style={{ padding: '12px 12px 80px 12px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      
      {/* 1. الترويسة الرئيسية مع دعم الموبايل */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.text.title, margin: '0 0 4px 0', lineHeight: '1.3' }}>
              {isArabic ? 'أهلاً بك،' : 'Welcome back,'} {displayName} 👋
            </h1>
            <p style={{ color: C.text.muted, fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>
              {isArabic ? 'منصة إدارة الحلقات الحية والرصد الأكاديمي الموحد' : 'Live Session & Academic Ecosystem'}
            </p>
          </div>

          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '4px 10px', 
            background: C.brandEmerald.bgGlow, 
            border: `1px solid ${C.brandEmerald.DEFAULT}`, 
            borderRadius: '20px', 
            fontSize: '0.72rem', 
            color: C.brandEmerald.DEFAULT, 
            fontWeight: '700',
            alignSelf: 'flex-start'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.brandEmerald.DEFAULT, boxShadow: `0 0 8px ${C.brandEmerald.DEFAULT}` }}></span>
            <span>{isArabic ? 'متزامن لحظياً' : 'Realtime Synced'}</span>
            {lastSyncTime && <span style={{ opacity: 0.8, fontSize: '0.7rem', color: C.text.body }}>({lastSyncTime})</span>}
          </div>
        </div>
      </div>

      {/* 2. شريط الوصول السريع (سلس وسهل التمرير على الهاتف) */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        overflowX: 'auto', 
        paddingBottom: '8px', 
        marginBottom: '20px', 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}>
        <button 
          onClick={() => setActiveTab && setActiveTab('halaqas')} 
          style={{ 
            background: C.primary.gradient, 
            color: '#FFFFFF', 
            border: 'none', 
            padding: '10px 14px', 
            borderRadius: '12px', 
            fontSize: '0.8rem', 
            fontWeight: '700', 
            cursor: 'pointer', 
            whiteSpace: 'nowrap', 
            flexShrink: 0,
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)' 
          }}>
          <Plus size={15} />
          <span>{isArabic ? 'إطلاق حلقة تعليمية' : 'Launch Session'}</span>
        </button>

        <button 
          onClick={() => setActiveTab && setActiveTab('attendance')} 
          style={{ 
            background: C.dark.card, 
            color: C.text.title, 
            border: `1px solid ${C.dark.border}`, 
            padding: '10px 14px', 
            borderRadius: '12px', 
            fontSize: '0.8rem', 
            fontWeight: '600', 
            cursor: 'pointer', 
            whiteSpace: 'nowrap', 
            flexShrink: 0,
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px' 
          }}>
          <ClipboardCheck size={15} style={{ color: '#38BDF8' }} />
          <span>{isArabic ? 'تسجيل الحضور' : 'Attendance Record'}</span>
        </button>

        <button 
          onClick={() => setActiveTab && setActiveTab('students')} 
          style={{ 
            background: C.dark.card, 
            color: C.text.title, 
            border: `1px solid ${C.dark.border}`, 
            padding: '10px 14px', 
            borderRadius: '12px', 
            fontSize: '0.8rem', 
            fontWeight: '600', 
            cursor: 'pointer', 
            whiteSpace: 'nowrap', 
            flexShrink: 0,
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px' 
          }}>
          <BookOpen size={15} style={{ color: C.primary.DEFAULT }} />
          <span>{isArabic ? 'توثيق الإنجاز والتسميع' : 'Evaluation'}</span>
        </button>
      </div>

      {/* 3. البطاقات الإحصائية (شبكة مرنة تناسب شاشة الموبايل بشكل ممتاز) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        
        {/* إجمالي الدارسين */}
        <div 
          onClick={() => setActiveTab && setActiveTab('students')}
          style={{ background: C.dark.card, padding: '14px', borderRadius: '14px', border: `1px solid ${C.dark.border}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.text.muted, fontSize: '0.78rem', fontWeight: '600', marginBottom: '6px' }}>
            <span style={{ truncate: true }}>{isArabic ? 'إجمالي الطلاب' : 'Total Learners'}</span>
            <GraduationCap style={{ color: '#38BDF8' }} size={18} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: C.text.title }}>{safeText(stats?.studentsCount, '0')}</div>
          <div style={{ fontSize: '0.7rem', color: C.brandEmerald.DEFAULT, marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? '↑ طلاب نشطون' : '↑ Active Enrolled'}
          </div>
        </div>

        {/* متوسط الاستمرارية */}
        <div style={{ background: C.dark.card, padding: '14px', borderRadius: '14px', border: `1px solid ${C.dark.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.text.muted, fontSize: '0.78rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'مؤشر الاستمرارية' : 'Consistency'}</span>
            <Flame style={{ color: '#F97316' }} size={18} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#F97316' }}>
            {safeText(stats?.avgStreak, '0')} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: C.text.body }}>{isArabic ? 'يوم' : 'Days'}</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#FB923C', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? '🔥 التتابع المستمر' : 'Active Streak'}
          </div>
        </div>

        {/* نسبة الحضور */}
        <div 
          onClick={() => setActiveTab && setActiveTab('attendance')}
          style={{ background: C.dark.card, padding: '14px', borderRadius: '14px', border: `1px solid ${C.dark.border}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.text.muted, fontSize: '0.78rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'نسبة الحضور' : 'Daily Attendance'}</span>
            <TrendingUp style={{ color: '#38BDF8' }} size={18} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#38BDF8' }}>{safeText(stats?.attendanceRate, '0%')}</div>
          <div style={{ fontSize: '0.7rem', color: '#7DD3FC', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? 'معدل المشاركة' : 'Engagement Rate'}
          </div>
        </div>

        {/* جلسات التسميع */}
        <div 
          onClick={() => setActiveTab && setActiveTab('halaqas')}
          style={{ background: C.dark.card, padding: '14px', borderRadius: '14px', border: `1px solid ${C.dark.border}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.text.muted, fontSize: '0.78rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'جلسات التسميع' : 'Evaluations'}</span>
            <BookOpen style={{ color: C.primary.DEFAULT }} size={18} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: C.primary.DEFAULT }}>
            {safeText(stats?.totalSessions, '0')} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: C.text.body }}>{isArabic ? 'جلسة' : 'Sessions'}</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: C.primary.hover, marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? 'المكتملة اليوم' : 'Completed Today'}
          </div>
        </div>

        {/* المتأخرات */}
        <div 
          onClick={() => setActiveTab && setActiveTab('payments')}
          style={{ background: C.dark.card, padding: '14px', borderRadius: '14px', border: `1px solid ${C.dark.border}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.text.muted, fontSize: '0.78rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'المتأخرات' : 'Status'}</span>
            <AlertTriangle style={{ color: (stats?.overdueCount || 0) > 0 ? C.error.DEFAULT : C.brandEmerald.DEFAULT }} size={18} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: (stats?.overdueCount || 0) > 0 ? C.error.DEFAULT : C.brandEmerald.DEFAULT }}>
            {safeText(stats?.overdueCount, '0')}
          </div>
          <div style={{ fontSize: '0.7rem', color: (stats?.overdueCount || 0) > 0 ? C.error.light : C.brandEmerald.DEFAULT, marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? 'طلبات التعديل' : 'Tasks'}
          </div>
        </div>

      </div>

      {/* 4. الحلقات المباشرة وأنظمة التسميع */}
      {stats?.activeHalaqasData && stats.activeHalaqasData.length > 0 ? (
        <div style={{ background: C.dark.card, padding: '16px', borderRadius: '16px', border: `1px solid ${C.dark.border}`, marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.95rem', color: C.text.title, margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Landmark style={{ color: C.primary.DEFAULT }} size={18} />
              <span>{isArabic ? 'الحلقات النشطة' : 'Active Sessions'}</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: C.text.muted }}>
              {stats.activeHalaqasData.length} {isArabic ? 'حلقة' : 'active'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {stats.activeHalaqasData.map((halaqa, idx) => {
              const isLive = halaqa.status === 'live';
              const isFinished = halaqa.status === 'finished';
              
              const statusBg = isLive ? C.error.bgGlow : isFinished ? C.brandEmerald.bgGlow : 'rgba(56, 189, 248, 0.15)';
              const statusColor = isLive ? C.error.DEFAULT : isFinished ? C.brandEmerald.DEFAULT : '#38BDF8';
              const statusLabel = isLive 
                ? (isArabic ? 'جارية الآن' : 'Live') 
                : isFinished 
                ? (isArabic ? 'مكتملة' : 'Completed') 
                : (isArabic ? 'مجدولة' : 'Upcoming');

              const StatusIcon = isLive ? RefreshCw : isFinished ? CheckCircle2 : Hourglass;
              const halaqaName = safeText(isArabic ? halaqa.name_ar : halaqa.name_en, isArabic ? 'حلقة تعليمية' : 'Quran Session');
              const teacherName = safeText(isArabic ? halaqa.teacher_name_ar : halaqa.teacher_name_en, isArabic ? 'غير محدد' : 'N/A');
              const timeDisplay = safeText(isArabic ? halaqa.time_display_ar : halaqa.time_display_en, '');
              const teachingType = safeText(halaqa.teaching_type, 'حضوري');

              return (
                <div key={halaqa.id || idx} style={{ background: C.dark.surface, padding: '12px', borderRadius: '12px', border: `1px solid ${C.dark.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: C.text.title, fontSize: '0.88rem', fontWeight: '700' }}>
                      {halaqaName}
                    </h4>
                    <span style={{ padding: '3px 8px', borderRadius: '10px', background: statusBg, color: statusColor, fontSize: '0.7rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <StatusIcon size={12} className={isLive ? styles?.spinning || '' : ''} />
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: C.text.body, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User style={{ color: C.text.muted }} size={14} />
                    <span>{isArabic ? `المعلم: ${teacherName}` : `Teacher: ${teacherName}`}</span>
                  </div>

                  {timeDisplay && (
                    <div style={{ fontSize: '0.75rem', color: C.text.muted, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock style={{ color: C.text.muted }} size={14} />
                      <span>{timeDisplay}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: C.primary.bgGlow, color: C.primary.DEFAULT, border: `1px solid ${C.primary.bgGlow}`, fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Award size={11} />
                      <span>{teachingType}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

    </div>
  );
}
