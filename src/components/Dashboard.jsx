/* src/components/Dashboard.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getDashboardStats } from '../lib/dashboardService'; // 1. استيراد الخدمة المطورة
import AdminDashboard from './AdminDashboard';
import AcademyDashboard from './AcademyDashboard';

export default function Dashboard({ 
  session, 
  userRole,
  setActiveTab, 
  preloadedDashboardData, 
  currency,
  timezone = 'Africa/Cairo'
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [errorState, setErrorState] = useState(null);
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);
  const [liveStats, setLiveStats] = useState(null); // حالة تخزين مؤشرات الحضور والتسميع اللحظية

  const isSuperAdmin = userRole === 'super_admin';
  const academyName = preloadedDashboardData?.academyName || "";
  const userFullName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';

  // 2. دمج آمن ومطور للبيانات مسبقة التحميل مع المؤشرات اللحظية المجلوبة من السيرفر
  const baseStats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const stats = {
    ...baseStats,
    students: liveStats?.studentsCount !== undefined ? liveStats.studentsCount : (baseStats.students || 0),
    pending: liveStats?.overdueCount !== undefined ? liveStats.overdueCount : (baseStats.pending || 0),
    attendanceRate: liveStats?.attendanceRate || null,
    totalPagesRecited: liveStats?.totalPagesRecited || null // التسمية اللغوية الصحيحة عالمياً
  };

  // 3. الترحيب العالمي الموحد والمستقر (تحية السلام)
  const getGreeting = () => {
    return isRtl 
      ? 'السلام عليكم ورحمة الله وبركاته'
      : 'Assalamu Alaikum wa Rahmatullah wa Barakatuh';
  };

  // 4. معالجة وجلب البيانات الحية للأكاديمية ديناميكياً
  const fetchDashboardData = useCallback(async (showOverlayLoading = true) => {
    if (showOverlayLoading) setLoading(true);
    
    try {
      if (isSuperAdmin) {
        const { data, error } = await supabase.from('academies').select('*').eq('is_active', false);
        if (error) throw error;
        setPendingAcademies(data || []);
        setTotalAcademiesCount(data?.length || 0);
      } else {
        // بناء كائن الصلاحيات لتمريره للخدمة بشكل مستقر
        const profileMock = {
          role: userRole,
          academy_id: preloadedDashboardData?.academy_id || preloadedDashboardData?.id || session?.user?.user_metadata?.academy_id
        };
        
        const data = await getDashboardStats(supabase, profileMock);
        if (data) {
          setLiveStats(data);
        }
      }
    } catch (err) {
      setErrorState(t('error_loading'));
    } // تم تصحيح الكلمة الإملائية هنا لضمان استقرار البناء والتشغيل
    finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isSuperAdmin, t, userRole, preloadedDashboardData, session]);

  useEffect(() => { fetchDashboardData(true); }, [fetchDashboardData]);

  // 5. حالة التحميل (Skeleton Loading)
  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  // 6. حالة الانتظار (Pending Screen)
  if (!isSuperAdmin && preloadedDashboardData?.is_active === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="p-8 bg-panel-surface border border-white/5 rounded-3xl max-w-md shadow-2xl">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {isRtl ? 'حسابك قيد المراجعة' : 'Account Under Review'}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isRtl ? 'سيتم تفعيل لوحة التحكم فور مراجعة بيانات الأكاديمية.' : 'Your workspace will unlock automatically upon admin approval.'}
          </p>
        </div>
      </div>
    );
  }

  // 7. العرض الأساسي المستقر
  return (
    <div className="w-full min-h-screen pb-20">
      {isSuperAdmin ? (
        <AdminDashboard 
          {...{ isRtl, academyName: userFullName, totalAcademiesCount, pendingAcademies, isRefreshing, onRefresh: () => fetchDashboardData(false) }}
        />
      ) : (
        <AcademyDashboard 
          {...{ isRtl, greeting: getGreeting(), academyName, stats, setActiveTab, t, currency }}
        />
      )}
    </div>
  );
}
