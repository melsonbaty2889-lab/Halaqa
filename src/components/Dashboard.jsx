/* src/components/Dashboard.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import styles from './Dashboard.module.css';
import AdminDashboard from './AdminDashboard';
import AcademyDashboard from './AcademyDashboard';

export default function Dashboard({ session, userRole, setActiveTab, preloadedDashboardData, currency }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const stats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const academyName = preloadedDashboardData?.academyName || "";
  const activeCurrency = currency || "USD";

  // 1. دالة الترحيب
  const getGreeting = () => {
    const hour = new Date().getHours();
    const userFullName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || '';
    const nameSuffix = userFullName ? `، ${userFullName}` : '';
    return hour < 12 
      ? (isRtl ? `صباح الخير والبركة 👋${nameSuffix}` : `Good morning 👋${nameSuffix}`)
      : (isRtl ? `مساء الخير والأنوار 👋${nameSuffix}` : `Good evening 👋${nameSuffix}`);
  };

  // 2. دالة التاريخ الميلادي (توقيت القاهرة)
  const getGregorianDate = () => {
    return new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Cairo'
    });
  };

  // 3. دالة التاريخ الهجري (توقيت القاهرة)
  const getHijriDate = () => {
    try {
      return new Date().toLocaleDateString(isRtl ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Africa/Cairo'
      });
    } catch (e) {
      return new Date().toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  // 4. جلب البيانات من السيرفر
  const fetchDashboardData = useCallback(async () => {
    if (!isPlatformAdmin) { setLoading(false); return; }
    setLoading(true);
    setErrorState(null);
    try {
      const { data: pendingData, error: pendingError } = await supabase
        .from('academies')
        .select('id, name, country_code, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50); 
      if (pendingError) throw pendingError;
      setPendingAcademies(pendingData || []);

      const { count, error: countError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });
      if (countError) throw countError;
      setTotalAcademiesCount(count || 0);
    } catch (err) {
      setErrorState(isRtl ? "فشل في مزامنة البيانات الحية مع السيرفر." : "Failed to sync live data.");
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin, isRtl]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleActivateAcademy = async (academyId) => {
    try {
      const { error } = await supabase.from('academies').update({ status: 'active', is_activated: true }).eq('id', academyId);
      if (error) throw error;
      setPendingAcademies(prev => prev.filter(ac => ac.id !== academyId));
      setTotalAcademiesCount(prev => prev + 1);
    } catch (err) {
      alert(isRtl ? "عذراً، تعذر التفعيل." : "Activation failed.");
    }
  };

  if (loading) return <div className={styles.dashboardContainer}><div className={styles.skeletonHeader}></div></div>;

  // توجيه العرض بناءً على الصلاحية لقراءة ملفات منفصلة ونظيفة
  if (isPlatformAdmin) {
    return (
      <AdminDashboard 
        isRtl={isRtl}
        academyName={academyName}
        getGregorianDate={getGregorianDate}
        getHijriDate={getHijriDate}
        totalAcademiesCount={totalAcademiesCount}
        pendingAcademies={pendingAcademies}
        handleActivateAcademy={handleActivateAcademy}
      />
    );
  }

  return (
    <AcademyDashboard 
      isRtl={isRtl}
      greeting={getGreeting()}
      academyName={academyName}
      stats={stats}
      setActiveTab={setActiveTab}
      t={t}
    />
  );
}
