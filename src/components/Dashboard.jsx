/* src/components/Dashboard.jsx */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import styles from './Dashboard.module.css';
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

  const isSuperAdmin = userRole === 'super_admin';
  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const stats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const academyName = preloadedDashboardData?.academyName || "";
  const activeCurrency = currency || "USD";
  
  const isComponentMounted = useRef(true);

  // 🎯 استخراج اسم المستخدم بشكل آمن وموحد لمنع الأخطاء البرمجية
  const userFullName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';

  useEffect(() => {
    isComponentMounted.current = true;
    return () => { isComponentMounted.current = false; };
  }, []);

  // 👑 ترحيب مؤسسي ذكي يلتف تلقائياً ويمنع تشويه النصوص أو كسر الشاشة
  const getGreeting = () => {
    try {
      const currentHour = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone
      }).format(new Date());
      
      const hour = parseInt(currentHour, 10) || new Date().getHours();
      // تنظيف الاسم وجعله مقتصراً على الاسم الأول والثنائي لمنع تدمير التصميم
      const nameParts = userFullName.split(' ').filter(Boolean);
      const cleanName = nameParts.length > 2 ? `${nameParts[0]} ${nameParts[1]}` : userFullName;

      if (hour < 12) {
        return isRtl 
          ? `صباح الخير والبركة${cleanName ? `، الأستاذ ${cleanName}` : ''} 🌟`
          : `Good morning${cleanName ? `, ${cleanName}` : ''} 🌟`;
      } else {
        return isRtl 
          ? `مساء الخير والمسرات${cleanName ? `، الأستاذ ${cleanName}` : ''} ✨`
          : `Good evening${cleanName ? `, ${cleanName}` : ''} ✨`;
      }
    } catch (e) {
      return isRtl ? 'السلام عليكم، أهلاً بكم' : 'Welcome to your dashboard';
    }
  };

  // 🌍 توليد التاريخ الميلادي المستقر
  const getGregorianDate = () => {
    try {
      return new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone
      });
    } catch (e) {
      return new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  // 🛡️ المحرك الأمني الصارم لتقويم أم القرى - يمنع تماماً ظهور خطأ "قبل الميلاد BC" بالإنجليزية
  const getHijriDate = () => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone };

      if (isRtl) {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', options).format(new Date());
      } else {
        // استخراج أرقام أم القرى النقية والمعصومة من تشوهات المتصفحات القديمة
        const rawArabicHijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
          year: 'numeric', month: 'numeric', day: 'numeric', timeZone: timezone
        }).format(new Date());
        
        const cleanDigits = rawArabicHijri.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
        const dateParts = cleanDigits.split(/[\/\s-]/).filter(Boolean).map(Number);
        
        // فك تفريعي دقيق للمصفوفة بناءً على نمط النظام المشهور (يوم/شهر/سنة أو سنة/شهر/يوم)
        let hYear = dateParts.find(p => p > 1300) || 1448;
        let hMonth = dateParts.find(p => p <= 12 && p > 0) || 1;
        let hDay = dateParts.find(p => p !== hYear && p !== hMonth) || 1;

        const islamicMonths = [
          "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", 
          "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", 
          "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
        ];
        
        return `${islamicMonths[(hMonth - 1) || 0]} ${hDay}, ${hYear} AH`;
      }
    } catch (e) {
      return isRtl ? "١٠ محرم ١٤٤٨ هـ" : "Muharram 10, 1448 AH";
    }
  };

  const fetchDashboardData = useCallback(async (showOverlayLoading = true) => {
    if (!isSuperAdmin) { setLoading(false); return; }
    if (showOverlayLoading) setLoading(true);
    setErrorState(null);
    try {
      const { data: pendingData, error: pendingError } = await supabase
        .from('academies')
        .select('id, name, country_code, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50); 
      if (pendingError) throw pendingError;

      const { count, error: countError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });
      if (countError) throw countError;

      if (isComponentMounted.current) {
        setPendingAcademies(pendingData || []);
        setTotalAcademiesCount(count || 0);
      }
    } catch (err) {
      if (isComponentMounted.current) {
        setErrorState(isRtl ? "فشل اتصال المزامنة الحية." : "Central cloud core sync execution latency.");
      }
    } finally {
      if (isComponentMounted.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [isSuperAdmin, isRtl]);

  useEffect(() => { 
    fetchDashboardData(true); 
  }, [fetchDashboardData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData(false);
  };

  const handleActivateAcademy = async (academyId) => {
    const rollbackSnapshot = [...pendingAcademies];
    setPendingAcademies(prev => prev.filter(ac => ac.id !== academyId));

    try {
      const { error } = await supabase
        .from('academies')
        .update({ status: 'active', is_activated: true })
        .eq('id', academyId);
      
      if (error) throw error;
      setTotalAcademiesCount(prev => prev + 1);
    } catch (err) {
      if (isComponentMounted.current) {
        setPendingAcademies(rollbackSnapshot);
        alert(isRtl ? "فشل تفعيل الترخيص." : "Activation failure.");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', opacity: 0.6, maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ height: '45px', backgroundColor: '#1e293b', borderRadius: '8px', marginBottom: '24px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div style={{ height: '130px', backgroundColor: '#1e293b', borderRadius: '12px' }}></div>
          <div style={{ height: '130px', backgroundColor: '#1e293b', borderRadius: '12px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '100vw', 
      overflowX: 'hidden', 
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {isSuperAdmin ? (
        <AdminDashboard 
          isRtl={isRtl}
          academyName={userFullName} // ✅ تم التصحيح هنا لاستخدام المتغير الآمن المعرف بالأعلى بدلاً من userProfile المفقود
          getGregorianDate={getGregorianDate}
          getHijriDate={getHijriDate}
          totalAcademiesCount={totalAcademiesCount}
          pendingAcademies={pendingAcademies}
          handleActivateAcademy={handleActivateAcademy}
          errorState={errorState}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
        />
      ) : (
        <AcademyDashboard 
          isRtl={isRtl}
          greeting={getGreeting()}
          academyName={academyName}
          stats={stats}
          setActiveTab={setActiveTab}
          t={t}
          currency={activeCurrency}
          getGregorianDate={getGregorianDate}
          getHijriDate={getHijriDate}
        />
      )}
    </div>
  );
}
