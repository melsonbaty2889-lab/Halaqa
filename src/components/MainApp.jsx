/* src/components/MainApp.jsx */
import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react"; 
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import styles from './MainApp.module.css'; 
import { FaClock, FaWifi } from "react-icons/fa";

import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import Dashboard from './Dashboard.jsx'; 

// 🛡️ دالة الاستيراد الديناميكي المطور لمكافحة أخطاء البناء القديم تلقائياً
const safeLazy = (importFn) => {
  return lazy(() =>
    importFn().catch((error) => {
      const errorMsg = error?.message || error?.toString() || '';
      if (/Failed to fetch dynamically imported module|chunk load error|loading chunk/i.test(errorMsg)) {
        console.warn("🚨 تم رصد نسخة بناء قديمة في كاش المتصفح، جاري إعادة تحميل المنظومة لجلب التحديثات...");
        window.location.reload();
        return new Promise(() => {}); 
      }
      throw error;
    })
  );
};

// 🌐 استيراد الأقسام ديناميكياً عبر درع الصيانة safeLazy
const Students = safeLazy(() => import('./Students.jsx'));
const Attendance = safeLazy(() => import('./Attendance.jsx'));
const Exams = safeLazy(() => import('./Exams.jsx')); 
const Payments = safeLazy(() => import('./Payments.jsx'));
const Settings = safeLazy(() => import('./Settings.jsx')); 
const Reports = safeLazy(() => import('./Reports.jsx'));
const SubscriptionPage = safeLazy(() => import('./SubscriptionPage.jsx'));
const ActiveHalaqas = safeLazy(() => import('./ActiveHalaqas.jsx'));

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Centralized Module Error Logged:", error, errorInfo);
  }
  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || this.state.error?.toString() || '';
      if (/Failed to fetch dynamically imported module|chunk load error|loading chunk/i.test(errorMsg)) {
        window.location.reload();
        return null;
      }
      return (
        <div className={styles.errorInnerWrapper} style={{ padding: '20px', background: '#1e293b', borderRadius: '12px', textAlign: 'center', color: '#EF4444' }}>
          <h3>⚠️ {t('errorLoading', 'حدث خطأ غير متوقع في تشغيل هذا القسم')}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{this.state.error?.message || "Internal Context Error"}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 16px', background: '#FBBF24', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {t('retry', 'إعادة المحاولة')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MainApp({ session, userRole, trialDaysLeft, isTrial = true, isActivated }) {
  const { t, i18n } = useTranslation(); 
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  const currentLang = i18n.language || 'ar';
  const lastFetchedUserId = useRef(null);

  // 🌟 إدارة التبويبات مع الذاكرة المحلية بقيم افتراضية محمية
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('smart_halaqa_tab') || 'dashboard');
  useEffect(() => {
    localStorage.setItem('smart_halaqa_tab', activeTab);
  }, [activeTab]); 

  // 🌟 حالات الشاشة والشبكة
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true); 
  
  // 🌟 مستودعات البيانات الأساسية المحمية بمصفوفات افتراضية
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [halaqas, setHalaqas] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [academyName, setAcademyName] = useState(""); 
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);
  
  const [accountActivated, setAccountActivated] = useState(() => isActivated ?? true);
  const [academyIsActive, setAcademyIsActive] = useState(false); 
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

  // 🌟 إعدادات التوطين والعملات للمنصة الدولية
  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const [currency, setCurrency] = useState(isPlatformAdmin ? "EGP" : "USD");          
  const [timezone, setTimezone] = useState(isPlatformAdmin ? "Africa/Cairo" : "UTC");          
  const [countryCode, setCountryCode] = useState(isPlatformAdmin ? "EG" : "US");   
  const [academyTime, setAcademyTime] = useState("");

  const numberFormatter = useMemo(() => new Intl.NumberFormat(currentLang, { useGrouping: true }), [currentLang]);

  // 🔒 1. مراقبة انتهاء الصلاحية وتسجيل الخروج المفاجئ لجلسة السحابة
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        console.warn("🔐 تم إنهاء الجلسة الأمنية، جاري التوجيه لبوابة تسجيل الدخول...");
        window.location.reload();
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  // 📡 مراقبة حالة اتصال الإنترنت
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 📱 مراقبة استجابة الأبعاد للهواتف الذكية
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🌍 تطبيق خصائص اتجاهات اللغات بشكل فوري وموحد
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [isRtl, currentLang]);

  // ⏰ ساعة المنصة الذكية المزامنة مع النطاق الزمني للمؤسسة
  useEffect(() => {
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat(currentLang, {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        setAcademyTime(formatter.format(new Date()));
      } catch (e) {
        setAcademyTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timezone, currentLang]);

  // 📥 نواة جلب البيانات المركزية الحصينة
  useEffect(() => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) {
      setLoadingData(false);
      return;
    }

    if (lastFetchedUserId.current === currentUserId) return;
    lastFetchedUserId.current = currentUserId;

    async function loadInitialData() {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_activated')
          .eq('id', currentUserId)
          .maybeSingle();
        
        if (profileData) setAccountActivated(profileData.is_activated ?? false);

        const { data: staff } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name, currency, timezone, country_code, is_active)')
          .eq('user_id', currentUserId)
          .maybeSingle();

        const currentAcademyId = staff?.academies?.id || staff?.academy_id;
        const currentAcademyName = staff?.academies?.name;
        const currentAcademyActive = staff?.academies?.is_active;

        if (currentAcademyId) {
          setAcademyId(currentAcademyId);
          if (currentAcademyName) setAcademyName(currentAcademyName); 
          if (currentAcademyActive !== undefined) setAcademyIsActive(!!currentAcademyActive);

          if (staff?.academies?.currency) setCurrency(staff.academies.currency);
          if (staff?.academies?.timezone) setTimezone(staff.academies.timezone);
          if (staff?.academies?.country_code) setCountryCode(staff.academies.country_code);

          const [studentsRes, examsRes, teachersRes, halaqasRes] = await Promise.all([
            supabase.from('students').select('*').eq('academy_id', currentAcademyId),
            supabase.from('exams').select('*', { count: 'exact', head: true }).eq('academy_id', currentAcademyId),
            supabase.from('teachers').select('*').eq('academy_id', currentAcademyId),
            supabase.from('halaqas').select('*').eq('academy_id', currentAcademyId)
          ]);

          if (studentsRes.data) setStudents(studentsRes.data);
          if (examsRes.count !== null) setCompletedExamsCount(examsRes.count);
          if (teachersRes.data) setTeachers(teachersRes.data);
          if (halaqasRes.data) setHalaqas(halaqasRes.data);
        }
      } catch (error) {
        console.error("Error fetching system assets safely:", error);
      } finally {
        setLoadingData(false);
      }
    }
    loadInitialData();
  }, [session]);

  // 🛠️ ربط وتحديث مصفوفة الحلقات لتضمين أسماء المعلمين ديناميكياً للعرض المحمي
  const enrichedHalaqas = useMemo(() => {
    return halaqas.map(h => {
      const teacher = teachers.find(t => t.id === h.teacher_id);
      return {
        ...h,
        teacher_name: teacher ? teacher.name : (h.teacher_name || (isRtl ? 'غير معين' : 'Unassigned'))
      };
    });
  }, [halaqas, teachers, isRtl]);

  // 💾 دالة إنشاء حلقة جديدة وإرسالها لـ Supabase فوريّاً مع تثبيت مرجعي
  const handleCreateHalaqa = useCallback(async (formData) => {
    try {
      const { data, error } = await supabase
        .from('halaqas')
        .insert([{ 
          name_ar: formData.name_ar,
          name_en: formData.name_en,
          teacher_id: formData.teacher_id,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          status: formData.status,
          academy_id: academyId,
          is_archived: false
        }])
        .select();

      if (error) throw error;
      if (data) setHalaqas(prev => [data[0], ...prev]);
    } catch (err) {
      console.error("Error creating new halaqa row:", err);
      alert(isRtl ? "حدث خطأ أثناء حفظ الحلقة، يرجى التحقق من بنية الجدول" : "Failed to create halaqa");
    }
  }, [academyId, isRtl]);

  // 📦 دالة أرشفة أو تنشيط الحلقة داخل Supabase فوريّاً مع تثبيت مرجعي
  const handleToggleArchiveHalaqa = useCallback(async (id, currentArchivedStatus) => {
    try {
      const { error } = await supabase
        .from('halaqas')
        .update({ is_archived: !currentArchivedStatus })
        .eq('id', id);

      if (error) throw error;
      setHalaqas(prev => prev.map(h => h.id === id ? { ...h, is_archived: !currentArchivedStatus } : h));
    } catch (err) {
      console.error("Error changing archive status:", err);
    }
  }, []);

  const currentActivationState = true; 

  const preloadedDashboardData = useMemo(() => ({
    academyName: isPlatformAdmin ? (isRtl ? "إدارة المنصة العامة" : "Global Platform Admin") : academyName,
    role: userRole, 
    is_activated: currentActivationState,
    status: currentActivationState ? 'active' : 'pending',
    stats: {
      students: students.length,
      pending: students.filter(s => s.payment_status === 'unpaid' || s.payment_status === 'pending').length || 0,
      activeHalagas: halaqas.filter(h => !h.is_archived).length, 
      completedExams: completedExamsCount 
    }
  }), [isPlatformAdmin, isRtl, academyName, userRole, currentActivationState, students, halaqas, completedExamsCount]);

  const isBlockActive = userRole !== 'admin' && userRole !== 'super_admin' && (
    (isTrial && trialDaysLeft <= 0 && !currentActivationState) || 
    (!isTrial && trialDaysLeft <= 0)
  );

  // 🌟 2. سجل التبويبات المميّز (Tab Components Lookup Object Engine)
  const tabComponentRegistry = {
    dashboard: <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={currentActivationState} />,
    students: <Students students={students} setStudents={setStudents} academyId={academyId} halaqas={enrichedHalaqas} />,
    attendance: <Attendance students={students} academyId={academyId} timezone={timezone} halaqas={enrichedHalaqas} />,
    exams: <Exams students={students} academyId={academyId} />,
    payments: <Payments students={students} academyId={academyId} currency={currency} />,
    settings: <Settings academyId={academyId} session={session} currentCurrency={currency} currentTimezone={timezone} currentCountryCode={countryCode} />,
    reports: <Reports students={students} academyId={academyId} countryCode={countryCode} />,
    halaqas: (
      <ActiveHalaqas 
        halaqas={enrichedHalaqas} teachers={teachers} students={students} isLoading={loadingData}
        error={null} isRtl={isRtl} isMobile={isMobile} onCreateHalaqa={handleCreateHalaqa} onToggleArchiveHalaqa={handleToggleArchiveHalaqa}
      />
    ),
    teachers: (
      <div style={{ padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', direction: isRtl ? 'rtl' : 'ltr' }}>
        <h2 style={{ color: '#38BDF8', marginBottom: '12px' }}>{isRtl ? '👨‍🏫 الكادر التعليمي والتربوي' : '👨‍🏫 Faculty & Instructors'}</h2>
        <p style={{ color: '#9CA3AF' }}>{isRtl ? 'إجمالي الكفاءات التعليمية النشطة بالمؤسسة:' : 'Total active educational faculty:'} <strong style={{ color: '#FFF', margin: '0 4px' }}>{teachers.length}</strong></p>
      </div>
    )
  };

  if (showEarlyUpgrade) {
    return (
      <Suspense fallback={<div style={{ padding: '40px', color: '#FBBF24' }}>Loading Infrastructure Module...</div>}>
        <SubscriptionPage session={session} onBack={() => setShowEarlyUpgrade(false)} currentLang={currentLang} />
      </Suspense>
    );
  }

  if (isBlockActive) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#090F17', padding: '20px', direction: isRtl ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: '500px', background: '#111827', padding: '40px', borderRadius: '16px', border: '1px solid #1f2937', textAlign: 'center' }}>
          <FaClock size={44} style={{ color: '#EF4444', marginBottom: '20px' }} />
          <h2 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '15px' }}>{isTrial ? t('pending_payments_alert', '⚠️ Trial Period Concluded') : '⚠️ Institutional License Expired'}</h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '30px' }}>
            {isTrial 
              ? (isRtl ? 'انتهت الصلاحية التجريبية للنظام. يرجى ترقية الحساب لتجنب تعليق البنية التحتية والخدمات السحابية للأكاديمية.' : 'Trial period concluded. Please upgrade your account to prevent service suspension.')
              : (isRtl ? 'يرجى تجديد الترخيص المؤسسي لتفادي إيقاف الأنظمة التشغيلية للحلقات والأكاديمية.' : 'Please renew your institutional license to prevent operational downtime.')}
          </p>
          <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', padding: '12px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{t('logout', 'تسجيل الخروج من النظام')}</button>
        </div>
      </div>
    );
  }

  const skeletonLoader = (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', opacity: 0.5 }}>
      <div style={{ height: '35px', width: '25%', backgroundColor: '#334155', borderRadius: '6px' }}></div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ height: '110px', backgroundColor: '#1e293b', borderRadius: '10px' }}></div>
        <div style={{ height: '110px', backgroundColor: '#1e293b', borderRadius: '10px' }}></div>
        <div style={{ height: '110px', backgroundColor: '#1e293b', borderRadius: '10px' }}></div>
      </div>
    </div>
  );

      return (
    <div style={{
      display: 'flex', 
      minHeight: '100vh', 
      background: '#0f172a', 
      color: '#fff',
      fontFamily: "'Cairo', sans-serif", 
      position: 'relative'
      /* 👈 تم حذف overflow: hidden و flexDirection المزدوج لتعتمد الصفحة على الاتجاه الأصلي dir="rtl" */
    }}>
      
      {/* 1. خلفية التعتيم عند فتح الموبايل */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, backdropFilter: 'blur(4px)' }} />
      )}
      
      {/* 2. استدعاء السايدبار */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile} 
        isRtl={isRtl} 
        t={t} 
        userRole={userRole} 
        trialDaysLeft={trialDaysLeft} 
        isTrial={isTrial}
        accountActivated={currentActivationState} 
        setShowEarlyUpgrade={setShowEarlyUpgrade} 
        numberFormatter={numberFormatter}
        timezone={timezone} 
        academyTime={academyTime}
      />

      {/* 3. حاوي المحتوى الرئيسي */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100vh' }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isRtl={isRtl} t={t} currency={currency} countryCode={countryCode} i18n={i18n} activeTab={activeTab} />

        {!isOnline && (
          <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '6px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #991b1b' }}>
            <FaWifi style={{ animation: 'pulse 1s infinite' }} />
            <span>{isRtl ? 'تم قطع الاتصال بالبنية التحتية السحابية. يعمل النظام حالياً في وضع الحفظ المؤقت المحلي.' : 'Disconnected from cloud core. Running on local cache mode.'}</span>
          </div>
        )}

        <div style={{ padding: isMobile ? '16px' : '24px', flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>
          <ErrorBoundaryInner key={activeTab} t={t}>
            <Suspense fallback={skeletonLoader}>
              {loadingData ? skeletonLoader : (tabComponentRegistry[activeTab] || tabComponentRegistry.dashboard)}
            </Suspense>
          </ErrorBoundaryInner>
        </div>
      </div>
    </div>
  );
}
