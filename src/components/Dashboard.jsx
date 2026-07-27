/* src/components/Dashboard.jsx - متوافق تماماً مع dashboardService.js وقاعدة البيانات */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getDashboardStats } from '../lib/dashboardService';
import AdminDashboard from './AdminDashboard';

export default function Dashboard({ 
  session, 
  userRole,
  setActiveTab, 
  preloadedDashboardData, 
  currency = 'EGP'
}) {
  const { t, i18n } = useTranslation();
  
  const isArabic = !i18n.language || i18n.language.startsWith('ar');
  const isRtl = i18n.dir() === 'rtl' || isArabic;
  const currentLang = i18n.language || 'ar';
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    studentsCount: 0,
    academiesCount: 0,
    attendanceRate: '0%',
    totalPagesMuted: '0 جلسة تسميع',
    overdueCount: 0,
    activeHalaqasData: []
  });
  
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const isSuperAdmin = userRole === 'super_admin';
  const academyName = preloadedDashboardData?.academyName || "";
  const rawUserName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';
  
  const displayName = useMemo(() => {
    if (academyName) return academyName;
    if (!rawUserName || rawUserName === 'Global Platform Admin' || rawUserName.toLowerCase().includes('admin')) {
      return isArabic ? 'إدارة المنصة العامة' : 'Global Platform Admin';
    }
    return rawUserName;
  }, [academyName, rawUserName, isArabic]);

  const academyId = preloadedDashboardData?.academy_id || preloadedDashboardData?.id || session?.user?.user_metadata?.academy_id;

  // جلب البيانات المباشرة من الخدمة
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

    // الاشتراك في التحديثات اللحظية من Supabase
    const channel = supabase
      .channel('dashboard-realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => fetchDashboardData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_progress' }, () => fetchDashboardData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchDashboardData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'halaqas' }, () => fetchDashboardData(false))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div style={{ padding: '30px' }} className="animate-pulse">
        <div style={{ height: '36px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', width: '40%' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '24px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '110px', background: 'rgba(255,255,255,0.06)', borderRadius: '16px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (isSuperAdmin) {
    return <AdminDashboard isRtl={isRtl} academyName={displayName} onLogout={() => supabase.auth.signOut()} />;
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingBottom: '80px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      
      {/* 1️⃣ الترويسة وشريط حالة المزامنة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px 0' }}>
            {isArabic ? 'السلام عليكم ورحمة الله وبركاته' : 'Assalamu Alaikum'}، {displayName} 👋
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: 0 }}>
            {isArabic ? 'مركز القيادة والعمليات والتحليلات المباشرة للمؤسسة' : 'Operational Leadership & Live Analytics Center'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '30px', fontSize: '0.82rem', color: '#34D399', fontWeight: '600' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
          <span>{isArabic ? 'متصل ومتزامن' : 'Live & Synced'}</span>
          {lastSyncTime && <span style={{ opacity: 0.85, fontSize: '0.78rem', color: '#F1F5F9' }}>({lastSyncTime})</span>}
        </div>
      </div>

      {/* 2️⃣ البطاقات الرئيسية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* إجمالي الدارسين */}
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.88rem', fontWeight: '600', marginBottom: '8px' }}>
            <span>{isArabic ? 'إجمالي الدارسين' : 'Total Students'}</span>
            <span style={{ fontSize: '1.2rem' }}>👨‍🎓</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFFFFF' }}>{stats.studentsCount ?? 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#34D399', marginTop: '6px', fontWeight: '600' }}>
            {isArabic ? '↑ مسجلون في الحلقات' : '↑ Enrolled in Halaqas'}
          </div>
        </div>

        {/* نسبة الحضور اليومي */}
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.88rem', fontWeight: '600', marginBottom: '8px' }}>
            <span>{isArabic ? 'نسبة الحضور اليومي' : 'Daily Attendance Rate'}</span>
            <span style={{ fontSize: '1.2rem' }}>📈</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#38BDF8' }}>{stats.attendanceRate || '0%'}</div>
          <div style={{ fontSize: '0.8rem', color: '#7DD3FC', marginTop: '6px', fontWeight: '600' }}>
            {isArabic ? 'مؤشر أداء اليوم' : 'Today Performance'}
          </div>
        </div>

        {/* جلسات التسميع اليوم */}
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.88rem', fontWeight: '600', marginBottom: '8px' }}>
            <span>{isArabic ? 'جلسات التسميع اليوم' : 'Recitation Sessions Today'}</span>
            <span style={{ fontSize: '1.2rem' }}>📖</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FBBF24' }}>{stats.totalPagesMuted || '0 جلسة تسميع'}</div>
          <div style={{ fontSize: '0.8rem', color: '#FDE047', marginTop: '6px', fontWeight: '600' }}>
            {isArabic ? 'إجمالي الجلسات اليوم' : 'Total Sessions Today'}
          </div>
        </div>

        {/* المتأخرات المعلقة */}
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.88rem', fontWeight: '600', marginBottom: '8px' }}>
            <span>{isArabic ? 'المتأخرات المعلقة' : 'Pending Overdues'}</span>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: stats.overdueCount > 0 ? '#F87171' : '#34D399' }}>
            {stats.overdueCount ?? 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: stats.overdueCount > 0 ? '#FCA5A5' : '#A7F3D0', marginTop: '6px', fontWeight: '600' }}>
            {isArabic ? 'اشتراكات تحتاج متابعة' : 'Requires Follow-up'}
          </div>
        </div>

      </div>

      {/* 3️⃣ قسم حلقات اليوم النشطة الحية */}
      <div style={{ background: '#1E293B', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0, fontWeight: '700' }}>
            {isArabic ? '🕌 حلقات اليوم المباشرة' : '🕌 Today Active Halaqas'}
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
            {stats.activeHalaqasData?.length || 0} {isArabic ? 'حلقات مسجلة' : 'halaqas registered'}
          </span>
        </div>

        {(!stats.activeHalaqasData || stats.activeHalaqasData.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8', fontSize: '0.9rem' }}>
            {isArabic ? 'لا توجد حلقات مسجلة لهذا اليوم.' : 'No active halaqas scheduled for today.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {stats.activeHalaqasData.map((halaqa) => {
              const isLive = halaqa.status === 'live';
              const isFinished = halaqa.status === 'finished';
              
              const statusBg = isLive ? 'rgba(239, 68, 68, 0.2)' : isFinished ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)';
              const statusColor = isLive ? '#EF4444' : isFinished ? '#10B981' : '#38BDF8';
              const statusLabel = isLive 
                ? (isArabic ? '🔴 قائمة الآن' : '🔴 Live Now') 
                : isFinished 
                ? (isArabic ? '✅ انتهت' : '✅ Finished') 
                : (isArabic ? '⏳ قادمة' : '⏳ Upcoming');

              return (
                <div key={halaqa.id} style={{ background: '#0F172A', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '0.95rem', fontWeight: '700' }}>
                      {isArabic ? halaqa.name_ar : halaqa.name_en}
                    </h4>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', background: statusBg, color: statusColor, fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {statusLabel}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '6px' }}>
                    👤 {isArabic ? `المعلم: ${halaqa.teacher_name_ar}` : `Teacher: ${halaqa.teacher_name_en}`}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '10px' }}>
                    ⏰ {isArabic ? halaqa.time_display_ar : halaqa.time_display_en}
                  </div>

                  {halaqa.attendance_rate !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem', color: '#38BDF8' }}>
                      <span>{isArabic ? 'نسبة حضور الحلقة:' : 'Halaqa Attendance:'}</span>
                      <span style={{ fontWeight: 'bold' }}>{halaqa.attendance_rate}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
