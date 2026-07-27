/* src/components/Dashboard.jsx - النسخة المحدثة والمتكاملة 100% */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getDashboardStats } from '../lib/dashboardService';
import AdminDashboard from './AdminDashboard';
import styles from './Dashboard.module.css';
import { 
  FaUserGraduate, 
  FaChartLine, 
  FaBookOpen, 
  FaExclamationTriangle, 
  FaPlus, 
  FaClipboardCheck, 
  FaClock, 
  FaUser, 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaSyncAlt, 
  FaMosque 
} from 'react-icons/fa';

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
    totalSessions: 0,
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
      return isArabic ? 'إدارة المنصة' : 'Platform Admin';
    }
    return rawUserName;
  }, [academyName, rawUserName, isArabic]);

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
    return <AdminDashboard isRtl={isRtl} academyName={displayName} onLogout={() => supabase.auth.signOut()} />;
  }

  return (
    <div className={styles.dashboardContainer} style={{ paddingBottom: '80px', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      
      {/* 1️⃣ الترويسة الأنيقة والمزدوجة للتجاوب */}
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

      {/* 2️⃣ شريط الوصول السريع (Quick Actions) */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px', scrollbarWidth: 'none' }}>
        <button 
          onClick={() => setActiveTab && setActiveTab('halaqas')} 
          style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}>
          <FaPlus size={13} />
          <span>{isArabic ? 'جدولة حلقة' : 'Add Halaqa'}</span>
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('attendance')} 
          style={{ background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaClipboardCheck size={14} style={{ color: '#38BDF8' }} />
          <span>{isArabic ? 'تسجيل حضور' : 'Take Attendance'}</span>
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('students')} 
          style={{ background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaBookOpen size={14} style={{ color: '#FBBF24' }} />
          <span>{isArabic ? 'رصد التسميع' : 'Record Recitation'}</span>
        </button>
      </div>

      {/* 3️⃣ البطاقات الرئيسية التفاعلية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        
        {/* إجمالي الدارسين */}
        <div 
          onClick={() => setActiveTab && setActiveTab('students')}
          style={{ background: '#1E293B', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'إجمالي الدارسين' : 'Total Students'}</span>
            <FaUserGraduate style={{ color: '#38BDF8', fontSize: '1.2rem' }} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#FFFFFF' }}>{stats.studentsCount ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? '↑ مسجلون بالحلقات' : '↑ Enrolled'}
          </div>
        </div>

        {/* نسبة الحضور اليومي */}
        <div 
          onClick={() => setActiveTab && setActiveTab('attendance')}
          style={{ background: '#1E293B', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'نسبة الحضور اليومي' : 'Daily Attendance'}</span>
            <FaChartLine style={{ color: '#38BDF8', fontSize: '1.2rem' }} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#38BDF8' }}>{stats.attendanceRate || '0%'}</div>
          <div style={{ fontSize: '0.75rem', color: '#7DD3FC', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? 'مؤشر أداء اليوم' : 'Today Performance'}
          </div>
        </div>

        {/* جلسات التسميع اليوم */}
        <div 
          onClick={() => setActiveTab && setActiveTab('halaqas')}
          style={{ background: '#1E293B', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'جلسات التسميع اليوم' : 'Recitation Sessions'}</span>
            <FaBookOpen style={{ color: '#FBBF24', fontSize: '1.2rem' }} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#FBBF24' }}>
            {stats.totalSessions ?? 0} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#CBD5E1' }}>{isArabic ? 'جلسة' : 'Sessions'}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#FDE047', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? 'إجمالي المسموع اليوم' : 'Completed Today'}
          </div>
        </div>

        {/* المتأخرات المعلقة */}
        <div 
          onClick={() => setActiveTab && setActiveTab('payments')}
          style={{ background: '#1E293B', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
            <span>{isArabic ? 'المتأخرات المعلقة' : 'Pending Overdues'}</span>
            <FaExclamationTriangle style={{ color: stats.overdueCount > 0 ? '#F87171' : '#34D399', fontSize: '1.2rem' }} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: stats.overdueCount > 0 ? '#F87171' : '#34D399' }}>
            {stats.overdueCount ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: stats.overdueCount > 0 ? '#FCA5A5' : '#A7F3D0', marginTop: '4px', fontWeight: '600' }}>
            {isArabic ? 'اشتراكات تحتاج متابعة' : 'Requires Follow-up'}
          </div>
        </div>

      </div>

      {/* 4️⃣ قسم حلقات اليوم المباشرة وتجربة Empty State التفاعلية */}
      <div style={{ background: '#1E293B', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', color: '#FFFFFF', margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMosque style={{ color: '#38BDF8' }} />
            <span>{isArabic ? 'حلقات اليوم المباشرة' : 'Today Active Halaqas'}</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            {stats.activeHalaqasData?.length || 0} {isArabic ? 'حلقة مسجلة' : 'halaqas'}
          </span>
        </div>

        {(!stats.activeHalaqasData || stats.activeHalaqasData.length === 0) ? (
  /* قائمة المهام اليومية الذكية عند عدم وجود حلقات */
  <div style={{ background: '#0F172A', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span>📌</span>
      <span>{isArabic ? 'مهام المقرأة المقترحة لليوم' : 'Recommended Daily Actions'}</span>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* مهمة 1: تسجيل الحضور */}
      <div 
        onClick={() => setActiveTab && setActiveTab('attendance')}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#1E293B', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#CBD5E1' }}>
          <FaClipboardCheck style={{ color: '#38BDF8' }} />
          <span>{isArabic ? 'متابعة سجل حضور وغياب الطلاب' : 'Review Student Attendance'}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 'bold' }}>{isArabic ? '←' : '→'}</span>
      </div>

      {/* مهمة 2: المتابعة المالية */}
      <div 
        onClick={() => setActiveTab && setActiveTab('payments')}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#1E293B', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#CBD5E1' }}>
          <FaExclamationTriangle style={{ color: stats.overdueCount > 0 ? '#F87171' : '#34D399' }} />
          <span>
            {stats.overdueCount > 0 
              ? (isArabic ? `تحصيل الاشتراكات المتأخرة (${stats.overdueCount})` : `Collect Overdue Fees (${stats.overdueCount})`)
              : (isArabic ? 'مراجعة حالة الاشتراكات المالية' : 'Check Subscription Status')}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 'bold' }}>{isArabic ? '←' : '→'}</span>
      </div>

      {/* مهمة 3: جدولة حلقة جديدة */}
      <div 
        onClick={() => setActiveTab && setActiveTab('halaqas')}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#1E293B', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#CBD5E1' }}>
          <FaPlus style={{ color: '#FBBF24' }} />
          <span>{isArabic ? 'إعداد وجدولة حلقات تحفيظ جديدة' : 'Setup New Teaching Halaqas'}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: 'bold' }}>{isArabic ? '←' : '→'}</span>
      </div>
    </div>
  </div>
) : (
  /* عرض الحلقات القائمة عند وجودها */
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
    {stats.activeHalaqasData.map((halaqa) => {
      const isLive = halaqa.status === 'live';
      const isFinished = halaqa.status === 'finished';
      
      const statusBg = isLive ? 'rgba(239, 68, 68, 0.18)' : isFinished ? 'rgba(16, 185, 129, 0.18)' : 'rgba(56, 189, 248, 0.18)';
      const statusColor = isLive ? '#EF4444' : isFinished ? '#10B981' : '#38BDF8';
      const statusLabel = isLive 
        ? (isArabic ? 'قائمة الآن' : 'Live Now') 
        : isFinished 
        ? (isArabic ? 'انتهت' : 'Finished') 
        : (isArabic ? 'قادمة' : 'Upcoming');

      const StatusIcon = isLive ? FaSyncAlt : isFinished ? FaCheckCircle : FaHourglassHalf;

      return (
        <div key={halaqa.id} style={{ background: '#0F172A', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '0.9rem', fontWeight: '700' }}>
              {isArabic ? halaqa.name_ar : halaqa.name_en}
            </h4>
            <span style={{ padding: '3px 8px', borderRadius: '12px', background: statusBg, color: statusColor, fontSize: '0.72rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <StatusIcon size={10} className={isLive ? styles.spinning : ''} />
              <span>{statusLabel}</span>
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaUser style={{ color: '#94A3B8', fontSize: '0.75rem' }} />
            <span>{isArabic ? `المعلم: ${halaqa.teacher_name_ar}` : `Teacher: ${halaqa.teacher_name_en}`}</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaClock style={{ color: '#94A3B8', fontSize: '0.75rem' }} />
            <span>{isArabic ? halaqa.time_display_ar : halaqa.time_display_en}</span>
          </div>

          {halaqa.attendance_rate !== null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: '#38BDF8' }}>
              <span>{isArabic ? 'نسبة حضور الحلقة:' : 'Attendance:'}</span>
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
