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
  ArrowLeft
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

  // 🟢 استماع مباشر للحدث للضمان المطلق لفتح الأكاديمية
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
      return isArabic ? 'إدارة المنصة' : 'Platform Administration';
    }
    return parsedUserName;
  }, [rawAcademyName, rawUserName, isArabic, safeText]);

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
      <div className="p-4 space-y-4">
        <div className="h-8 bg-slate-800 animate-pulse rounded-lg w-1/2"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-800 border border-slate-700/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isSuperAdmin && !selectedAdminAcademy) {
    return (
      <Suspense fallback={<div className="p-5 text-center text-slate-400">جاري تحميل لوحة التحكم...</div>}>
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
    <div className={`p-3 pb-20 text-right ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {isSuperAdmin && selectedAdminAcademy && (
        <div className="mb-4">
          <button
            onClick={() => setSelectedAdminAcademy(null)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            <span>{isArabic ? 'الرجوع للوحة التحكم الرئيسية (Super Admin)' : 'Back to Super Admin'}</span>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 mb-5">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 m-0 leading-tight">
              {isArabic ? 'أهلاً بك،' : 'Welcome back,'} {displayName}
            </h1>
            <p className="text-slate-400 text-xs m-0 mt-1">
              {isArabic ? 'منصة إدارة الحلقات الحية والرصد الأكاديمي الموحد' : 'Live Session & Academic Ecosystem'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
            <span className="text-emerald-400">{isArabic ? 'متزامن لحظياً' : 'Realtime Synced'}</span>
            {lastSyncTime && <span className="text-slate-400 text-[10px]">({lastSyncTime})</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 mb-5 scrollbar-none">
        <button 
          onClick={() => setActiveTab && setActiveTab('halaqas')} 
          className="bg-amber-600 hover:bg-amber-500 text-white border-0 px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-600/20"
        >
          <Plus size={15} />
          <span>{isArabic ? 'إطلاق حلقة تعليمية' : 'Launch Session'}</span>
        </button>

        <button 
          onClick={() => setActiveTab && setActiveTab('attendance')} 
          className="bg-slate-800 text-slate-100 border border-slate-700/60 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <ClipboardCheck size={15} className="text-sky-400" />
          <span>{isArabic ? 'تسجيل الحضور' : 'Attendance Record'}</span>
        </button>

        <button 
          onClick={() => setActiveTab && setActiveTab('students')} 
          className="bg-slate-800 text-slate-100 border border-slate-700/60 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <BookOpen size={15} className="text-amber-500" />
          <span>{isArabic ? 'توثيق الإنجاز والتسميع' : 'Evaluation'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        <div 
          onClick={() => setActiveTab && setActiveTab('students')}
          className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors"
        >
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold mb-1.5">
            <span className="truncate">{isArabic ? 'إجمالي الطلاب' : 'Total Learners'}</span>
            <GraduationCap className="text-sky-400" size={18} />
          </div>
          <div className="text-2xl font-extrabold text-slate-100">{safeText(stats?.studentsCount, '0')}</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
            {isArabic ? 'طلاب نشطون' : 'Active Enrolled'}
          </div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold mb-1.5">
            <span>{isArabic ? 'مؤشر الاستمرارية' : 'Consistency'}</span>
            <Flame className="text-orange-500" size={18} />
          </div>
          <div className="text-2xl font-extrabold text-orange-500">
            {safeText(stats?.avgStreak, '0')} <span className="text-xs font-normal text-slate-400">{isArabic ? 'يوم' : 'Days'}</span>
          </div>
          <div className="text-[10px] text-orange-400 mt-1 font-semibold">
            {isArabic ? 'التتابع المستمر' : 'Active Streak'}
          </div>
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('attendance')}
          className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors"
        >
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold mb-1.5">
            <span>{isArabic ? 'نسبة الحضور' : 'Daily Attendance'}</span>
            <TrendingUp className="text-sky-400" size={18} />
          </div>
          <div className="text-2xl font-extrabold text-sky-400">{safeText(stats?.attendanceRate, '0%')}</div>
          <div className="text-[10px] text-sky-300 mt-1 font-semibold">
            {isArabic ? 'معدل المشاركة' : 'Engagement Rate'}
          </div>
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('halaqas')}
          className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors"
        >
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold mb-1.5">
            <span>{isArabic ? 'جلسات التسميع' : 'Evaluations'}</span>
            <BookOpen className="text-amber-500" size={18} />
          </div>
          <div className="text-2xl font-extrabold text-amber-500">
            {safeText(stats?.totalSessions, '0')} <span className="text-xs font-normal text-slate-400">{isArabic ? 'جلسة' : 'Sessions'}</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-1 font-semibold">
            {isArabic ? 'المكتملة اليوم' : 'Completed Today'}
          </div>
        </div>

        <div 
          onClick={() => setActiveTab && setActiveTab('payments')}
          className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors"
        >
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold mb-1.5">
            <span>{isArabic ? 'المتأخرات' : 'Status'}</span>
            <AlertTriangle className={(stats?.overdueCount || 0) > 0 ? "text-rose-500" : "text-emerald-400"} size={18} />
          </div>
          <div className={`text-2xl font-extrabold ${(stats?.overdueCount || 0) > 0 ? "text-rose-500" : "text-emerald-400"}`}>
            {safeText(stats?.overdueCount, '0')}
          </div>
          <div className={`text-[10px] mt-1 font-semibold ${(stats?.overdueCount || 0) > 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {isArabic ? 'طلبات التعديل' : 'Tasks'}
          </div>
        </div>
      </div>

      {stats?.activeHalaqasData && stats.activeHalaqasData.length > 0 && (
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 mb-5">
          <div className="flex justify-between items-center mb-3.5">
            <h3 className="text-sm text-slate-100 font-bold flex items-center gap-1.5 m-0">
              <Landmark className="text-amber-500" size={18} />
              <span>{isArabic ? 'الحلقات النشطة' : 'Active Sessions'}</span>
            </h3>
            <span className="text-xs text-slate-400">
              {stats.activeHalaqasData.length} {isArabic ? 'حلقة' : 'active'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {stats.activeHalaqasData.map((halaqa, idx) => {
              const isLive = halaqa.status === 'live';
              const isFinished = halaqa.status === 'finished';
              
              const statusBg = isLive ? 'bg-rose-950/40 border-rose-500/30' : isFinished ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-sky-950/40 border-sky-500/30';
              const statusColor = isLive ? 'text-rose-400' : isFinished ? 'text-emerald-400' : 'text-sky-400';
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
                <div key={halaqa.id || idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="m-0 text-slate-100 text-sm font-bold">
                      {halaqaName}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold inline-flex items-center gap-1 ${statusBg} ${statusColor}`}>
                      <StatusIcon size={12} className={isLive ? 'animate-spin' : ''} />
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="text-slate-400" size={14} />
                    <span>{isArabic ? `المعلم: ${teacherName}` : `Teacher: ${teacherName}`}</span>
                  </div>

                  {timeDisplay && (
                    <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <Clock className="text-slate-400" size={14} />
                      <span>{timeDisplay}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/20 font-semibold inline-flex items-center gap-1">
                      <Award size={11} />
                      <span>{teachingType}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
