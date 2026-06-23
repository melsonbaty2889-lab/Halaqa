/* src/components/MainApp.jsx */
import React, { useState, useEffect, useRef, useMemo } from "react"; 
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import styles from './MainApp.module.css'; 
import { 
  FaChartLine, 
  FaUsers, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaBars, 
  FaSignOutAlt, 
  FaCog, 
  FaAward, 
  FaWhatsapp, 
  FaClock,
  FaCrown 
} from "react-icons/fa";

import Dashboard from './Dashboard.jsx';
import Students from './Students.jsx';
import Attendance from './Attendance.jsx';
import Exams from './Exams.jsx'; 
import Payments from './Payments.jsx';
import Settings from './Settings.jsx'; 
import Reports from './Reports.jsx';
import SubscriptionPage from './SubscriptionPage.jsx';

// ✅ المكون الأساسي لـ Error Boundary مجهز لاستقبال دالة t بآمان كامل
class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Global Platform Error Logged:", error, errorInfo);
  }
  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className={styles.errorInnerWrapper}>
          <h3 className={styles.errorInnerTitle}>⚠️ {t('errorLoading', 'An unexpected system error occurred within this module')}</h3>
          <p className={styles.errorInnerCode}>
            {this.state.error?.message || "Internal Context Error"}
          </p>
          <button onClick={() => this.setState({ hasError: false, error: null })} className={styles.errorInnerBtn}>
            {t('save', 'Retry Operation')}
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
  
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [academyName, setAcademyName] = useState(""); 
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);
  const [accountActivated, setAccountActivated] = useState(true);
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

  const [currency, setCurrency] = useState("USD");         
  const [timezone, setTimezone] = useState("UTC");         
  const [countryCode, setCountryCode] = useState("US");   

  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  
  // ✅ قفل ذكي يعتمد على تتبع المعرّف الفريد للمستخدم الحالي لمنع مشاكل تسجيل الخروج والدخول
  const lastFetchedUserId = useRef(null);

  // ✅ تجميد منسق الأرقام لمنع استهلاك الذاكرة والمعالج في كل رندر وبثبات مطلق
  const currentLang = i18n.language || 'ar';
  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(currentLang, { useGrouping: true });
  }, [currentLang]);

  const [academyTime, setAcademyTime] = useState("");

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
    if (loadingData) return;
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
  }, [timezone, currentLang, loadingData]);

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
    academyName: academyName,
    role: userRole, 
    stats: {
      students: students.length,
      pending: students.filter(s => s.payment_status === 'unpaid' || s.payment_status === 'pending').length || 0,
      activeHalagas: students.length > 0 ? Math.ceil(students.length / 8) : 0, 
      completedExams: completedExamsCount 
    }
  };

  const isBlockActive = userRole !== 'admin' && (
    (isTrial && trialDaysLeft <= 0 && !accountActivated) || 
    (!isTrial && trialDaysLeft <= 0)
  );

  if (!loadingData && isBlockActive) {
    return (
      <div className={styles.blockActiveWrapper}>
        <div className={styles.blockActiveModal}>
          <FaClock size={44} className={styles.blockActiveIcon} />
          <h2 className={styles.blockActiveTitle}>
            {isTrial ? t('pending_payments_alert', '⚠️ Trial Period Expired') : '⚠️ Subscription Period Expired'}
          </h2>
          <p className={styles.blockActiveText}>
            {isTrial 
              ? (isRtl ? 'انتهت الفترة التجريبية للمنصة. يرجى تفعيل حسابك للاستفادة الكاملة من الأنظمة الدولية للأكاديمية.' : 'The platform trial period has expired. Please activate your account to unlock the full potential of global systems.')
              : (isRtl ? 'يرجى تجديد الاشتراك لتفادي انقطاع الخدمات والأدوات الذكية عن أكاديميتك.' : 'Please renew your subscription to prevent service interruptions across your virtual academy.')}
          </p>
          <button onClick={() => supabase.auth.signOut()} className={styles.blockActiveBtn}>
            {t('logout', 'Sign Out')}
          </button>
        </div>
      </div>
    );
  }

  if (showEarlyUpgrade) return <SubscriptionPage session={session} onBack={() => setShowEarlyUpgrade(false)} />;

  if (loadingData) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingSpinner}></div>
        <span className={styles.loadingText}>{t('loading', 'Loading secure environment...')}</span>
      </div>
    );
  }

  // ✅ تم تغيير آلية الرندر لاستخدام المكون المباشر لتلافي تداخل الـ Hooks في الـ Production تماماً
  const renderContent = () => {
    return (
      <div className={styles.contentWrapper}>
        <ErrorBoundaryInner key={activeTab} t={t}>
          {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} currency={currency} />}
          {activeTab === 'students' && <Students students={students} setStudents={setStudents} academyId={academyId} />}
          {activeTab === 'attendance' && <Attendance students={students} academyId={academyId} timezone={timezone} />}
          {activeTab === 'exams' && <Exams students={students} academyId={academyId} />}
          {activeTab === 'payments' && <Payments students={students} academyId={academyId} currency={currency} />}
          {activeTab === 'settings' && <Settings academyId={academyId} session={session} currentCurrency={currency} currentTimezone={timezone} currentCountryCode={countryCode} />}
          {activeTab === 'reports' && <Reports students={students} academyId={academyId} countryCode={countryCode} />}
        </ErrorBoundaryInner>
      </div>
    );
  };

  const menuItems = [
    { id: 'dashboard', icon: <FaChartLine />, labelKey: 'dashboard', def: 'Control Center', ar: 'مركز التحكم والتحليلات' },
    { id: 'students', icon: <FaUsers />, labelKey: 'student_management', def: 'Student Directory', ar: 'سجل الروّاد والطلاب' },
    { id: 'attendance', icon: <FaCalendarCheck />, labelKey: 'recitation_attendance', def: 'Session Tracking', ar: 'متابعة الجلسات والتحصيل' },
    { id: 'exams', icon: <FaAward />, labelKey: 'surah_juz_exams', def: 'Evaluation Suite', ar: 'نظام التقييم والجدارة' }, 
    { id: 'reports', icon: <FaWhatsapp />, labelKey: 'parent_reports', def: 'Automated Reporting', ar: 'التقارير الذكية والمشاركة' }, 
    { id: 'payments', icon: <FaMoneyBillWave />, labelKey: 'billing_finance', def: 'Billing & Revenue', ar: 'المنظومة المالية والفوترة' },
    { id: 'settings', icon: <FaCog />, labelKey: 'general_settings', def: 'Core Configuration', ar: 'تهيئة النظام المتقدمة' },
  ];

  const activeMenuItem = menuItems.find(m => m.id === activeTab) || menuItems[0];

  return (
    <div className={styles.appContainer}>
      
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className={styles.backdrop} />
      )}
      
      <aside className={`${styles.sidebar} ${isMobile ? styles.sidebarMobile : ''} ${isMobile && !sidebarOpen ? styles.sidebarHidden : ''}`}>
        <h2 className={styles.sidebarTitle}>
          {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
        </h2>

        <div className={styles.sidebarTimeContainer}>
          <span className={styles.sidebarTimeDot}></span>
          <span>{timezone} : {academyTime}</span>
        </div>
        
        {userRole !== 'admin' && (
          <div className={styles.sidebarBadgeContainer}>
            <div className={`${styles.sidebarBadge} ${isTrial ? styles.sidebarBadgeTrial : styles.sidebarBadgeActive}`}>
              <FaClock />
              <span>
                {isTrial 
                  ? (isRtl ? `متبقي ${numberFormatter.format(trialDaysLeft)} أيام تجريبية` : `${numberFormatter.format(trialDaysLeft)} trial days left`)
                  : (isRtl ? `متبقي ${numberFormatter.format(trialDaysLeft)} يوماً على الاشتراك` : `${numberFormatter.format(trialDaysLeft)} days left`)}
              </span>
            </div>

            {isTrial && !accountActivated && (
              <button onClick={() => setShowEarlyUpgrade(true)} className={styles.sidebarUpgradeBtn}>
                <FaCrown />
                <span>{isRtl ? 'ترقية الحساب الآن' : 'Upgrade Account Now'}</span>
              </button>
            )}
          </div>
        )}
        
        <nav className={styles.sidebarNav}>
          {menuItems.map(item => {
            const isSelected = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); if(isMobile) setSidebarOpen(false); }} 
                className={`${styles.sidebarNavBtn} ${isSelected ? styles.sidebarNavBtnSelected : ''}`}
              >
                <span className={styles.sidebarNavIcon}>{item.icon}</span> 
                <span className={styles.sidebarNavLabel}>
                  {isRtl ? item.ar : t(item.labelKey, item.def)}
                </span>
              </button>
            );
          })}
        </nav>

        <button onClick={() => supabase.auth.signOut()} className={styles.sidebarSignOutBtn}>
          <FaSignOutAlt /> <span>{t('logout', 'Log Out')}</span>
        </button>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.headerBar}>
          <div className={styles.headerLeftSection}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className={styles.headerMobileToggle}>
                <FaBars size={16} />
              </button>
            )}
            <div className={styles.headerPathText}>
              {isRtl ? 'بوابة الإدارة العالمية' : 'Global Management Portal'} / <span className={styles.headerPathHighlight}>
                {isRtl ? activeMenuItem?.ar : t(activeMenuItem?.labelKey, activeMenuItem?.def)}
              </span>
            </div>
          </div>

          <div className={styles.headerRightSection}>
            <div className={styles.headerBadgeCurrency} title="Active Billing Currency">
              <FaMoneyBillWave size={13} />
              <span>{currency}</span>
            </div>

            <div className={styles.headerBadgeWhatsapp} title="WhatsApp International Gateway">
              <FaWhatsapp size={13} />
              <span>+{countryCode}</span>
            </div>

            <button 
              onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')} 
              className={styles.headerLangBtn}
              title="Toggle System Language & Direction"
            >
              {isRtl ? 'English 🌐' : 'العربية 🌐'}
            </button>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
