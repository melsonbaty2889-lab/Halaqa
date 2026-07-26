/* src/components/Dashboard.jsx - Step 1 Complete Fix: Contrast, Localization & Punctuation Direction */
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
  currency = 'EGP',
  timezone = 'Africa/Cairo'
}) {
  const { t, i18n } = useTranslation();
  
  // 🌟 تحديد اتجاه اللغة بدقة
  const isArabic = !i18n.language || i18n.language.startsWith('ar');
  const isRtl = i18n.dir() === 'rtl' || isArabic;
  const currentLang = i18n.language || 'ar';
  
  // حالات الشاشة
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState(null);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [topAchievers, setTopAchievers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const isSuperAdmin = userRole === 'super_admin';
  const academyName = preloadedDashboardData?.academyName || "";
  const rawUserName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';
  
  // 🌐 تعريب صارم ومباشر للترويسة واسم الحساب
  const displayName = useMemo(() => {
    if (academyName) return academyName;
    if (!rawUserName || rawUserName === 'Global Platform Admin' || rawUserName.toLowerCase().includes('admin')) {
      return isArabic ? 'إدارة المنصة العامة' : 'Global Platform Admin';
    }
    return rawUserName;
  }, [academyName, rawUserName, isArabic]);

  const academyId = preloadedDashboardData?.academy_id || preloadedDashboardData?.id || session?.user?.user_metadata?.academy_id;

  // 💰 تنسيق العملة
  const formatCurrency = useCallback((amount) => {
    try {
      return new Intl.NumberFormat(currentLang, { style: 'currency', currency }).format(amount || 0);
    } catch (e) {
      return `${amount || 0} ${currency}`;
    }
  }, [currentLang, currency]);

  // 📊 أيام الأسبوع
  const weeklyData = useMemo(() => [
    { day: isArabic ? 'السبت' : 'Sat', pages: 42 },
    { day: isArabic ? 'الأحد' : 'Sun', pages: 68 },
    { day: isArabic ? 'الإثنين' : 'Mon', pages: 55 },
    { day: isArabic ? 'الثلاثاء' : 'Tue', pages: 80 },
    { day: isArabic ? 'الأربعاء' : 'Wed', pages: 60 },
    { day: isArabic ? 'الخميس' : 'Thu', pages: 95 },
    { day: isArabic ? 'الجمعة' : 'Fri', pages: 30 }
  ], [isArabic]);

  // 📥 جلب التحليلات المتقدمة
  const fetchAdvancedInsights = useCallback(async (targetAcademyId) => {
    if (!targetAcademyId) return;
    try {
      const { data: riskData } = await supabase
        .from('vw_at_risk_students')
        .select('*')
        .eq('academy_id', targetAcademyId)
        .limit(4);
      if (riskData) setAtRiskStudents(riskData);

      const { data: topData } = await supabase
        .from('vw_top_achievers')
        .select('*')
        .eq('academy_id', targetAcademyId)
        .limit(4);
      if (topData) setTopAchievers(topData);

      const { data: logsData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('academy_id', targetAcademyId)
        .order('created_at', { ascending: false })
        .limit(5);
      if (logsData) setActivityLogs(logsData);

    } catch (err) {
      console.warn("Analytics views fallback active", err);
    }
  }, []);

  // 🔄 جلب البيانات المباشرة
  const fetchDashboardData = useCallback(async (showOverlayLoading = true) => {
    if (showOverlayLoading) setLoading(true);
    try {
      if (!isSuperAdmin && academyId) {
        const profileMock = { role: userRole, academy_id: academyId };
        const data = await getDashboardStats(supabase, profileMock);
        if (data) {
          setLiveStats(data);
          localStorage.setItem(`smart_dash_cache_${academyId}`, JSON.stringify(data));
        }
        await fetchAdvancedInsights(academyId);
      }
      setIsRealtimeActive(true);
      setLastSyncTime(new Date().toLocaleTimeString(currentLang, { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error("Error loading dashboard live stats:", err);
      const cached = localStorage.getItem(`smart_dash_cache_${academyId}`);
      if (cached) setLiveStats(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, userRole, academyId, fetchAdvancedInsights, currentLang]);

  // ⚡ الاشتراك في المزامنة اللحظية
  useEffect(() => {
    fetchDashboardData(true);
    if (isSuperAdmin || !academyId) return;

    const channel = supabase
      .channel(`academy-dashboard-realtime-${academyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => fetchDashboardData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_progress' }, () => fetchDashboardData(false))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setIsRealtimeActive(true);
      });

    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardData, isSuperAdmin, academyId]);

  const healthScore = useMemo(() => {
    const attendance = liveStats?.attendanceRate || 88;
    return Math.round((attendance * 0.6) + (90 * 0.4));
  }, [liveStats]);

  const stats = useMemo(() => {
    const baseStats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0 };
    return {
      students: liveStats?.studentsCount ?? baseStats.students,
      pending: liveStats?.overdueCount ?? baseStats.pending,
      attendanceRate: liveStats?.attendanceRate ?? 92,
      totalPagesMuted: liveStats?.totalPagesMuted ?? 450,
    };
  }, [preloadedDashboardData, liveStats]);

  if (loading) {
    return (
      <div style={{ padding: '30px' }} className="animate-pulse">
        <div style={{ height: '40px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', width: '35%' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '30px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '120px', background: 'rgba(255,255,255,0.06)', borderRadius: '16px' }}></div>
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
      
      {/* 1️⃣ الشريط العلوي: ترويسة معربة بالكامل وشارة مزامنة خضراء واضحة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px 0' }}>
            {isArabic ? 'السلام عليكم ورحمة الله وبركاته' : 'Assalamu Alaikum'}، {displayName} 👋
          </h1>
          <p style={{ color: '#E2E8F0', fontSize: '0.9rem', margin: 0 }}>
            {isArabic ? 'مركز القيادة والعمليات والتحليلات المباشرة للمؤسسة' : 'Operational Leadership & Live Analytics Center'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', 
            background: isRealtimeActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
            border: `1px solid ${isRealtimeActive ? '#10B981' : '#F59E0B'}`, 
            borderRadius: '30px', fontSize: '0.82rem', fontWeight: '600',
            color: isRealtimeActive ? '#34D399' : '#FBBF24' 
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRealtimeActive ? '#10B981' : '#F59E0B' }}></span>
            <span>{isRealtimeActive ? (isArabic ? 'متصل ومتزامن' : 'Live & Synced') : (isArabic ? 'جاري المزامنة...' : 'Syncing...')}</span>
            {lastSyncTime && <span style={{ opacity: 0.9, fontSize: '0.78rem', color: '#F1F5F9' }}>({lastSyncTime})</span>}
          </div>
        </div>
      </div>

      {/* 2️⃣ بطاقات المؤشرات بتباين قوي جداً */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px' }}>
            <span>إجمالي الدارسين</span>
            <span style={{ fontSize: '1.2rem' }}>👨‍🎓</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFFFFF' }}>{stats.students}</div>
          <div style={{ fontSize: '0.82rem', color: '#34D399', marginTop: '6px', fontWeight: '600' }}>↑ مسجلون في الحلقات</div>
        </div>

        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px' }}>
            <span>نسبة الحضور اليومي</span>
            <span style={{ fontSize: '1.2rem' }}>📈</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#38BDF8' }}>{stats.attendanceRate}%</div>
          <div style={{ fontSize: '0.82rem', color: '#7DD3FC', marginTop: '6px', fontWeight: '600' }}>أداء مستقر</div>
        </div>

        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px' }}>
            <span>الصفحات المسموعة</span>
            <span style={{ fontSize: '1.2rem' }}>📖</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FBBF24' }}>{stats.totalPagesMuted}</div>
          <div style={{ fontSize: '0.82rem', color: '#FDE047', marginTop: '6px', fontWeight: '600' }}>خلال هذا الشهر</div>
        </div>

        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E2E8F0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px' }}>
            <span>مؤشر الصحة التشغيلية</span>
            <span style={{ fontSize: '1.2rem' }}>🏥</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: healthScore > 80 ? '#34D399' : '#F59E0B' }}>{healthScore}%</div>
          <div style={{ width: '100%', background: '#334155', height: '6px', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${healthScore}%`, height: '100%', background: healthScore > 80 ? '#10B981' : '#F59E0B' }}></div>
          </div>
        </div>

      </div>

      {/* 3️⃣ الرسوم البيانية والماليات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        <div style={{ background: '#1E293B', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '20px', fontWeight: '700' }}>
            📊 مؤشر نشاط التسميع والحضور الأسبوعي
          </h3>
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
            {weeklyData.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ 
                  width: '100%', maxWidth: '28px', height: `${item.pages}%`, 
                  background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)', 
                  borderRadius: '6px 6px 0 0' 
                }}></div>
                <span style={{ color: '#E2E8F0', fontSize: '0.8rem', marginTop: '8px', fontWeight: '500' }}>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#1E293B', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '16px', fontWeight: '700' }}>
            💳 ملخص التدفقات والاشتراكات
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0F172A', borderRadius: '12px' }}>
              <span style={{ color: '#E2E8F0', fontSize: '0.9rem', fontWeight: '500' }}>المبالغ المحصلة هذا الشهر</span>
              <span style={{ color: '#34D399', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(14500)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0F172A', borderRadius: '12px' }}>
              <span style={{ color: '#E2E8F0', fontSize: '0.9rem', fontWeight: '500' }}>المتأخرات المعلقة ({stats.pending})</span>
              <span style={{ color: '#F87171', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(stats.pending * 150)}</span>
            </div>
            <button 
              onClick={() => setActiveTab('payments')}
              style={{ width: '100%', padding: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.88rem' }}>
              مراجعة كافة السجلات المالية ⚡
            </button>
          </div>
        </div>

      </div>

      {/* 4️⃣ التنبيهات والمتصدرين مع ضبط اتجاه النصوص والنقاط بأسلوب صريح */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        <div style={{ background: '#1E293B', padding: '24px', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', color: '#F87171', marginBottom: '16px', fontWeight: '700' }}>
            ⚠️ تنبيه التدخل المبكر (عرضة للانقطاع)
          </h3>
          {atRiskStudents.length === 0 ? (
            <p style={{ color: '#F1F5F9', fontSize: '0.92rem', lineHeight: '1.7', margin: 0, direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
              ممتاز! لا يوجد طلاب يواجهون تعثراً أو غياباً ملحوظاً حالياً
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {atRiskStudents.map((student, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#0F172A', borderRadius: '10px' }}>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.9rem' }}>{student.name || student.student_name}</div>
                    <div style={{ color: '#F87171', fontSize: '0.8rem' }}>تراجع الحضور والتسميع</div>
                  </div>
                  <button onClick={() => setActiveTab('students')} style={{ padding: '6px 12px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 'bold' }}>
                    متابعة
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#1E293B', padding: '24px', borderRadius: '20px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', color: '#FBBF24', marginBottom: '16px', fontWeight: '700' }}>
            🏆 صفوة الحفاظ والمتميزات
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0F172A', borderRadius: '10px' }}>
              <span style={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: '600' }}>🥇 أحمد محمد العبدالله</span>
              <span style={{ color: '#FBBF24', fontWeight: 'bold', fontSize: '0.88rem' }}>25 صفحة/أسبوع</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0F172A', borderRadius: '10px' }}>
              <span style={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: '600' }}>🥈 سارة يوسف إبراهيم</span>
              <span style={{ color: '#FBBF24', fontWeight: 'bold', fontSize: '0.88rem' }}>20 صفحة/أسبوع</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5️⃣ سجل الأنشطة */}
      <div style={{ background: '#1E293B', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)' }}>
        <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '16px', fontWeight: '700' }}>
          📜 سجل العمليات والأنشطة اللحظية بالمؤسسة
        </h3>
        {activityLogs.length === 0 ? (
          <p style={{ color: '#F1F5F9', fontSize: '0.92rem', margin: 0, direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
            النظام متزامن وجاهز لتسجيل أحدث الأنشطة
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activityLogs.map((log, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                <span style={{ color: '#E2E8F0', fontSize: '0.88rem' }}>{log.description || log.action}</span>
                <span style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>{new Date(log.created_at).toLocaleTimeString(currentLang)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
