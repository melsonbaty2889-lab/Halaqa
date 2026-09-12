import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { getDashboardStats } from '@/lib/dashboardService';
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
  Award,
  ArrowRight,
  ArrowLeft,
  Activity,
  Sparkles,
  ShieldCheck,
  Loader2
} from 'lucide-react';

const AdminDashboard = lazy(() => import('@/components/Dashboard/AdminDashboard'));

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
    avgStreak: 0
  });
  
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const safeText = useCallback((val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      const extracted = isArabic ? (val.ar || val.en) : (val.en || val.ar);
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
  }, [isArabic]);

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
        channel = supabase.channel(`dashboard-realtime-${academyId}`);
        
        if (channel && typeof channel.on === 'function') {
          channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: filterCondition }, handleRealtimeChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_progress', filter: filterCondition }, handleRealtimeChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: filterCondition }, handleRealtimeChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'halaqas', filter: filterCondition }, handleRealtimeChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'student_streaks', filter: filterCondition }, handleRealtimeChange)
            .subscribe();
        }
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
      <div className="p-4 md:p-6 space-y-6 flex flex-col items-center justify-center min-h-[400px] bg-dark-bg text-appText-sub">
        <Loader2 className="animate-spin text-amber-500 mb-2" size={36} />
        <p className="text-sm font-semibold">
          {t('common.loading', 'جاري تحميل لوحة التحكم...')}
        </p>
      </div>
    );
  }

  if (isSuperAdmin && !selectedAdminAcademy) {
    return (
      <Suspense fallback={
        <div className="p-8 text-center font-bold flex items-center justify-center gap-2 text-appText-sub">
          <Loader2 className="animate-spin text-amber-500" size={20} />
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
    <div className={`p-4 md:p-6 pb-24 space-y-6 font-cairo bg-dark-bg text-appText-main ${isRtl ? 'rtl text-start' : 'ltr text-start'}`}>
      
      {/* 🔴 تنبيه وضع المسؤول العام Super Admin */}
      {isSuperAdmin && selectedAdminAcademy && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-500">
          <span className="text-xs font-bold flex items-center gap-2">
            <ShieldCheck size={18} />
            <span>{t('dashboard.viewing_academy', 'تتصفح الآن أكاديمية:')} {displayName}</span>
          </span>
          <button
            onClick={() => setSelectedAdminAcademy(null)}
            aria-label={t('dashboard.back_to_super_admin', 'الرجوع للوحة التحكم الرئيسية')}
            className="btn-secondary min-h-[38px] text-xs py-1.5 px-3"
          >
            {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            <span>{t('dashboard.back_to_super_admin', 'الرجوع للوحة التحكم الرئيسية')}</span>
          </button>
        </div>
      )}

      {/* 🟢 الترحيب وتزامن البيانات */}
      <header className="card-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2 m-0 text-white">
            <span>{t('dashboard.welcome', 'أهلاً بك،')}</span>
            <span className="text-amber-500">{displayName}</span>
            <Sparkles size={20} className="animate-pulse text-amber-500" />
          </h1>
          <p className="text-xs md:text-sm mt-1 m-0 text-appText-sub">
            {t('dashboard.subtitle', 'منصة إدارة الحلقات الحية والرصد الأكاديمي الموحد')}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold self-start md:self-center bg-brandEmerald-bg border border-brandEmerald-border text-brandEmerald">
          <span className="w-2 h-2 rounded-full bg-brandEmerald animate-pulse"></span>
          <span>{t('dashboard.realtime_synced', 'متزامن لحظياً')}</span>
          {lastSyncTime && <span className="text-[10px] text-appText-muted">({lastSyncTime})</span>}
        </div>
      </header>

      {/* 🟢 شريط الإجراءات المباشرة */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button 
          onClick={() => setActiveTab && setActiveTab('halaqas')} 
          aria-label={t('dashboard.launch_session', 'إطلاق حلقة تعليمية')}
          className="btn-primary flex items-center justify-center gap-2 min-h-[48px]"
        >
          <Plus size={18} />
          <span>{t('dashboard.launch_session', 'إطلاق حلقة تعليمية')}</span>
        </button>

        <button 
          onClick={() => setActiveTab && setActiveTab('attendance')} 
          aria-label={t('dashboard.record_attendance', 'تسجيل الحضور')}
          className="btn-secondary flex items-center justify-center gap-2 min-h-[48px]"
        >
          <ClipboardCheck size={18} className="text-sky-400" />
          <span>{t('dashboard.record_attendance', 'تسجيل الحضور')}</span>
        </button>

        <button 
          onClick={() => setActiveTab && setActiveTab('students')} 
          aria-label={t('dashboard.evaluations', 'توثيق الإنجاز والتسميع')}
          className="btn-secondary flex items-center justify-center gap-2 min-h-[48px]"
        >
          <BookOpen size={18} className="text-amber-500" />
          <span>{t('dashboard.evaluations', 'توثيق الإنجاز والتسميع')}</span>
        </button>
      </section>

      {/* 🟢 بطاقات أداء الأكاديمية KPIs Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* الطلاب */}
        <div 
          onClick={() => setActiveTab && setActiveTab('students')}
          tabIndex={0}
          role="button"
          aria-label={t('dashboard.total_students', 'إجمالي الطلاب')}
          className="bg-dark-surface border border-appBorder-card p-4 rounded-xl cursor-pointer hover:border-amber-500/40 transition-all shadow-md group relative overflow-hidden"
        >
          <div className="flex justify-between items-center text-xs font-bold mb-2 text-appText-sub">
            <span className="truncate">{t('dashboard.total_students', 'إجمالي الطلاب')}</span>
            <div className="p-2 rounded-lg bg-dark-bg">
              <GraduationCap className="text-sky-400" size={18} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {safeText(stats?.studentsCount, '0')}
          </div>
          <div className="text-[11px] mt-1 font-semibold flex items-center gap-1 text-brandEmerald">
            <span>●</span> {t('dashboard.active_students', 'طلاب نشطون')}
          </div>
        </div>

        {/* الاستمرارية والتتابع */}
        <div className="bg-dark-surface border border-appBorder-card p-4 rounded-xl shadow-md group relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold mb-2 text-appText-sub">
            <span>{t('dashboard.consistency', 'مؤشر الاستمرارية')}</span>
            <div className="p-2 rounded-lg bg-dark-bg">
              <Flame className="text-orange-500" size={18} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-orange-500">
            {safeText(stats?.avgStreak, '0')} <span className="text-xs font-normal text-appText-sub">{t('dashboard.days', 'يوم')}</span>
          </div>
          <div className="text-[11px] mt-1 font-semibold flex items-center gap-1 text-orange-400">
            <span>🔥</span> {t('dashboard.active_streak', 'التتابع المستمر')}
          </div>
        </div>

        {/* نسبة الحضور */}
        <div 
          onClick={() => setActiveTab && setActiveTab('attendance')}
          tabIndex={0}
          role="button"
          aria-label={t('dashboard.attendance_rate', 'نسبة الحضور')}
          className="bg-dark-surface border border-appBorder-card p-4 rounded-xl cursor-pointer hover:border-sky-500/40 transition-all shadow-md group relative overflow-hidden"
        >
          <div className="flex justify-between items-center text-xs font-bold mb-2 text-appText-sub">
            <span>{t('dashboard.attendance_rate', 'نسبة الحضور')}</span>
            <div className="p-2 rounded-lg bg-dark-bg">
              <TrendingUp className="text-sky-400" size={18} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-sky-400">
            {safeText(stats?.attendanceRate, '0%')}
          </div>
          <div className="text-[11px] mt-1 font-semibold flex items-center gap-1 text-sky-400">
            <span>📈</span> {t('dashboard.engagement_rate', 'معدل المشاركة')}
          </div>
        </div>

        {/* جلسات التسميع */}
        <div 
          onClick={() => setActiveTab && setActiveTab('halaqas')}
          tabIndex={0}
          role="button"
          aria-label={t('dashboard.evaluations_sessions', 'جلسات التسميع')}
          className="bg-dark-surface border border-appBorder-card p-4 rounded-xl cursor-pointer hover:border-amber-500/40 transition-all shadow-md group relative overflow-hidden"
        >
          <div className="flex justify-between items-center text-xs font-bold mb-2 text-appText-sub">
            <span>{t('dashboard.evaluations_sessions', 'جلسات التسميع')}</span>
            <div className="p-2 rounded-lg bg-dark-bg">
              <BookOpen className="text-amber-500" size={18} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-500">
            {safeText(stats?.totalSessions, '0')} <span className="text-xs font-normal text-appText-sub">{t('dashboard.sessions', 'جلسة')}</span>
          </div>
          <div className="text-[11px] mt-1 font-semibold flex items-center gap-1 text-amber-500">
            <span>✅</span> {t('dashboard.completed_today', 'المكتملة اليوم')}
          </div>
        </div>

        {/* المتأخرات وطلبات التعديل */}
        <div 
          onClick={() => setActiveTab && setActiveTab('payments')}
          tabIndex={0}
          role="button"
          aria-label={t('dashboard.overdue_status', 'حالة المتأخرات')}
          className="bg-dark-surface border border-appBorder-card p-4 rounded-xl cursor-pointer hover:border-red-500/40 transition-all shadow-md group relative overflow-hidden"
        >
          <div className="flex justify-between items-center text-xs font-bold mb-2 text-appText-sub">
            <span>{t('dashboard.overdue_status', 'المتأخرات')}</span>
            <div className="p-2 rounded-lg bg-dark-bg">
              <AlertTriangle className={(stats?.overdueCount || 0) > 0 ? 'text-red-500' : 'text-brandEmerald'} size={18} />
            </div>
          </div>
          <div className={`text-2xl md:text-3xl font-black ${(stats?.overdueCount || 0) > 0 ? 'text-red-500' : 'text-brandEmerald'}`}>
            {safeText(stats?.overdueCount, '0')}
          </div>
          <div className={`text-[11px] mt-1 font-semibold flex items-center gap-1 ${(stats?.overdueCount || 0) > 0 ? 'text-red-500' : 'text-brandEmerald'}`}>
            <span>⚠️</span> {t('dashboard.pending_tasks', 'طلبات وملاحظات')}
          </div>
        </div>
      </section>

      {/* 🟢 جدول وقائمة الحلقات النشطة */}
      {stats?.activeHalaqasData && stats.activeHalaqasData.length > 0 ? (
        <section className="card-surface">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-black flex items-center gap-2 m-0 text-white">
              <Landmark className="text-amber-500" size={20} />
              <span>{t('dashboard.active_halaqas_title', 'الحلقات النشطة وحالة التسميع اللحظية')}</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full border border-appBorder-input bg-dark-bg text-appText-sub font-bold">
              {stats.activeHalaqasData.length} {t('dashboard.halaqa_unit', 'حلقة')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {stats.activeHalaqasData.map((halaqa, idx) => {
              const isLive = halaqa.status === 'live';
              const isFinished = halaqa.status === 'finished';
              
              const statusClass = isLive 
                ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                : isFinished 
                ? 'bg-brandEmerald-bg border-brandEmerald-border text-brandEmerald' 
                : 'bg-sky-500/10 border-sky-500/30 text-sky-400';

              const statusLabel = isLive 
                ? t('dashboard.status_live', 'جارية الآن') 
                : isFinished 
                ? t('dashboard.status_finished', 'مكتملة') 
                : t('dashboard.status_scheduled', 'مجدولة');

              const StatusIcon = isLive ? RefreshCw : isFinished ? CheckCircle2 : Hourglass;
              const halaqaName = safeText(isArabic ? halaqa.name_ar : halaqa.name_en, t('dashboard.default_halaqa_name', 'حلقة قرآنية'));
              const teacherName = safeText(isArabic ? halaqa.teacher_name_ar : halaqa.teacher_name_en, t('dashboard.unspecified', 'غير محدد'));
              const timeDisplay = safeText(isArabic ? halaqa.time_display_ar : halaqa.time_display_en, '');
              const teachingType = safeText(halaqa.teaching_type, t('dashboard.in_person', 'حضوري'));

              return (
                <div 
                  key={halaqa.id || idx} 
                  className="p-4 rounded-xl border border-appBorder-input bg-dark-bg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="m-0 text-sm font-bold leading-snug text-white">
                        {halaqaName}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0 ${statusClass}`}>
                        <StatusIcon size={12} className={isLive ? 'animate-spin' : ''} />
                        <span>{statusLabel}</span>
                      </span>
                    </div>

                    <div className="text-xs mb-1 flex items-center gap-1.5 text-appText-sub">
                      <User size={14} className="text-appText-muted" />
                      <span>{t('dashboard.teacher', 'المعلم:')} {teacherName}</span>
                    </div>

                    {timeDisplay && (
                      <div className="text-[11px] mb-3 flex items-center gap-1.5 text-appText-muted">
                        <Clock size={14} />
                        <span>{timeDisplay}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-appBorder-input flex justify-between items-center">
                    <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-500 font-bold inline-flex items-center gap-1">
                      <Award size={11} />
                      <span>{teachingType}</span>
                    </span>
                    <button 
                      onClick={() => setActiveTab && setActiveTab('halaqas')} 
                      aria-label={t('dashboard.view_halaqa_details', 'تفاصيل الحلقة')}
                      className="text-[11px] font-bold text-amber-500 bg-transparent border-0 cursor-pointer p-0 hover:underline min-h-[44px] flex items-center"
                    >
                      {t('dashboard.view_details', 'تفاصيل الحلقة ←')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="card-surface text-center py-8">
          <Activity size={28} className="mx-auto mb-2 text-appText-muted" />
          <p className="text-xs font-bold m-0 text-appText-sub">
            {t('dashboard.no_active_halaqas', 'لا توجد حلقات جارية حالياً، يمكنك إطلاق حلقة جديدة من الأزرار العلوية.')}
          </p>
        </section>
      )}

    </div>
  );
}
