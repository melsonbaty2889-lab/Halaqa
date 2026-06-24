/* src/components/MainApp.jsx */
import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react"; 
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import styles from './MainApp.module.css'; 
import { FaClock, FaWifi } from "react-icons/fa";

// استيراد المكونات الهيكلية الثابتة (تحميل فوري لأهميتها)
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import Dashboard from './Dashboard.jsx'; // لوحة التحكم تفتح فوراً لتجربة مستخدم ممتازة

// 🚀 [ميزة غير مسبوقة 1]: التحميل الديناميكي المتطور (Code Splitting) لتقليص حجم الباقة وسرعة البرق
const Students = lazy(() => import('./Students.jsx'));
const Attendance = lazy(() => import('./Attendance.jsx'));
const Exams = lazy(() => import('./Exams.jsx')); 
const Payments = lazy(() => import('./Payments.jsx'));
const Settings = lazy(() => import('./Settings.jsx')); 
const Reports = lazy(() => import('./Reports.jsx'));
const SubscriptionPage = lazy(() => import('./SubscriptionPage.jsx'));

// مكون معالجة الأخطاء الذكي
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

export default function MainApp({ session, userRole, trialDaysLeft, isTrial = true }) {
  const { t, i18n } = useTranslation(); 
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // 🌐 تتبع حالة الإنترنت فورياً
  
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [academyName, setAcademyName] = useState(""); 
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);
  const [accountActivated, setAccountActivated] = useState(true);
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const [currency, setCurrency] = useState(isPlatformAdmin ? "EGP" : "USD");         
  const [timezone, setTimezone] = useState(isPlatformAdmin ? "Africa/Cairo" : "UTC");         
  const [countryCode, setCountryCode] = useState(isPlatformAdmin ? "EG" : "US");   

  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  const lastFetchedUserId = useRef(null);
  const currentLang = i18n.language || 'ar';

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(currentLang, { useGrouping: true });
  }, [currentLang]);

  const [academyTime, setAcademyTime] = useState("");

  // 🌐 مراقبة حالة اتصال النظام السحابي بالإنترنت لمنع فقد البيانات
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [isRtl, currentLang]);

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
          .select('academy_id, academies(id, name, currency, timezone, country_code)')
          .eq('user_id', currentUserId)
          .maybeSingle();

        const currentAcademyId = staff?.academies?.id || staff?.academy_id;
        const currentAcademyName = staff?.academies?.name;

        if (currentAcademyId) {
          setAcademyId(currentAcademyId);
          if (currentAcademyName) setAcademyName(currentAcademyName); 

          if (staff?.academies?.currency) setCurrency(staff.academies.currency);
          if (staff?.academies?.timezone) setTimezone(staff.academies.timezone);
          if (staff?.academies?.country_code) setCountryCode(staff.academies.country_code);

          const { data: studentsData } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', currentAcademyId);
          
          if (studentsData) setStudents(studentsData);

          const { count: examsCount, error: examsError } = await supabase
            .from('exams')
            .select('*', { count: 'exact', head: true })
            .eq('academy_id', currentAcademyId);

          if (!examsError && examsCount !== null) setCompletedExamsCount(examsCount);
        }
      } catch (error) {
        console.error("Error fetching system assets:", error);
      } finally {
        setLoadingData(false);
      }
    }
    loadInitialData();
  }, [session]);

  const preloadedDashboardData = {
    academyName: isPlatformAdmin ? (isRtl ? "إدارة المنصة العامة" : "Global Platform Admin") : academyName,
    role: userRole, 
    stats: {
      students: students.length,
      pending: students.filter(s => s.payment_status === 'unpaid' || s.payment_status === 'pending').length || 0,
      activeHalagas: students.length > 0 ? Math.ceil(students.length / 8) : 0, 
      completedExams: completedExamsCount 
    }
  };

  const isBlockActive = userRole !== 'admin' && userRole !== 'super_admin' && (
    (isTrial && trialDaysLeft <= 0 && !accountActivated) || 
    (!isTrial && trialDaysLeft <= 0)
  );

  if (showEarlyUpgrade) {
    return (
      <Suspense fallback={<div style={{ padding: '40px', color: '#FBBF24' }}>Loading Infrastructure Module...</div>}>
        <SubscriptionPage session={session} onBack={() => setShowEarlyUpgrade(false)} />
      </Suspense>
    );
  }

  if (isBlockActive) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#090F17', padding: '20px', direction: isRtl ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: '500px', background: '#111827', padding: '40px', borderRadius: '16px', border: '1px solid #1f2937', textAlign: 'center' }}>
          <FaClock size={44} style={{ color: '#EF4444', marginBottom: '20px' }} />
          <h2 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '15px' }}>
            {isTrial ? t('pending_payments_alert', '⚠️ Trial Period Concluded') : '⚠️ Institutional License Expired'}
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '30px' }}>
            {isTrial 
              ? (isRtl ? 'انتهت الصلاحية التجريبية للنظام. يرجى ترقية الحساب لتجنب تعليق البنية التحتية والخدمات السحابية للأكاديمية.' : 'Trial period concluded. Please upgrade your account to prevent service suspension and maintain access to the academy\'s cloud infrastructure.')
              : (isRtl ? 'يرجى تجديد الترخيص المؤسسي لتفادي إيقاف الأنظمة التشغيلية للحلقات والأكاديمية.' : 'Please renew your institutional license to prevent operational downtime across your academy.')}
          </p>
          <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', padding: '12px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {t('logout', 'تسجيل الخروج من النظام')}
          </button>
        </div>
      </div>
    );
  }

  // هيدر تحميل المحتوى (Skeleton Loader الفخم الموحد)
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

  const renderContent = () => {
    if (loadingData) return skeletonLoader;

    // 🔒 [ميزة غير مسبوقة 2]: جدار الحماية والأمن السيبراني للأدوار لمنع حقن الحالات العشوائية
    if (isPlatformAdmin && activeTab !== 'dashboard' && activeTab !== 'settings') {
      return <div style={{ padding: '24px', color: '#EF4444', fontWeight: 'bold' }}>⚠️ Access Denied: Insufficient Node Permissions.</div>;
    }

    return (
      <div style={{ padding: isMobile ? '16px' : '24px', flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>
        <ErrorBoundaryInner key={activeTab} t={t}>
          {/* Suspense يحمي النظام من الانهيار أثناء جلب كود الصفحة ديناميكياً */}
          <Suspense fallback={skeletonLoader}>
            {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} currency={currency} />}
            {activeTab === 'students' && <Students students={students} setStudents={setStudents} academyId={academyId} />}
            {activeTab === 'attendance' && <Attendance students={students} academyId={academyId} timezone={timezone} />}
            {activeTab === 'exams' && <Exams students={students} academyId={academyId} />}
            {activeTab === 'payments' && <Payments students={students} academyId={academyId} currency={currency} />}
            {activeTab === 'settings' && <Settings academyId={academyId} session={session} currentCurrency={currency} currentTimezone={timezone} currentCountryCode={countryCode} />}
            {activeTab === 'reports' && <Reports students={students} academyId={academyId} countryCode={countryCode} />}
          </Suspense>
        </ErrorBoundaryInner>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0f172a', 
      color: '#fff',
      fontFamily: "'Cairo', sans-serif",
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, backdropFilter: 'blur(4px)' }} 
        />
      )}
      
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
        isMobile={isMobile} isRtl={isRtl} t={t} userRole={userRole} trialDaysLeft={trialDaysLeft} isTrial={isTrial}
        accountActivated={accountActivated} setShowEarlyUpgrade={setShowEarlyUpgrade} numberFormatter={numberFormatter}
        timezone={timezone} academyTime={academyTime}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100vh' }}>
        
        <Header 
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isRtl={isRtl}
          t={t} currency={currency} countryCode={countryCode} i18n={i18n} activeTab={activeTab}
        />

        {/* 🌐 [ميزة غير مسبوقة 3]: شريط إشعار فوري ذكي لحالة مزامنة السيرفر السحابي */}
        {!isOnline && (
          <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '6px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #991b1b' }}>
            <FaWifi style={{ animation: 'pulse 1s infinite' }} />
            <span>{isRtl ? 'تم قطع الاتصال بالبنية التحتية السحابية. يعمل النظام حالياً في وضع الحفظ المؤقت المحلي.' : 'Disconnected from cloud core. Running on local cache mode.'}</span>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}
