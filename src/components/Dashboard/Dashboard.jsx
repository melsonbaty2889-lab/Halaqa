/* src/components/Dashboard.jsx */
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { getDashboardStats } from '@/lib/dashboardService';
import styles from '@/components/Dashboard/Dashboard.module.css';
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
  Landmark 
} from 'lucide-react';

// ✅ تحميل ديناميكي متوافق مع App.jsx
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
    activeHalaqasData: []
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
      return isArabic ? 'إدارة المنصة' : 'Platform Admin';
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
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData, academyId]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer} style={{ padding: '20px' }}>
        <div style={{ height: '36px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', width: '40%', marginBottom: '20px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '110px', background: 'rgba(255,255,255,0.06)', borderRadius: '16px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (isSuperAdmin) {
    return (
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>⏳ Loading Admin Panel...</div>}>
        <AdminDashboard isRtl={isRtl} academyName={displayName} onLogout={() => supabase.auth.signOut()} />
      </Suspense>
    );
  }

  return (
    <div className={styles.dashboardContainer} style={{ paddingBottom: '80px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      
      {/* 1️⃣ الترويسة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px 0', lineHeight: '1.3' }}>
            {isArabic ? 'مرحباً بك' : 'Welcome'}, {displayName} 👋
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.82rem', margin: 0 }}>
            {isArabic ? 'مركز الإدارة والعمليات اليومية المباشرة' : 'Live Daily Management & Analytics Center'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', fontSize: '0.78rem', color: '#34D399', fontWeight: '600' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
          <span>{isArabic ? 'متزامن' : 'Synced'}</span>
          {lastSyncTime && <span style={{ opacity: 0.8, fontSize: '0.75rem', color: '#CBD5E1' }}>({lastSyncTime})</span>}
        </div>
      </div>

      {/* 2️⃣ شريط الوصول السريع */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px', scrollbarWidth: 'none' }}>
        <button 
          onClick={() => setActiveTab && setActiveTab('halaqas')} 
          style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}>
          <Plus size={15} />
          <span>{isArabic ? 'جدولة حلقة' : 'Add Halaqa'}</span>
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('attendance')} 
          style={{ background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardCheck size={16} style={{ color: '#38BDF8' }} />
          <span>{isArabic ? 'تسجيل حضور' : 'Take Attendance'}</span>
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('students')} 
          style={{ background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} style={{ color: '#FBBF24' }} />
          <span>{isArabic ? 'رصد التسميع' : 'Record Recitation'}</span>
        </button>
      </div>

      {/* 3️⃣ البطاقات الرئيسية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div 
          onClick={() => setActiveTab && setActiveTab('students')}
          style={{ background: '#1E293B', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'إجمالي الدارسين' : 'Total Students'}</span>
            <GraduationCap style={{ color: '#38BDF8' }} size={22} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#FFFFFF' }}>{safeText(stats?.studentsCount, '0')}</div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? '↑ مسجلون بالحلقات' : '↑ Enrolled'}
          </div>
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('attendance')}
          style={{ background: '#1E293B', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'نسبة الحضور اليومي' : 'Daily Attendance'}</span>
            <TrendingUp style={{ color: '#38BDF8' }} size={22} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#38BDF8' }}>{safeText(stats?.attendanceRate, '0%')}</div>
          <div style={{ fontSize: '0.75rem', color: '#7DD3FC', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? 'مؤشر أداء اليوم' : 'Today Performance'}
          </div>
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('halaqas')}
          style={{ background: '#1E293B', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'جلسات التسميع اليوم' : 'Recitation Sessions'}</span>
            <BookOpen style={{ color: '#FBBF24' }} size={22} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#FBBF24' }}>
            {safeText(stats?.totalSessions, '0')} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#CBD5E1' }}>{isArabic ? 'جلسة' : 'Sessions'}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#FDE047', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? 'إجمالي المسموع اليوم' : 'Completed Today'}
          </div>
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('payments')}
          style={{ background: '#1E293B', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'المتأخرات المعلقة' : 'Pending Overdues'}</span>
            <AlertTriangle style={{ color: (stats?.overdueCount || 0) > 0 ? '#F87171' : '#34D399' }} size={22} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: (stats?.overdueCount || 0) > 0 ? '#F87171' : '#34D399' }}>
            {safeText(stats?.overdueCount, '0')}
          </div>
          <div style={{ fontSize: '0.75rem', color: (stats?.overdueCount || 0) > 0 ? '#FCA5A5' : '#A7F3D0', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? 'اشتراكات تحتاج متابعة' : 'Requires Follow-up'}
          </div>
        </div>
      </div>

      {/* 4️⃣ الحلقات المباشرة والتنبيهات */}
      {stats?.activeHalaqasData && stats.activeHalaqasData.length > 0 ? (
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', color: '#FFFFFF', margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark style={{ color: '#38BDF8' }} size={18} />
              <span>{isArabic ? 'حلقات اليوم المباشرة' : 'Today Active Halaqas'}</span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              {stats.activeHalaqasData.length} {isArabic ? 'حلقة مسجلة' : 'halaqas'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {stats.activeHalaqasData.map((halaqa, idx) => {
              const isLive = halaqa.status === 'live';
              const isFinished = halaqa.status === 'finished';
              
              const statusBg = isLive ? 'rgba(239, 68, 68, 0.18)' : isFinished ? 'rgba(16, 185, 129, 0.18)' : 'rgba(56, 189, 248, 0.18)';
              const statusColor = isLive ? '#EF4444' : isFinished ? '#10B981' : '#38BDF8';
              const statusLabel = isLive 
                ? (isArabic ? 'قائمة الآن' : 'Live Now') 
                : isFinished 
                ? (isArabic ? 'انتهت' : 'Finished') 
                : (isArabic ? 'قادمة' : 'Upcoming');

              const StatusIcon = isLive ? RefreshCw : isFinished ? CheckCircle2 : Hourglass;

              const halaqaName = safeText(isArabic ? (halaqa.name_ar || halaqa.name) : (halaqa.name_en || halaqa.name), isArabic ? 'حلقة قرآنيّة' : 'Quran Halaqa');
              const teacherName = safeText(isArabic ? (halaqa.teacher_name_ar || halaqa.teacher_name) : (halaqa.teacher_name_en || halaqa.teacher_name), isArabic ? 'غير محدد' : 'N/A');
              const timeDisplay = safeText(isArabic ? (halaqa.time_display_ar || halaqa.time_display) : (halaqa.time_display_en || halaqa.time_display), '');

              return (
                <div key={halaqa.id || idx} style={{ background: '#0F172A', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '0.9rem', fontWeight: '700' }}>
                      {halaqaName}
                    </h4>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', background: statusBg, color: statusColor, fontSize: '0.72rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <StatusIcon size={12} className={isLive ? styles?.spinning || '' : ''} />
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User style={{ color: '#94A3B8' }} size={14} />
                    <span>{isArabic ? `المعلم: ${teacherName}` : `Teacher: ${teacherName}`}</span>
                  </div>

                  {timeDisplay && (
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock style={{ color: '#94A3B8' }} size={14} />
                      <span>{timeDisplay}</span>
                    </div>
                  )}

                  {halaqa.attendance_rate !== undefined && halaqa.attendance_rate !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: '#38BDF8' }}>
                      <span>{isArabic ? 'نسبة حضور الحلقة:' : 'Attendance:'}</span>
                      <span style={{ fontWeight: 'bold' }}>{safeText(halaqa.attendance_rate)}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (stats?.overdueCount || 0) > 0 ? (
        <div style={{ background: '#1E293B', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(248, 113, 113, 0.3)', marginBottom: '20px' }}>
          <div 
            onClick={() => setActiveTab && setActiveTab('payments')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle style={{ color: '#F87171' }} size={18} />
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '0.85rem' }}>
                  {isArabic ? 'تنبيه: اشتراكات مستحقة التحصيل' : 'Alert: Pending Overdue Payments'}
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '2px' }}>
                  {isArabic ? `يوجد ${stats.overdueCount} اشتراكات تحتاج المتابعة اليوم` : `There are ${stats.overdueCount} payments requiring follow up`}
                </div>
              </div>
            </div>
            <span style={{ color: '#F87171', fontWeight: 'bold', fontSize: '0.8rem' }}>
              {isArabic ? 'متابعة ←' : 'Review →'}
            </span>
          </div>
        </div>
      ) : null}

    </div>
  );
}
