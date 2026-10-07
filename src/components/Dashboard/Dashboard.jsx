// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { getDashboardStats } from '@/lib/dashboardService';
import { UI } from '@/theme/styles';

import { 
  GraduationCap, TrendingUp, BookOpen, Flame, Award, Trophy,
  AlertTriangle, CheckCircle2, Hourglass, RefreshCw, Activity, ShieldCheck, Loader2, UserX,
  Plus, Clock, User, Landmark, ArrowRight, ArrowLeft
} from 'lucide-react';

// 🟢 استيراد أمن مع معالجة فشل التحميل الديناميكي وإعادة التنشيط تلقائياً
const AdminDashboard = lazy(() =>
  import('@/components/SuperAdmin/AdminDashboard').catch((error) => {
    console.error('Failed to load dynamic module:', error);
    // التحقق مما إذا كنا قمنا بتنشيط الصفحة مسبقاً لمنع Infinite Loop
    const hasReloaded = sessionStorage.getItem('retry-lazy-refreshed');
    if (!hasReloaded) {
      sessionStorage.setItem('retry-lazy-refreshed', 'true');
      window.location.reload();
    }
    throw error;
  })
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
                         preloadedDashboardData?.name || 
                         session?.user?.user_metadata?.academy_name || "";
                         
  const rawUserName = session?.user?.user_metadata?.full_name || 
                      session?.user?.user_metadata?.name || '';
  
  const academyName = useMemo(() => safeText(rawAcademyName), [rawAcademyName, safeText]);

  const displayName = useMemo(() => {
    const parsedUserName = safeText(rawUserName);
    if (!parsedUserName || parsedUserName === 'Global Platform Admin' || parsedUserName.toLowerCase().includes('admin')) {
      return t('dashboard.platformAdmin', 'المشرف العام');
    }
    return parsedUserName;
  }, [rawUserName, safeText, t]);

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
    <div className={`w-full px-2 py-3 sm:p-5 pb-20 space-y-3 font-cairo bg-transparent text-semantic-textPrimary min-h-screen ${isRtl ? 'rtl text-start' : 'ltr text-start'}`}>
      
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

      {/* 🟢 1. كارت الترحيب: مبسط وخالٍ من التكرارات */}
      <header className={`${UI.card} flex flex-col justify-center p-4 w-full`}>
        <div className="flex flex-col gap-1">
          <h1 className={`${UI.title} text-base sm:text-lg md:text-xl flex items-center gap-1.5 m-0 font-bold text-semantic-textPrimary`}>
            <span>{t('dashboard.welcome', 'أهلاً بك،')}</span>
            <span className="text-semantic-actionPrimary font-black whitespace-nowrap">
              {displayName}
            </span>
          </h1>
          
          <p className={`${UI.subtitle} text-[11px] sm:text-xs m-0 leading-relaxed text-semantic-textMuted`}>
            {userRole === 'teacher' 
              ? t('dashboard.subtitleTeacher', 'جاهز لبدء حلقات اليوم ورصد مستوى الطلاب؟')
              : t('dashboard.subtitleAdmin', 'متابعة أداء الأكاديمية والأنشطة المباشرة اليوم.')}
          </p>
        </div>
      </header>

      {/* 🟢 2. زر الإجراء الرئيسي الموحد */}
      <section className="w-full">
        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('halaqas')} 
          aria-label={t('dashboard.actions.startHalaqa', 'إطلاق حلقة تعليمية')}
          className={`${UI.btnPrimary} min-h-[44px] py-2.5 text-xs md:text-sm w-full flex items-center justify-center gap-2 shadow-sm`}
        >
          <Plus size={18} className="shrink-0" />
          <span className="font-extrabold whitespace-nowrap">{t('dashboard.actions.startHalaqa', 'إطلاق حلقة تعليمية')}</span>
        </button>
      </section>

      {/* 🟢 3. قسم الإحصائيات السريعة بتنسيق شبكي متناسق */}
      <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {/* قوة الأكاديمية */}
        <div className={`${UI.card} p-3.5 flex flex-col justify-between min-h-[100px]`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-semantic-textSecondary">
              {t('dashboard.stats.academyStrength', 'قوة الأكاديمية')}
            </span>
            <div className="p-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-actionPrimary">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-semantic-textPrimary">
              {stats.studentsCount || 0}
            </div>
            <span className="text-[10px] text-semantic-success flex items-center gap-1 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success"></span>
              {t('dashboard.stats.activeStudents', 'طلاب نشطون')}
            </span>
          </div>
        </div>

        {/* معدل الثبات */}
        <div className={`${UI.card} p-3.5 flex flex-col justify-between min-h-[100px]`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-semantic-textSecondary">
              {t('dashboard.stats.stabilityRate', 'معدل الثبات')}
            </span>
            <div className="p-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-warning">
              <Flame size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-semantic-textPrimary">
              {stats.avgStreak || 0} <span className="text-xs font-normal text-semantic-textMuted">{t('common.days', 'يوم')}</span>
            </div>
            <span className="text-[10px] text-semantic-warning flex items-center gap-1 font-semibold mt-0.5">
              🔥 {t('dashboard.stats.continuousStreak', 'التتابع المستمر')}
            </span>
          </div>
        </div>

        {/* نسبة الحضور */}
        <div className={`${UI.card} p-3.5 flex flex-col justify-between min-h-[100px]`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-semantic-textSecondary">
              {t('dashboard.stats.attendanceRate', 'نسبة الحضور')}
            </span>
            <div className="p-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-info">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-semantic-textPrimary">
              {stats.attendanceRate || '0%'}
            </div>
            <span className="text-[10px] text-semantic-info flex items-center gap-1 font-semibold mt-0.5">
              📈 {t('dashboard.stats.participationRate', 'معدل المشاركة')}
            </span>
          </div>
        </div>

        {/* التسميع اليومي */}
        <div className={`${UI.card} p-3.5 flex flex-col justify-between min-h-[100px]`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-semantic-textSecondary">
              {t('dashboard.stats.dailyRecitation', 'التسميع اليومي')}
            </span>
            <div className="p-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-actionPrimary">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-semantic-textPrimary">
              {stats.totalSessions || 0} <span className="text-xs font-normal text-semantic-textMuted">{t('common.sessions', 'جلسة')}</span>
            </div>
            <span className="text-[10px] text-semantic-success flex items-center gap-1 font-semibold mt-0.5">
              ✅ {t('dashboard.stats.completedToday', 'المكتملة اليوم')}
            </span>
          </div>
        </div>

        {/* التنبيهات المالية */}
        {userRole !== 'teacher' && (
          <div className={`${UI.card} p-3.5 flex items-center justify-between col-span-2 lg:col-span-4 min-h-[70px]`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20">
                <AlertTriangle size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-semantic-textSecondary block">
                  {t('dashboard.stats.financialAlerts', 'التنبيهات المالية')}
                </span>
                <span className="text-[11px] text-semantic-textMuted">
                  {stats.overdueCount > 0 
                    ? `${stats.overdueCount} ${t('dashboard.stats.overduePayments', 'اشتراكات متاخرة تنظر السداد')}`
                    : t('dashboard.stats.allPaid', 'التزام مالي مكتمل ولا توجد متأخرات')}
                </span>
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-semantic-textPrimary dir-ltr">
              {stats.overdueCount || 0}
            </div>
          </div>
        )}
      </section>
      
      {/* 🏆 4. قسم أبطال اليوم */}
      <section className={`${UI.card} p-4 w-full`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-semantic-warning/10 text-semantic-warning">
              <Trophy size={18} />
            </div>
            <h3 className={`${UI.title} text-sm sm:text-base font-bold m-0`}>
              {t('dashboard.topPerformers.title', 'أبطال اليوم')}
            </h3>
          </div>

          {stats.topPerformers && stats.topPerformers.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('students')}
              className="text-xs text-semantic-actionPrimary font-bold hover:underline cursor-pointer bg-transparent border-0 p-0"
            >
              {t('common.viewAll', 'عرض الكل')}
            </button>
          )}
        </div>

        {stats.topPerformers && stats.topPerformers.length > 0 ? (
          <div className="flex flex-col gap-2">
            {stats.topPerformers.map((student, index) => (
              <div 
                key={student.id || index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    index === 0 
                      ? 'bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/40' 
                      : index === 1 
                      ? 'bg-slate-300/20 text-slate-300 border border-slate-400/40'
                      : 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                  }`}>
                    {index + 1}
                  </span>
                  
                  <span className="text-xs sm:text-sm font-bold text-semantic-textPrimary">
                    {student.name || t('common.unnamedStudent', 'طالب بدون اسم')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-semantic-actionPrimary dir-ltr">
                    {student.sessionsCount || 0}
                  </span>
                  <span className="text-[10px] text-semantic-textMuted font-semibold">
                    {t('common.sessions', 'جلسة')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-semantic-textMuted flex flex-col items-center justify-center gap-2">
            <Award size={28} className="opacity-40 stroke-1" />
            <p className="text-xs m-0 font-medium">
              {t('dashboard.topPerformers.empty', 'لم يتم تسجيل جلسات تسميع حتى الآن اليوم.')}
            </p>
          </div>
        )}
      </section>

      {/* ⚠️ 5. قسم طلاب يتطلبون متابعة */}
      <section className={`${UI.card} p-4 w-full`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-semantic-danger/10 text-semantic-danger">
              <UserX size={18} />
            </div>
            <h3 className={`${UI.title} text-sm sm:text-base font-bold m-0`}>
              {t('dashboard.atRiskStudents.title', 'طلاب يتطلبون متابعة')}
            </h3>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            (stats.atRiskStudents?.length || 0) > 0
              ? 'bg-semantic-danger/10 text-semantic-danger border-semantic-danger/30'
              : 'bg-semantic-surfaceInput text-semantic-textMuted border-semantic-borderInput'
          }`}>
            {stats.atRiskStudents?.length || 0} {t('dashboard.atRiskStudents.needsFollowUp', 'يحتاج متابعة')}
          </span>
        </div>

        {stats.atRiskStudents && stats.atRiskStudents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {stats.atRiskStudents.map((student, index) => (
              <div 
                key={student.id || index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs sm:text-sm font-bold text-semantic-textPrimary">
                    {student.name}
                  </span>
                  <span className="text-[10px] text-semantic-danger font-medium">
                    {student.reason || t('dashboard.atRiskStudents.absentWarning', 'غائب منذ عدة أيام')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('students')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-semantic-actionPrimary/10 text-semantic-actionPrimary hover:bg-semantic-actionPrimary/20 transition-all border-0 cursor-pointer"
                >
                  {t('common.followUp', 'متابعة')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center flex items-center justify-center gap-2 text-semantic-success bg-semantic-success/5 rounded-xl border border-semantic-success/15">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold">
              {t('dashboard.atRiskStudents.allGood', 'جميع الطلاب مستمرون بنجاح هذا اليوم!')}
            </span>
          </div>
        )}
      </section>

      {/* 🟢 6. الحلقات النشطة أو جدول الحلقات */}
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
