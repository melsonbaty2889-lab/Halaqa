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

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const stats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const academyName = preloadedDashboardData?.academyName || "";
  const activeCurrency = currency || "USD";
  
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => { isComponentMounted.current = false; };
  }, []);

  // 👑 1. ترحيب مؤسسي مرن يمنع اختناق النصوص وتداخلها على الشاشات الصغيرة
  const getGreeting = () => {
    try {
      const currentHour = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone
      }).format(new Date());
      
      const hour = parseInt(currentHour, 10) || new Date().getHours();
      const userFullName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || '';
      
      // تقصير النصوص الترحيبية قليلاً لتوفر مساحة تنفس (UX Layout Breathing Room) لمنع الـ Overflow
      if (hour < 12) {
        return isRtl 
          ? `صباح الخير والبركة${userFullName ? `، الأستاذ ${userFullName}` : ''} 🌟`
          : `Good morning${userFullName ? `, ${userFullName}` : ''} 🌟`;
      } else {
        return isRtl 
          ? `مساء الخير والمسرات${userFullName ? `، الأستاذ ${userFullName}` : ''} ✨`
          : `Good evening${userFullName ? `, ${userFullName}` : ''} ✨`;
      }
    } catch (e) {
      return isRtl ? 'السلام عليكم، أهلاً بكم في المنصة' : 'Welcome to your dashboard';
    }
  };

  // 🌍 2. توليد التاريخ الميلادي المستقر
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

  // 🛡️ 3. نظام اعتراض واصلاح التاريخ الهجري لمنع عطل الـ BC (Anti-Glitch Engine)
  const getHijriDate = () => {
    try {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone
      };

      if (isRtl) {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', options).format(new Date());
      } else {
        // جلب التاريخ الإنجليزي وفحصه فوراً
        let formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', options);
        let formattedStr = formatter.format(new Date());

        // 🚨 صمام الأمان: إذا تداخلت حسابات المتصفح وأنتجت تاريخاً ميلادياً أو قبل الميلاد (BC/BCE/Year > 2000)
        if (formattedStr.includes('BC') || formattedStr.includes('BCE') || parseInt(formattedStr.match(/\d+/)?.[0] || 0) > 2000) {
          
          // حل عبقري: جلب الأرقام الصافية والموثوقة من التقويم الأم للمنطقة العربية
          const rawArabicHijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            year: 'numeric', month: 'numeric', day: 'numeric', timeZone: timezone
          }).format(new Date());
          
          // تحويل الأرقام الهندية لإنجليزية صافية لتقسيمها
          const cleanDigits = rawArabicHijri.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
          const [hYear, hMonth, hDay] = cleanDigits.split(/[\/\s-]/).map(Number);
          
          // مصفوفة الشهور الهجرية الصوتية المعتمدة دولياً للمستخدم الأجنبي
          const islamicMonths = [
            "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", 
            "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", 
            "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
          ];
          
          return `${islamicMonths[(hMonth - 1) || 0]} ${hDay || 1}, ${hYear || 1448} AH`;
        }

        // إضافة لاحقة العهد الهجري إذا لم تكن موجودة تلقائياً
        return formattedStr.includes('AH') ? formattedStr : `${formattedStr} AH`;
      }
    } catch (e) {
      // خطة طوارئ قصوى تضمن عدم بياض أو انهيار الشاشة تحت أي ظرف
      return isRtl ? "١٠ محرم ١٤٤٨ هـ" : "Muharram 10, 1448 AH";
    }
  };

  // 4. دالة جلب ومزامنة البيانات المركزية للسيرفر
  const fetchDashboardData = useCallback(async (showOverlayLoading = true) => {
    if (!isPlatformAdmin) { setLoading(false); return; }
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
        setErrorState(isRtl ? "فشل اتصال المزامنة الحية مع نواة السيرفر المركزي." : "Central cloud core sync execution latency.");
      }
    } catch (err) {
      if (isComponentMounted.current) {
        setErrorState(isRtl ? "فشل اتصال المزامنة الحية مع السيرفر." : "Central cloud core sync execution latency.");
      }
    } finally {
      if (isComponentMounted.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [isPlatformAdmin, isRtl]);

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
        alert(isRtl 
          ? "فشل تفعيل الترخيص نتيجة انقطاع طارئ في الشبكة السحابية." 
          : "Operational licensing activation failure. State rolled back.");
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer} style={{ padding: '24px', opacity: 0.6 }}>
        <div className={styles.skeletonHeader} style={{ height: '45px', backgroundColor: '#1e293b', borderRadius: '8px', marginBottom: '24px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div style={{ height: '130px', backgroundColor: '#1e293b', borderRadius: '12px' }}></div>
          <div style={{ height: '130px', backgroundColor: '#1e293b', borderRadius: '12px' }}></div>
        </div>
      </div>
    );
  }

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
        errorState={errorState}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
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
      currency={activeCurrency}
      getGregorianDate={getGregorianDate}
      getHijriDate={getHijriDate}
    />
  );
}
