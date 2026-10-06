// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { getDashboardStats } from '@/lib/dashboardService';
import { UI } from '@/theme/styles';

// 🟢 تجميع وتنسيق استيراد الأيقونات لضغط عدد الأسطر
import { 
  GraduationCap, TrendingUp, BookOpen, Flame, Award, Trophy, BookmarkCheck, Zap, Radio 
} from 'lucide-react';
import { 
  AlertTriangle, CheckCircle2, Hourglass, RefreshCw, Activity, Sparkles, ShieldCheck, Loader2, UserX, HelpCircle 
} from 'lucide-react';
import { 
  Plus, ClipboardCheck, Clock, User, Landmark, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft 
} from 'lucide-react';

const AdminDashboard = lazy(() => import('@/components/SuperAdmin/AdminDashboard'));

// 🟢 مكون فرعي خفيف وبسيط لبطاقات الأداء الإحصائية (KPI Card Component)
const StatCard = ({ title, value, unit, subtitle, icon: Icon, iconColorClass, onClick, borderHoverClass, children }) => (
  <div 
    onClick={onClick}
    tabIndex={onClick ? 0 : undefined}
    role={onClick ? "button" : undefined}
    aria-label={title}
    className={`${UI.card} p-3 md:p-4 ${onClick ? `cursor-pointer ${borderHoverClass || 'hover:border-semantic-actionPrimary/40'}` : ''} flex flex-col justify-between min-w-0 relative`}
  >
    <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold mb-1.5 text-semantic-textSecondary gap-1">
      <span className="truncate min-w-0 leading-tight">{title}</span>
      <div className="p-1.5 rounded-lg bg-semantic-surfaceInput border border-semantic-borderInput shrink-0 flex items-center gap-1">
        <Icon className={iconColorClass} size={16} />
      </div>
    </div>
    <div className={`text-xl md:text-3xl font-black ${iconColorClass}`}>
      {value} {unit && <span className="text-xs font-normal text-semantic-textSecondary">{unit}</span>}
    </div>
    <div className={`text-[10px] sm:text-[11px] mt-1 font-semibold flex items-center gap-1 truncate ${iconColorClass}`}>
      <span className="truncate">{subtitle}</span>
    </div>
    {children}
  </div>
);

// 🟢 مكون فرعي لشارات حالة الحلقة (Halaqa Status Badge)
const HalaqaStatusBadge = ({ status, isLive, isFinished, t }) => {
  const statusClass = isLive 
    ? 'bg-semantic-dangerBg border-semantic-danger/30 text-semantic-danger' 
    : isFinished 
    ? 'bg-semantic-successBg border-semantic-successBorder text-semantic-success' 
    : 'bg-semantic-actionPrimary/10 border-semantic-actionPrimary/30 text-semantic-actionPrimary';

  const statusLabel = isLive 
    ? t('dashboard.status_live', 'جارية الآن') 
    : isFinished 
    ? t('dashboard.status_finished', 'مكتملة') 
    : t('dashboard.status_scheduled', 'مجدولة');

  const StatusIcon = isLive ? RefreshCw : isFinished ? CheckCircle2 : Hourglass;

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0 ${statusClass}`}>
      <StatusIcon size={11} className={isLive ? 'animate-spin' : ''} />
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

  // استخراج النص المترجم المناسب للغة الحالية لجميع أنواع الحقول (JSONB أو Strings)
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
      return t('dashboard.admin_title', 'إدارة المنصة');
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
      <div className="p-4 md:p-6 space-y-6 flex flex-col items-center justify-center min-h-[400px] bg-semantic-bgPage text-semantic-textSecondary">
        <Loader2 className="animate-spin text-semantic-actionPrimary mb-2" size={36} />
        <p className="text-sm font-semibold">
          {t('common.loading', 'جاري تحميل مركز العمليات...')}
        </p>
      </div>
    );
  }

  if (isSuperAdmin && !selectedAdminAcademy) {
    return (
      <Suspense fallback={
        <div className="p-8 text-center font-bold flex items-center justify-center gap-2 text-semantic-textSecondary">
          <Loader2 className="animate-spin text-semantic-actionPrimary" size={20} />
          <span>{t('dashboard.loading_admin', 'جاري تحميل لوحة التحكم العامة...')}</span>
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
    <div className={`p-3.5 md:p-6 pb-24 space-y-4 font-cairo bg-semantic-bgPage text-semantic-textPrimary ${isRtl ? 'rtl text-start' : 'ltr text-start'}`}>
      
      {/* 🔴 تنبيه وضع المسؤول العام Super Admin */}
      {isSuperAdmin && selectedAdminAcademy && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border bg-semantic-actionPrimary/10 border-semantic-actionPrimary/30 text-semantic-actionPrimary">
          <span className="text-xs font-bold flex items-center gap-2">
            <ShieldCheck size={18} />
            <span>{t('dashboard.viewing_academy', 'تتصفح الآن أكاديمية:')} {displayName}</span>
          </span>
          <button
            onClick={() => setSelectedAdminAcademy(null)}
            aria-label={t('dashboard.back_to_super_admin', 'الرجوع للوحة التحكم الرئيسية')}
            className={`${UI.btnSecondary} min-h-[36px] text-xs py-1 px-3 w-auto`}
          >
            {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            <span>{t('dashboard.back_to_super_admin', 'الرجوع للوحة التحكم الرئيسية')}</span>
          </button>
        </div>
      )}

      {/* 🟢 الترحيب ومؤشر التزامن الحي */}
      <header className={`${UI.card} flex flex-col md:flex-row md:items-center justify-between gap-3 p-4`}>
        <div>
          <h1 className={`${UI.title} text-lg md:text-2xl flex items-center gap-2 m-0`}>
            <span>{t('dashboard.welcome', 'أهلاً بك،')}</span>
            <span className="text-semantic-actionPrimary">{displayName}</span>
            <Sparkles size={18} className="animate-pulse text-semantic-actionPrimary" />
          </h1>
          <p className={`${UI.subtitle} text-xs md:text-sm mt-1 m-0`}>
            {t('dashboard.subtitle', 'مركز العمليات اللحظي وإدارة الإنجاز القرآني')}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold self-start md:self-center bg-semantic-successBg border border-semantic-successBorder text-semantic-success shadow-[0_0_12px_var(--emerald-radial-glow)] shrink-0">
          <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse"></span>
          <span>{t('dashboard.realtime_synced', 'تزامن حي مباشر')}</span>
          {lastSyncTime && <span className="text-[10px] text-semantic-textMuted">({lastSyncTime})</span>}
        </div>
      </header>

      {/* 🟢 شريط حركة التسميع الحية المباشرة */}
      <div className="p-2.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput flex items-center justify-between text-xs font-semibold text-semantic-textSecondary overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-md bg-semantic-actionPrimary/10 text-semantic-actionPrimary shrink-0">
            <Radio size={14} className="animate-pulse" />
          </span>
          <span className="truncate text-semantic-textPrimary text-[11px] sm:text-xs">
            {t('dashboard.live_stream_status', 'البث الحي: جاري متابعة الحلقات والتسميع اللحظي عبر الأكاديمية...')}
          </span>
        </div>
        <span 
          onClick={() => setActiveTab && setActiveTab('halaqas')}
          className="text-[10px] text-semantic-actionPrimary font-bold underline shrink-0 cursor-pointer hover:opacity-80 transition-opacity ms-2"
        >
          {t('dashboard.live_monitor', 'الرصد المباشر')}
        </span>
      </div>

      {/* 🟢 شريط الإجراءات المباشرة السريع المطور (توفير مساحة طولية على الهاتف) */}
      <section className="space-y-2">
        {/* الزر الرئيسي بعرض كامل */}
        <button 
          onClick={() => setActiveTab && setActiveTab('halaqas')} 
          aria-label={t('dashboard.launch_session', 'إطلاق حلقة تعليمية')}
          className={`${UI.btnPrimary} min-h-[42px] py-2 text-xs w-full`}
        >
          <Plus size={16} />
          <span>{t('dashboard.launch_session', 'إطلاق حلقة تعليمية')}</span>
        </button>

        {/* الأزرار الثانوية مدمجة في سطر واحد 50% / 50% */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setActiveTab && setActiveTab('attendance')} 
            aria-label={t('dashboard.record_attendance', 'تسجيل الحضور')}
            className={`${UI.btnSecondary} min-h-[38px] py-1.5 text-[11px] sm:text-xs`}
          >
            <ClipboardCheck size={15} className="text-semantic-success shrink-0" />
            <span className="truncate">{t('dashboard.record_attendance', 'تسجيل الحضور')}</span>
          </button>

          <button 
            onClick={() => setActiveTab && setActiveTab('students')} 
            aria-label={t('dashboard.evaluations', 'توثيق الإنجاز والتسميع')}
            className={`${UI.btnEmerald} min-h-[38px] py-1.5 text-[11px] sm:text-xs`}
          >
            <BookmarkCheck size={15} className="shrink-0" />
            <span className="truncate">{t('dashboard.evaluations', 'توثيق الإنجاز')}</span>
          </button>
        </div>
      </section>

      {/* 🟢 بطاقات أداء الأكاديمية KPIs Grid (باستخدام المكون الفرعي النظيف StatCard) */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        
        {/* قوة الأكاديمية / الطلاب */}
        <StatCard
          title={t('dashboard.academy_strength', 'قوة الأكاديمية')}
          value={safeText(stats?.studentsCount, '0')}
          subtitle={`● ${t('dashboard.active_students', 'طلاب نشطون مقيدون')}`}
          icon={GraduationCap}
          iconColorClass="text-semantic-success"
          onClick={() => setActiveTab && setActiveTab('students')}
        />

        {/* معدل الثبات والتتابع */}
        <StatCard
          title={t('dashboard.consistency_rate', 'معدل الثبات')}
          value={safeText(stats?.avgStreak, '0')}
          unit={t('dashboard.days', 'يوم')}
          subtitle={`🔥 ${t('dashboard.active_streak', 'تتابع الحفظ المستمر')}`}
          icon={Flame}
          iconColorClass="text-semantic-actionPrimary"
        />

        {/* نسبة الحضور */}
        <StatCard
          title={t('dashboard.attendance_rate', 'نسبة الحضور')}
          value={safeText(stats?.attendanceRate, '0%')}
          subtitle={`📈 ${t('dashboard.engagement_rate', 'معدل الانضباط')}`}
          icon={TrendingUp}
          iconColorClass="text-semantic-success"
          onClick={() => setActiveTab && setActiveTab('attendance')}
        />

        {/* معدل التسميع اليومي (مع نافذة التلميح السريعة) */}
        <StatCard
          title={t('dashboard.daily_recitation_rate', 'معدل التسميع')}
          value={safeText(stats?.totalSessions, '0')}
          unit={t('dashboard.sessions', 'جلسة')}
          subtitle={`✅ ${t('dashboard.completed_today', 'جلسات مكتملة اليوم')}`}
          icon={BookOpen}
          iconColorClass="text-semantic-actionPrimary"
          onClick={() => setShowProgressTooltip(!showProgressTooltip)}
        >
          {showProgressTooltip && (
            <div className="absolute top-full right-0 left-0 mt-1.5 p-2 rounded-xl bg-semantic-surfaceSecondary border border-semantic-borderHover shadow-2xl z-20 text-[10px] space-y-1 animate-fade-in">
              <div className="flex justify-between font-bold text-semantic-textPrimary">
                <span>{t('dashboard.hifz_new', 'حفظ جديد:')}</span>
                <span className="text-semantic-success">مفعل</span>
              </div>
              <div className="flex justify-between font-bold text-semantic-textPrimary">
                <span>{t('dashboard.review', 'مراجعة وتثبيت:')}</span>
                <span className="text-semantic-actionPrimary">مفعل</span>
              </div>
            </div>
          )}
        </StatCard>

        {/* التنبيهات المالية والمستحقات */}
        <StatCard
          title={t('dashboard.financial_alerts', 'التنبيهات المالية')}
          value={safeText(stats?.overdueCount, '0')}
          subtitle={`⚠️ ${t('dashboard.pending_tasks', 'ملاحظات مستحقة')}`}
          icon={AlertTriangle}
          iconColorClass={(stats?.overdueCount || 0) > 0 ? 'text-semantic-danger' : 'text-semantic-success'}
          borderHoverClass="hover:border-semantic-danger/40"
          onClick={() => setActiveTab && setActiveTab('payments')}
        />
      </section>

      {/* 🚀 قسم الرادار التنافسي الذكي: لوحة الشرف + رادار المتابعة الاستباقية */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        
        {/* لوحة شرف الإنجاز اليومي */}
        <div className={`${UI.card} p-3.5`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs md:text-sm font-extrabold flex items-center gap-1.5 m-0 text-semantic-textPrimary">
              <Trophy className="text-semantic-actionPrimary shrink-0" size={16} />
              <span>{t('dashboard.daily_honor_roll', 'لوحة شرف الإنجاز اليومي')}</span>
            </h2>
            <button 
              onClick={() => setActiveTab && setActiveTab('students')}
              className="text-[11px] font-bold text-semantic-actionPrimary hover:underline bg-transparent border-0 cursor-pointer p-0"
            >
              {t('dashboard.view_all', 'عرض الكل')}
            </button>
          </div>

          {stats?.topPerformers && stats.topPerformers.length > 0 ? (
            <div className="space-y-2">
              {stats.topPerformers.map((student, idx) => (
                <div key={student.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-semantic-actionPrimary/10 border border-semantic-actionPrimary/30 text-semantic-actionPrimary font-black text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate text-semantic-textPrimary">
                      {safeText(student.name, t('dashboard.unnamed_student', 'طالب'))}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-semantic-success bg-semantic-successBg px-2 py-0.5 rounded-md border border-semantic-successBorder/50 shrink-0 flex items-center gap-1">
                    <Zap size={10} />
                    <span>{student.sessionsCount} {t('dashboard.session_unit', 'تسميع')}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-semantic-textMuted text-xs font-semibold">
              {t('dashboard.no_top_performers', 'لم يتم تسجيل جلسات تسميع حتى الآن اليوم.')}
            </div>
          )}
        </div>

        {/* رادار المتابعة الاستباقية */}
        <div className={`${UI.card} p-3.5`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-xs md:text-sm font-extrabold flex items-center gap-1.5 m-0 text-semantic-textPrimary truncate">
              <UserX className="text-semantic-danger shrink-0" size={16} />
              <span className="truncate">{t('dashboard.proactive_radar', 'رادار المتابعة الاستباقية')}</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-semantic-dangerBg border border-semantic-danger/30 text-semantic-danger font-bold shrink-0">
              {stats?.atRiskStudents?.length || 0} {t('dashboard.needs_followup', 'يحتاج تشجيع')}
            </span>
          </div>

          {stats?.atRiskStudents && stats.atRiskStudents.length > 0 ? (
            <div className="space-y-2">
              {stats.atRiskStudents.map((student, idx) => (
                <div key={student.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-semantic-danger shrink-0 animate-ping"></span>
                    <span className="text-xs font-bold truncate text-semantic-textPrimary">
                      {safeText(student.name, t('dashboard.unnamed_student', 'طالب'))}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab && setActiveTab('students')}
                    aria-label={t('dashboard.follow_up', 'تواصل سريع')}
                    className="text-[10px] font-bold text-semantic-danger bg-semantic-dangerBg/50 border border-semantic-danger/30 hover:bg-semantic-danger/20 px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>{t('dashboard.follow_up', 'تواصل سريع')}</span>
                    {isRtl ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-semantic-success text-xs font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 size={15} />
              <span>{t('dashboard.all_students_active', 'جميع الطلاب مستمرون بنجاح هذا اليوم!')}</span>
            </div>
          )}
        </div>

      </section>

      {/* 🟢 جدول وقائمة الحلقات النشطة */}
      {stats?.activeHalaqasData && stats.activeHalaqasData.length > 0 ? (
        <section className={`${UI.card} p-3.5 md:p-4`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm md:text-base font-black flex items-center gap-2 m-0 text-semantic-textPrimary">
              <Landmark className="text-semantic-actionPrimary shrink-0" size={18} />
              <span>{t('dashboard.active_halaqas_title', 'الحلقات النشطة وحالة التسميع اللحظية')}</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-semantic-borderInput bg-semantic-surfaceInput text-semantic-textSecondary font-bold shrink-0">
              {stats.activeHalaqasData.length} {t('dashboard.halaqa_unit', 'حلقة')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.activeHalaqasData.map((halaqa, idx) => {
              const isLive = halaqa.status === 'live';
              const isFinished = halaqa.status === 'finished';
              const halaqaName = safeText(halaqa.name, t('dashboard.default_halaqa_name', 'حلقة قرآنية'));
              const teacherName = safeText(halaqa.teacher_name, t('dashboard.unspecified', 'غير محدد'));
              const timeDisplay = safeText(isRtl ? halaqa.time_display_ar : halaqa.time_display_en, '');
              const teachingType = safeText(halaqa.teaching_type, t('dashboard.in_person', 'حضوري'));

              return (
                <div 
                  key={halaqa.id || idx} 
                  className="p-3.5 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h3 className="m-0 text-xs md:text-sm font-bold leading-snug text-semantic-textPrimary">
                        {halaqaName}
                      </h3>
                      <HalaqaStatusBadge status={halaqa.status} isLive={isLive} isFinished={isFinished} t={t} />
                    </div>

                    <div className="text-xs mb-1 flex items-center gap-1.5 text-semantic-textSecondary">
                      <User size={13} className="text-semantic-textMuted shrink-0" />
                      <span className="truncate">{t('dashboard.teacher', 'المعلم:')} {teacherName}</span>
                    </div>

                    {timeDisplay && (
                      <div className="text-[11px] mb-2 flex items-center gap-1.5 text-semantic-textMuted">
                        <Clock size={13} className="shrink-0" />
                        <span className="truncate">{timeDisplay}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-semantic-borderInput flex justify-between items-center mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded border border-semantic-actionPrimary/30 bg-semantic-actionPrimary/10 text-semantic-actionPrimary font-bold inline-flex items-center gap-1 shrink-0">
                      <Award size={11} />
                      <span>{teachingType}</span>
                    </span>
                    <button 
                      onClick={() => setActiveTab && setActiveTab('halaqas')} 
                      aria-label={t('dashboard.view_halaqa_details', 'تفاصيل الحلقة')}
                      className="text-[11px] font-bold text-semantic-actionPrimary bg-transparent border-0 cursor-pointer p-0 hover:underline min-h-[36px] flex items-center gap-1"
                    >
                      <span>{t('dashboard.view_details', 'تفاصيل الحلقة')}</span>
                      {isRtl ? <ArrowLeft size={11} /> : <ArrowRight size={11} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className={`${UI.card} text-center py-6 p-4`}>
          <Activity size={24} className="mx-auto mb-2 text-semantic-textMuted" />
          <p className="text-xs font-bold m-0 text-semantic-textSecondary">
            {t('dashboard.no_active_halaqas_improved', 'جميع الحلقات الحية حالياً مكتملة. يمكنك بدء حلقة جديدة أو مراجعة جدول اليوم.')}
          </p>
        </section>
      )}

    </div>
  );
}
