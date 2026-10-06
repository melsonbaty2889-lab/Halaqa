// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { getDashboardStats } from '@/lib/dashboardService';
import { UI } from '@/theme/styles';

import { 
  GraduationCap, TrendingUp, BookOpen, Flame, Award, Trophy, BookmarkCheck, Zap, Radio,
  AlertTriangle, CheckCircle2, Hourglass, RefreshCw, Activity, Sparkles, ShieldCheck, Loader2, UserX,
  Plus, ClipboardCheck, Clock, User, Landmark, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft 
} from 'lucide-react';

const AdminDashboard = lazy(() => import('@/components/SuperAdmin/AdminDashboard'));

// 🟢 بطاقات الإحصائيات (تستغل كامل المساحة وتمنع اقتطاع النص)
const StatCard = ({ title, value, unit, subtitle, icon: Icon, iconColorClass, onClick, borderHoverClass, children }) => (
  <div 
    onClick={onClick}
    tabIndex={onClick ? 0 : undefined}
    role={onClick ? "button" : undefined}
    aria-label={title}
    className={`${UI.card} p-2.5 sm:p-4 ${onClick ? `cursor-pointer ${borderHoverClass || 'hover:border-semantic-actionPrimary/40'}` : ''} flex flex-col justify-between w-full relative transition-all`}
  >
    <div className="flex justify-between items-start text-xs font-bold mb-1 text-semantic-textSecondary gap-1">
      <span className="leading-tight block whitespace-normal break-words">{title}</span>
      <div className="p-1 rounded bg-semantic-surfaceInput border border-semantic-borderInput shrink-0 flex items-center justify-center">
        <Icon className={iconColorClass} size={15} />
      </div>
    </div>
    <div className={`text-base sm:text-2xl font-black ${iconColorClass} my-0.5`}>
      {value} {unit && <span className="text-[10px] sm:text-xs font-normal text-semantic-textSecondary">{unit}</span>}
    </div>
    <div className={`text-[10px] sm:text-xs font-semibold flex items-center gap-1 ${iconColorClass} flex-wrap`}>
      <span className="whitespace-normal leading-tight">{subtitle}</span>
    </div>
    {children}
  </div>
);

// 🟢 مكون شارة حالة الحلقة
const HalaqaStatusBadge = ({ isLive, isFinished, t }) => {
  const statusClass = isLive 
    ? 'bg-semantic-dangerBg border-semantic-danger/30 text-semantic-danger' 
    : isFinished 
    ? 'bg-semantic-successBg border-semantic-successBorder text-semantic-success' 
    : 'bg-semantic-actionPrimary/10 border-semantic-actionPrimary/30 text-semantic-actionPrimary';

  const statusLabel = isLive 
    ? t('dashboard.status.live', 'مباشر') 
    : isFinished 
    ? t('dashboard.status.finished', 'مكتملة') 
    : t('dashboard.status.scheduled', 'مجدولة');
    
  const StatusIcon = isLive ? RefreshCw : isFinished ? CheckCircle2 : Hourglass;

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0 ${statusClass}`}>
      <StatusIcon size={10} className={isLive ? 'animate-spin' : ''} />
      <span>{statusLabel}</span>
    </span>
  );
};

export default function Dashboard({ 
  session, 
  userRole,
  setActiveTab, 
  preloadedDashboardData
}) {
  const { i18n, t } = useTranslation();
  
  const isArabic = !i18n.language || i18n.language.startsWith('ar');
  const isRtl = i18n.dir() === 'rtl' || isArabic;
  const currentLang = i18n.language || 'ar';
  
  const [loading, setLoading] = useState(true);
  const [selectedAdminAcademy, setSelectedAdminAcademy] = useState(null);
  const [showProgressTooltip, setShowProgressTooltip] = useState(false);
  const [stats, setStats] = useState({
    studentsCount: 0,
    academiesCount: 0,
    attendanceRate: '0%',
    totalSessions: 0,
    overdueCount: 0,
    activeHalaqasData: [],
    avgStreak: 0,
    atRiskStudents: [],
    topPerformers: []
  });
  
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const safeText = useCallback((val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      const langKey = currentLang.split('-')[0];
      const extracted = val[langKey] || val.ar || val.en;
      if (extracted && (typeof extracted === 'string' || typeof extracted === 'number')) {
        return String(extracted);
      }
      const firstVal = Object.values(val)[0];
      if (firstVal && (typeof firstVal === 'string' || typeof firstVal === 'number')) {
        return String(firstVal);
      }
      return fallback;
    }
    return fallback;
  }, [currentLang]);

  const isSuperAdmin = userRole === 'super_admin';

  useEffect(() => {
    const handleAcademySelect = (event) => {
      if (event?.detail) {
        setSelectedAdminAcademy(event.detail);
      }
    };

    window.addEventListener('select-admin-academy', handleAcademySelect);
    return () => {
      window.removeEventListener('select-admin-academy', handleAcademySelect);
    };
  }, []);

  const academyId = selectedAdminAcademy?.id || 
                    preloadedDashboardData?.academy_id || 
                    preloadedDashboardData?.id || 
                    session?.user?.user_metadata?.academy_id;

  const rawAcademyName = selectedAdminAcademy?.name || 
                         preloadedDashboardData?.academyName || 
                         preloadedDashboardData?.name || "";
                         
  const rawUserName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';
  
  const displayName = useMemo(() => {
    const parsedAcademyName = safeText(rawAcademyName);
    if (parsedAcademyName) return parsedAcademyName;
    const parsedUserName = safeText(rawUserName);
    if (!parsedUserName || parsedUserName === 'Global Platform Admin' || parsedUserName.toLowerCase().includes('admin')) {
      return t('dashboard.platformAdmin', 'إدارة المنصة');
    }
    return parsedUserName;
  }, [rawAcademyName, rawUserName, safeText, t]);

  const fetchDashboardData = useCallback(async (showOverlay = true) => {
    if (showOverlay) setLoading(true);
    try {
      const profile = { 
        role: selectedAdminAcademy ? 'academy_admin' : userRole, 
        academy_id: academyId 
      };
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
  }, [userRole, academyId, currentLang, selectedAdminAcademy]);

  useEffect(() => {
    fetchDashboardData(true);
    if (!academyId || !supabase) return;

    const filterCondition = `academy_id=eq.${academyId}`;
    let debounceTimer = null;

    const handleRealtimeChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchDashboardData(false);
      }, 300);
    };

    let channel = null;

    try {
      if (typeof supabase.channel === 'function') {
        const channelName = `dashboard-realtime-${academyId}-${Date.now()}`;
        
        channel = supabase
          .channel(channelName)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: filterCondition }, handleRealtimeChange)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_progress', filter: filterCondition }, handleRealtimeChange)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: filterCondition }, handleRealtimeChange)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'halaqas', filter: filterCondition }, handleRealtimeChange)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'student_streaks', filter: filterCondition }, handleRealtimeChange)
          .subscribe();
      }
    } catch (err) {
      console.error("Error in dashboard realtime setup:", err);
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channel && supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchDashboardData, academyId]);

  if (loading) {
    return (
      <div className="p-4 space-y-4 flex flex-col items-center justify-center min-h-[80vh] w-full bg-transparent text-semantic-textSecondary">
        <Loader2 className="animate-spin text-semantic-actionPrimary mb-2" size={36} />
        <p className="text-sm font-semibold">{t('common.loadingData', 'جاري تحميل البيانات...')}</p>
      </div>
    );
  }

  if (isSuperAdmin && !selectedAdminAcademy) {
    return (
      <Suspense fallback={
        <div className="p-6 text-center font-bold flex items-center justify-center gap-2 text-semantic-textSecondary bg-transparent min-h-[80vh]">
          <Loader2 className="animate-spin text-semantic-actionPrimary" size={20} />
          <span>{t('dashboard.loadingSuperAdmin', 'جاري تحميل لوحة التحكم العامة...')}</span>
        </div>
      }>
        <AdminDashboard 
          isRtl={isRtl} 
          academyName={String(displayName || '')} 
          onLogout={() => supabase?.auth?.signOut?.()} 
          onSelectAcademy={(academy) => {
            setSelectedAdminAcademy(academy);
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className={`w-full px-2 py-3 sm:p-5 pb-20 space-y-2.5 font-cairo bg-transparent text-semantic-textPrimary min-h-screen ${isRtl ? 'rtl text-start' : 'ltr text-start'}`}>
      
      {/* 🔴 تنبيه مسؤول النظام */}
      {isSuperAdmin && selectedAdminAcademy && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl border bg-semantic-actionPrimary/10 border-semantic-actionPrimary/30 text-semantic-actionPrimary">
          <span className="text-xs font-bold flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{t('dashboard.currentAcademy', 'الأكاديمية الحالية')}: {displayName}</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedAdminAcademy(null)}
            aria-label={t('common.back', 'الرجوع')}
            className={`${UI.btnSecondary} min-h-[30px] text-xs py-1 px-2.5 w-auto`}
          >
            {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            <span>{t('common.back', 'الرجوع')}</span>
          </button>
        </div>
      )}

      {/* 🟢 الترحيب وتحديث الشاشة */}
      <header className={`${UI.card} flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 w-full`}>
        <div>
          <h1 className={`${UI.title} text-sm sm:text-base md:text-xl flex items-center gap-2 m-0 flex-wrap`}>
            <span>{t('dashboard.welcome', 'أهلاً بك،')}</span>
            <span className="text-semantic-actionPrimary">{displayName}</span>
            <Sparkles size={16} className="animate-pulse text-semantic-actionPrimary shrink-0" />
          </h1>
          <p className={`${UI.subtitle} text-[11px] sm:text-xs mt-0.5 m-0 leading-relaxed text-semantic-textMuted`}>
            {t('dashboard.subtitle', 'منصة إدارة الحلقات الحية والرصد الأكاديمي الموحد')}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold self-start sm:self-center bg-semantic-successBg border border-semantic-successBorder text-semantic-success shrink-0">
          <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse"></span>
          <span className="whitespace-nowrap">{t('dashboard.liveSync', 'متزامن لحظياً')}</span>
          {lastSyncTime && <span className="text-[10px] text-semantic-textMuted dir-ltr">({lastSyncTime})</span>}
        </div>
      </header>

      {/* 🟢 شريط البث الحي */}
      <div className="p-2.5 rounded-xl bg-semantic-surfaceInput/80 backdrop-blur-sm border border-semantic-borderInput flex items-center justify-between text-xs font-semibold text-semantic-textSecondary gap-2 w-full">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="p-1 rounded-md bg-semantic-actionPrimary/10 text-semantic-actionPrimary shrink-0">
            <Radio size={14} className="animate-pulse" />
          </span>
          <span className="text-semantic-textPrimary text-[11px] sm:text-xs leading-tight truncate">
            {t('dashboard.liveFeed', 'البث الحي: متابعة الحلقات والتسميع عبر الأكاديمية...')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('halaqas')}
          className="text-[11px] text-semantic-actionPrimary font-bold underline shrink-0 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0 whitespace-nowrap"
        >
          {t('dashboard.directMonitor', 'الرصد المباشر')}
        </button>
      </div>

      {/* 🟢 شريط الأزرار الرئيسية */}
      <section className="space-y-2 w-full">
        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('halaqas')} 
          aria-label={t('dashboard.actions.startHalaqa', 'إطلاق حلقة تعليمية')}
          className={`${UI.btnPrimary} min-h-[42px] py-2 text-xs md:text-sm w-full flex items-center justify-center gap-2`}
        >
          <Plus size={18} className="shrink-0" />
          <span className="font-extrabold whitespace-nowrap">{t('dashboard.actions.startHalaqa', 'إطلاق حلقة تعليمية')}</span>
        </button>

        <div className="grid grid-cols-2 gap-2 w-full">
          <button 
            type="button"
            onClick={() => setActiveTab && setActiveTab('attendance')} 
            aria-label={t('dashboard.actions.takeAttendance', 'تسجيل الحضور')}
            className={`${UI.btnSecondary} min-h-[38px] py-1.5 text-xs px-2 flex items-center justify-center gap-1.5 w-full`}
          >
            <ClipboardCheck size={15} className="text-semantic-success shrink-0" />
            <span className="font-bold text-[11px] sm:text-xs whitespace-nowrap">{t('dashboard.actions.takeAttendance', 'تسجيل الحضور')}</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab && setActiveTab('students')} 
            aria-label={t('dashboard.actions.recordRecitation', 'تسجيل التسميع')}
            className={`${UI.btnEmerald} min-h-[38px] py-1.5 text-xs px-2 flex items-center justify-center gap-1.5 w-full`}
          >
            <BookmarkCheck size={15} className="shrink-0" />
            <span className="font-bold text-[11px] sm:text-xs whitespace-nowrap">{t('dashboard.actions.recordRecitation', 'تسجيل التسميع')}</span>
          </button>
        </div>
      </section>

      {/* 🟢 بطاقات الإحصائيات */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
        <StatCard
          title={t('dashboard.stats.academyStrength', 'قوة الأكاديمية')}
          value={safeText(stats?.studentsCount, '0')}
          subtitle={t('dashboard.stats.activeStudents', '● طلاب نشطون')}
          icon={GraduationCap}
          iconColorClass="text-semantic-success"
          onClick={() => setActiveTab && setActiveTab('students')}
        />

        <StatCard
          title={t('dashboard.stats.streakRate', 'معدل الثبات')}
          value={safeText(stats?.avgStreak, '0')}
          unit={t('common.dayUnit', 'يوم')}
          subtitle={t('dashboard.stats.continuousStreak', '🔥 التتابع المستمر')}
          icon={Flame}
          iconColorClass="text-semantic-actionPrimary"
          onClick={() => setActiveTab && setActiveTab('gamification')}
        />

        <StatCard
          title={t('dashboard.stats.attendanceRate', 'نسبة الحضور')}
          value={safeText(stats?.attendanceRate, '0%')}
          subtitle={t('dashboard.stats.participationRate', '📈 معدل المشاركة')}
          icon={TrendingUp}
          iconColorClass="text-semantic-success"
          onClick={() => setActiveTab && setActiveTab('attendance')}
        />

        <StatCard
          title={t('dashboard.stats.dailyRecitation', 'التسميع اليومي')}
          value={safeText(stats?.totalSessions, '0')}
          unit={t('common.sessionUnit', 'جلسة')}
          subtitle={t('dashboard.stats.completedToday', '✅ المكتملة اليوم')}
          icon={BookOpen}
          iconColorClass="text-semantic-actionPrimary"
          onClick={() => setShowProgressTooltip(!showProgressTooltip)}
        >
          {showProgressTooltip && (
            <div className="absolute top-full right-0 left-0 mt-1.5 p-2 rounded-xl bg-semantic-surfaceSecondary border border-semantic-borderHover shadow-2xl z-20 text-[10px] space-y-1">
              <div className="flex justify-between font-bold text-semantic-textPrimary">
                <span>{t('dashboard.tooltip.newMemorization', 'حفظ جديد:')}</span>
                <span className="text-semantic-success">{t('common.enabled', 'مفعل')}</span>
              </div>
              <div className="flex justify-between font-bold text-semantic-textPrimary">
                <span>{t('dashboard.tooltip.revision', 'مراجعة وتثبيت:')}</span>
                <span className="text-semantic-actionPrimary">{t('common.enabled', 'مفعل')}</span>
              </div>
            </div>
          )}
        </StatCard>

        <StatCard
          title={t('dashboard.stats.financialAlerts', 'التنبيهات المالية')}
          value={safeText(stats?.overdueCount, '0')}
          subtitle={
            (stats?.overdueCount || 0) > 0 
              ? t('dashboard.stats.requestsNotes', '⚠ طلبات وملاحظات متأخرة')
              : t('dashboard.stats.allPaid', 'إلتزام مالي مكتمل')
          }
          icon={AlertTriangle}
          iconColorClass={(stats?.overdueCount || 0) > 0 ? 'text-semantic-danger' : 'text-semantic-success'}
          borderHoverClass={(stats?.overdueCount || 0) > 0 ? 'hover:border-semantic-danger/40' : 'hover:border-semantic-success/40'}
          onClick={() => setActiveTab && setActiveTab('payments')}
        />
      </section>

      {/* 🚀 قسم الأبطال والطلاب */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 w-full">
        {/* أبطال اليوم */}
        <div className={`${UI.card} p-3 w-full flex flex-col justify-between`}>
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-xs md:text-sm font-extrabold flex items-center gap-1.5 m-0 text-semantic-textPrimary">
                <Trophy className="text-semantic-actionPrimary shrink-0" size={16} />
                <span>{t('dashboard.sections.heroesToday', 'أبطال اليوم')}</span>
              </h2>
              <button 
                type="button"
                onClick={() => setActiveTab && setActiveTab('students')}
                className="text-xs font-bold text-semantic-actionPrimary hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                {t('common.viewAll', 'عرض الكل')}
              </button>
            </div>

            {stats?.topPerformers && stats.topPerformers.length > 0 ? (
              <div className="space-y-1.5">
                {stats.topPerformers.map((student, idx) => (
                  <div key={student.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-semantic-surfaceInput/70 border border-semantic-borderInput gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-semantic-actionPrimary/10 border border-semantic-actionPrimary/30 text-semantic-actionPrimary font-black text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-semantic-textPrimary break-words">
                        {safeText(student.name, t('common.student', 'طالب'))}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-semantic-success bg-semantic-successBg px-2 py-0.5 rounded border border-semantic-successBorder/50 shrink-0 flex items-center gap-1">
                      <Zap size={11} />
                      <span>{student.sessionsCount} {t('common.recitationCount', 'تسميع')}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 px-2 space-y-2">
                <p className="text-semantic-textMuted text-xs font-semibold m-0">
                  {t('dashboard.emptyPerformers', 'لم يتم تسجيل جلسات تسميع حتى الآن اليوم.')}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('students')}
                  className={`${UI.btnEmerald} py-1.5 px-3 text-xs mx-auto flex items-center gap-1.5 cursor-pointer`}
                >
                  <BookmarkCheck size={14} />
                  <span>{t('dashboard.actions.recordFirstRecitation', 'تسجيل أول تسميع اليوم')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* طلاب يحتاجون متابعة */}
        <div className={`${UI.card} p-3 w-full flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h2 className="text-xs md:text-sm font-extrabold flex items-center gap-1.5 m-0 text-semantic-textPrimary">
                <UserX className="text-semantic-danger shrink-0" size={16} />
                <span>{t('dashboard.sections.atRiskStudents', 'طلاب يتطلبون متابعة')}</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-semantic-dangerBg border border-semantic-danger/30 text-semantic-danger font-bold shrink-0">
                {stats?.atRiskStudents?.length || 0} {t('dashboard.needsFollowup', 'يحتاج متابعة')}
              </span>
            </div>

            {stats?.atRiskStudents && stats.atRiskStudents.length > 0 ? (
              <div className="space-y-1.5">
                {stats.atRiskStudents.map((student, idx) => (
                  <div key={student.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-semantic-surfaceInput/70 border border-semantic-borderInput gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-semantic-danger shrink-0 animate-ping"></span>
                      <span className="text-xs font-bold text-semantic-textPrimary break-words">
                        {safeText(student.name, t('common.student', 'طالب'))}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab && setActiveTab('students')}
                      aria-label={t('common.contact', 'تواصل')}
                      className="text-xs font-bold text-semantic-danger bg-semantic-dangerBg/50 border border-semantic-danger/30 hover:bg-semantic-danger/20 px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>{t('common.contact', 'تواصل')}</span>
                      {isRtl ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-semantic-success text-xs font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>{t('dashboard.allStudentsOnTrack', 'جميع الطلاب مستمرون بنجاح هذا اليوم!')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🟢 الحلقات النشطة */}
      {stats?.activeHalaqasData && stats.activeHalaqasData.length > 0 ? (
        <section className={`${UI.card} p-3 w-full`}>
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-xs md:text-sm font-black flex items-center gap-1.5 m-0 text-semantic-textPrimary">
              <Landmark className="text-semantic-actionPrimary shrink-0" size={16} />
              <span>{t('dashboard.sections.activeHalaqas', 'الحلقات النشطة')}</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full border border-semantic-borderInput bg-semantic-surfaceInput text-semantic-textSecondary font-bold shrink-0">
              {stats.activeHalaqasData.length} {t('common.halaqaUnit', 'حلقة')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
            {stats.activeHalaqasData.map((halaqa, idx) => {
              const isLive = halaqa.status === 'live';
              const isFinished = halaqa.status === 'finished';
              const halaqaName = safeText(halaqa.name, t('common.defaultHalaqaName', 'حلقة قرآنية'));
              const teacherName = safeText(halaqa.teacher_name, t('common.unspecified', 'غير محدد'));
              const timeDisplay = safeText(isRtl ? halaqa.time_display_ar : halaqa.time_display_en, '');
              const teachingType = safeText(halaqa.teaching_type, t('common.inPerson', 'حضوري'));

              return (
                <div 
                  key={halaqa.id || idx} 
                  className="p-3 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput/70 flex flex-col justify-between space-y-2 w-full"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="m-0 text-xs md:text-sm font-bold leading-snug text-semantic-textPrimary break-words">
                        {halaqaName}
                      </h3>
                      <HalaqaStatusBadge isLive={isLive} isFinished={isFinished} t={t} />
                    </div>

                    <div className="text-xs mb-1 flex items-center gap-1.5 text-semantic-textSecondary">
                      <User size={13} className="text-semantic-textMuted shrink-0" />
                      <span className="break-words">{t('common.teacher', 'المعلم')}: {teacherName}</span>
                    </div>

                    {timeDisplay && (
                      <div className="text-[11px] mb-1 flex items-center gap-1.5 text-semantic-textMuted">
                        <Clock size={13} className="shrink-0" />
                        <span className="break-words">{timeDisplay}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-semantic-borderInput flex justify-between items-center">
                    <span className="text-[10px] px-2 py-0.5 rounded border border-semantic-actionPrimary/30 bg-semantic-actionPrimary/10 text-semantic-actionPrimary font-bold inline-flex items-center gap-1 shrink-0">
                      <Award size={11} />
                      <span>{teachingType}</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => setActiveTab && setActiveTab('halaqas')} 
                      aria-label={t('common.details', 'التفاصيل')}
                      className="text-xs font-bold text-semantic-actionPrimary bg-transparent border-0 cursor-pointer p-0 hover:underline flex items-center gap-1"
                    >
                      <span>{t('common.details', 'التفاصيل')}</span>
                      {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className={`${UI.card} text-center py-6 p-4 w-full space-y-3`}>
          <Activity size={26} className="mx-auto text-semantic-textMuted" />
          <p className="text-xs font-bold m-0 text-semantic-textSecondary leading-relaxed">
            {t('dashboard.emptyHalaqas', 'جميع الحلقات الحية حالياً مكتملة. يمكنك بدء حلقة جديدة أو مراجعة جدول اليوم.')}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('halaqas')}
            className={`${UI.btnSecondary} py-1.5 px-3 text-xs mx-auto flex items-center gap-1.5 cursor-pointer w-auto`}
          >
            <Clock size={14} />
            <span>{t('dashboard.actions.viewHalaqasSchedule', 'عرض جدول الحلقات')}</span>
          </button>
        </section>
      )}

    </div>
  );
}
