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
  const [isRefreshing, setIsRefreshing] = useState(false); // 🔄 مؤشر التحديث اليدوي المؤقت
  const [errorState, setErrorState] = useState(null);
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const stats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const academyName = preloadedDashboardData?.academyName || "";
  const activeCurrency = currency || "USD";
  
  const isComponentMounted = useRef(true);

  // لضمان تتبع حالة الكومبوننت بدقة تمنع أي تداخل برمي (Memory Leaks)
  useEffect(() => {
    isComponentMounted.current = true;
    return () => { isComponentMounted.current = false; };
  }, []);

  // 👑 ترحيب مؤسسي وقرآني رفيع المستوى يعتمد على النطاق الجغرافي النشط
  const getGreeting = () => {
    try {
      const currentHour = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone
      }).format(new Date());
      
      const hour = parseInt(currentHour, 10) || new Date().getHours();
      const userFullName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || '';
      
      if (hour < 12) {
        return isRtl 
          ? `السلام عليكم ورحمة الله وبركاته، طاب صباحكم بكل خير وبركة${userFullName ? `، الأستاذ ${userFullName}` : ''}`
          : `Peace be upon you. Wishing you a blessed and productive morning${userFullName ? `, ${userFullName}` : ''}`;
      } else {
        return isRtl 
          ? `السلام عليكم ورحمة الله وبركاته، طاب مساؤكم بالخير والمسرات${userFullName ? `، الأستاذ ${userFullName}` : ''}`
          : `Peace be upon you. Wishing you a blessed and productive evening${userFullName ? `, ${userFullName}` : ''}`;
      }
    } catch (e) {
      return isRtl 
        ? 'السلام عليكم ورحمة الله وبركاته، أهلاً بكم في البنية التحتية لإدارة الحلقات'
        : 'Peace be upon you. Welcome to the academic operational infrastructure';
    }
  };

  // 🌍 توليد التاريخ الميلادي العالمي بناءً على النطاق الجغرافي النشط للأكاديمية
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

  // 3️⃣ معالجة فائقة الاستقرار للتاريخ الهجري الدولي المقاوم لانهيار المتصفحات
  const getHijriDate = () => {
    try {
      return new Date().toLocaleDateString(isRtl ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone
      });
    } catch (e) {
      try {
        return new Date().toLocaleDateString(isRtl ? 'ar-SA-u-ca-islamic' : 'en-US-u-ca-islamic', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: timezone
        });
      } catch (err) {
        return isRtl ? "تقويم أم القرى هـ" : "Hijri Date Context";
      }
    }
  };

  // 4️⃣ دالة جلب ومزامنة البيانات المركزية للسيرفر
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

  // 🔄 دالة التحديث اليدوي الخفيفة (Pull-to-Refresh Support)
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData(false);
  };

  // 🔑 تفعيل التراخيص الرسمية مع حقن نظام آمن للتراجع في حال الفشل (Rollback Mechanism)
  const handleActivateAcademy = async (academyId) => {
    // 1. الاحتفاظ بنسخة احتياطية فورية من الحالة الحالية قبل التعديل المتفائل
    const rollbackSnapshot = [...pendingAcademies];

    // 2. تحديث الواجهة فوراً (Optimistic UI Update) لمنح المشرف تجربة سريعة وصاروخية
    setPendingAcademies(prev => prev.filter(ac => ac.id !== academyId));

    try {
      const { error } = await supabase
        .from('academies')
        .update({ status: 'active', is_activated: true })
        .eq('id', academyId);
      
      if (error) throw error;
      
      // في حالة النجاح نحدث إجمالي التراخيص النشطة بشكل صحيح دون إعادة جلب المصفوفة كاملة
      setTotalAcademiesCount(prev => prev + 1);
    } catch (err) {
      // 3. 🚨 خطة الطوارئ: تراجع فوري عن تعديل الواجهة وإعادة العنصر المحذوف إذا فشل السيرفر
      if (isComponentMounted.current) {
        setPendingAcademies(rollbackSnapshot);
        alert(isRtl 
          ? "فشل تفعيل الترخيص نتيجة انقطاع طارئ في الشبكة السحابية، تم استعادة حالة البيانات." 
          : "Operational licensing activation failure. State rolled back to preserve integrity.");
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
        onRefresh={handleManualRefresh} // تمرير زر التحديث للآدمن داشبورد لإنعاش التراخيص معنوياً بصرياً
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
