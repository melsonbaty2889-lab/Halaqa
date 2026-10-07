import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { getDashboardStats } from '@/lib/dashboardService';
import { UI } from '@/theme/styles';

import { ShieldCheck, Loader2, Plus, ArrowRight, ArrowLeft } from 'lucide-react';

// استيراد المكونات الفرعية المقسمة
import { WelcomeHeader } from './subcomponents/WelcomeHeader';
import { StatsOverview } from './subcomponents/StatsOverview';
import { TopPerformersCard } from './subcomponents/TopPerformersCard';
import { AtRiskStudentsCard } from './subcomponents/AtRiskStudentsCard';
import { ActiveHalaqasSection } from './subcomponents/ActiveHalaqasSection';

const AdminDashboard = lazy(() =>
  import('@/components/SuperAdmin/AdminDashboard').catch((error) => {
    console.error('Failed to load dynamic module:', error);
    const hasReloaded = sessionStorage.getItem('retry-lazy-refreshed');
    if (!hasReloaded) {
      sessionStorage.setItem('retry-lazy-refreshed', 'true');
      window.location.reload();
    }
    throw error;
  })
);

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

  const rawUserName = session?.user?.user_metadata?.full_name || 
                      session?.user?.user_metadata?.name || '';

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
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [userRole, academyId, selectedAdminAcademy]);

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
    <div className={`w-full px-2.5 py-3 sm:p-5 pb-20 space-y-3 bg-transparent text-semantic-textPrimary min-h-screen ${isRtl ? 'rtl text-start' : 'ltr text-start'}`}>
      
      {/* تنبيه مسؤول النظام */}
      {isSuperAdmin && selectedAdminAcademy && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border bg-semantic-actionPrimary/10 border-semantic-actionPrimary/30 text-semantic-actionPrimary">
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

      {/* 1. كارت الترحيب المحسن بدون حشو أو شارات مكررة */}
      <WelcomeHeader displayName={displayName} userRole={userRole} t={t} />

      {/* 2. زر الإجراء الرئيسي */}
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

      {/* 3. الإحصائيات */}
      <StatsOverview stats={stats} userRole={userRole} t={t} />
      
      {/* 4. أبطال اليوم والطلاب الغائبون */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <TopPerformersCard topPerformers={stats.topPerformers} setActiveTab={setActiveTab} t={t} />
        <AtRiskStudentsCard atRiskStudents={stats.atRiskStudents} setActiveTab={setActiveTab} t={t} />
      </section>

      {/* 5. الحلقات النشطة */}
      <ActiveHalaqasSection 
        activeHalaqasData={stats.activeHalaqasData} 
        safeText={safeText} 
        isRtl={isRtl} 
        setActiveTab={setActiveTab} 
        t={t} 
      />

    </div>
  );
}
