/* src/components/MainApp.jsx */
import React, { useState, useEffect, useRef } from "react"; 
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
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

// معالج الأخطاء العالمي - مترجم وديناميكي بالكامل
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
        <div style={{ padding: '30px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid #EF4444', borderRadius: '12px', color: '#FCA5A5', marginTop: '20px', textAlign: 'start' }}>
          <h3 style={{ color: '#F87171', marginBottom: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>⚠️ {t('errorLoading', 'An unexpected system error occurred within this module')}</h3>
          <p style={{ fontSize: '13px', opacity: 0.8, backgroundColor: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {this.state.error?.message || "Internal Context Error"}
          </p>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ marginTop: '15px', padding: '8px 20px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            {t('save', 'Retry Operation')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LocalErrorBoundary({ children }) {
  const { t } = useTranslation();
  return <ErrorBoundaryInner t={t}>{children}</ErrorBoundaryInner>;
}

export default function MainApp({ session, userRole, trialDaysLeft, isTrial = true }) {
  const { t, i18n } = useTranslation(); 
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [academyName, setAcademyName] = useState(""); 
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);
  const [accountActivated, setAccountActivated] = useState(true);
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

  // 🌍 [الركائز الخمس] إعدادات العولمة الافتراضية المستدعاة ديناميكياً من السيرفر
  const [currency, setCurrency] = useState("USD");         
  const [timezone, setTimezone] = useState("UTC");         
  const [countryCode, setCountryCode] = useState("US");   

  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  const isFetchLocked = useRef(false);

  // 🌍 [الركيزة 2 و 3] إنشاء منسقات محلية ذكية بناءً على لغة واختيارات العميل الدولية لتنسيق الأرقام والوقت
  const numberFormatter = new Intl.NumberFormat(i18n.language || 'ar', { useGrouping: true });
  
  const [academyTime, setAcademyTime] = useState("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language || 'ar';
  }, [isRtl, i18n.language]);

  // 🌍 [الركيزة 3] تحديث التوقيت المحلي للأكاديمية بناءً على منطقتها الزمنية الخاصة لمنع التضارب الدولي
  useEffect(() => {
    if (loadingData) return;
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat(i18n.language || 'ar', {
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
  }, [timezone, i18n.language, loadingData]);

  useEffect(() => {
    if (isFetchLocked.current) return;

    async function loadInitialData() {
      if (!session?.user?.id) {
        setLoadingData(false);
        return;
      }
      
      isFetchLocked.current = true;

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_activated')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileData) setAccountActivated(profileData.is_activated ?? false);

        // 🌍 [الركائز الخمس] جلب بيانات العولمة والعملة والمناطق الزمنية والبلد
        const { data: staff } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name, currency, timezone, country_code)')
          .eq('user_id', session.user.id)
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
        console.error("خطأ جلب البيانات داخل MainApp:", error);
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
      <div style={{ background: C.bg || '#0C1520', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', direction: isRtl ? 'rtl' : 'ltr' }}>
        <div style={{ background: C.surface || '#111C2A', padding: '40px 30px', borderRadius: '16px', border: '1px solid rgba(201,168,76,0.15)', textAlign: 'center', maxWidth: '460px', boxShadow: C.shadow }}>
          <FaClock size={44} color={C.gold || '#C9A84C'} style={{ marginBottom: '20px' }} />
          <h2 style={{ color: '#FFF', fontSize: '1.35rem', fontWeight: 'bold', marginBottom: '12px' }}>
            {isTrial ? t('pending_payments_alert', '⚠️ Trial Period Expired') : '⚠️ Subscription Period Expired'}
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            {isTrial 
              ? (isRtl ? 'انتهت الفترة التجريبية للمنصة. برجاء ترقية حسابك أو التواصل مع الإدارة للتفعيل الحصري.' : 'The trial period for the platform has expired. Please upgrade your plan or contact administration for instant activation.')
              : (isRtl ? 'يرجى تجديد الاشتراك لتفادي انقطاع الخدمات والأدوات الذكية عن أكاديميتك.' : 'Please renew your subscription to prevent service interruptions across your virtual academy.')}
          </p>
          <button onClick={() => supabase.auth.signOut()} style={{ background: C.gold || '#C9A84C', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(201,168,76,0.15)' }}>
            {t('logout', 'Sign Out')}
          </button>
        </div>
      </div>
    );
  }

  if (showEarlyUpgrade) {
    return (
      <SubscriptionPage 
        session={session} 
        onBack={() => setShowEarlyUpgrade(false)} 
      />
    );
  }

  if (loadingData) {
    return (
      <div style={{ color: C.gold || '#C9A84C', backgroundColor: C.bg || '#0C1520', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(201, 168, 76, 0.08)', borderTop: `3px solid ${C.gold || '#C9A84C'}`, borderRadius: '50%', animation: 'spinGlobal 0.75s linear infinite' }}></div>
        <style>{`@keyframes spinGlobal { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontWeight: '500', letterSpacing: isRtl ? '0' : '0.5px' }}>{t('loading', 'Loading system assets...')}</span>
      </div>
    );
  }

  const renderContent = () => {
    const pageStyle = { backgroundColor: C.surface || '#111C2A', minHeight: '80vh', padding: '24px', color: C.text, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' };
    return (
      <div style={pageStyle}>
        <LocalErrorBoundary key={activeTab}>
          {activeTab === 'dashboard' && (
            <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} currency={currency} />
          )}
          {activeTab === 'students' && <Students students={students} setStudents={setStudents} academyId={academyId} />}
          {activeTab === 'attendance' && <Attendance students={students} academyId={academyId} timezone={timezone} />}
          {activeTab === 'exams' && <Exams students={students} academyId={academyId} />}
          {activeTab === 'payments' && <Payments students={students} academyId={academyId} currency={currency} />}
          {activeTab === 'settings' && <Settings academyId={academyId} session={session} currentCurrency={currency} currentTimezone={timezone} currentCountryCode={countryCode} />}
          {activeTab === 'reports' && <Reports students={students} academyId={academyId} countryCode={countryCode} />}
        </LocalErrorBoundary>
      </div>
    );
  };

  const menuItems = [
    { id: 'dashboard', icon: <FaChartLine />, labelKey: 'dashboard' },
    { id: 'students', icon: <FaUsers />, labelKey: 'students' },
    { id: 'attendance', icon: <FaCalendarCheck />, labelKey: 'action_attendance' },
    { id: 'exams', icon: <FaAward />, labelKey: 'action_exams' }, 
    { id: 'reports', icon: <FaWhatsapp />, labelKey: 'action_reports' }, 
    { id: 'payments', icon: <FaMoneyBillWave />, labelKey: 'action_payments' },
    { id: 'settings', icon: <FaCog />, labelKey: 'settings' },
  ];

  const mobilePositionStyle = isMobile ? (isRtl ? { right: 0 } : { left: 0 }) : {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg, flexDirection: 'row', width: '100%', direction: isRtl ? 'rtl' : 'ltr' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1999, backdropFilter: 'blur(4px)' }} />
      )}
      
      <aside style={{ 
        width: 260, 
        background: C.surface, 
        height: '100vh', 
        padding: '24px 20px', 
        display: !isMobile || sidebarOpen ? 'flex' : 'none', 
        flexDirection: 'column', 
        position: isMobile ? 'fixed' : 'relative', 
        top: 0, 
        zIndex: 2000, 
        boxShadow: C.shadow, 
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderLeft: isRtl && !isMobile ? '1px solid rgba(255,255,255,0.03)' : 'none',
        borderRight: !isRtl && !isMobile ? '1px solid rgba(255,255,255,0.03)' : 'none',
        ...mobilePositionStyle
      }}>
        {/* 🌍 [الركيزة 5] حماية نصوص العناوين من الانهيار عند تغيير اللغات الفاخرة */}
        <h2 style={{ color: C.gold, marginBottom: '4px', textAlign: 'center', fontSize: '1.35rem', fontWeight: '800', letterSpacing: isRtl ? 'normal' : '0.5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
        </h2>

        {/* 🌍 [الركيزة 3] العداد الزمني الحي للمنطقة الزمنية الخاصة بالأكاديمية يظهر بوضوح بالخلفية */}
        <div style={{ fontSize: '11px', color: '#657585', textAlign: 'center', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
          <span>{timezone} : {academyTime}</span>
        </div>
        
        {userRole !== 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {/* 🌍 [الركيزة 2] تنسيق الأرقام هنا يعتمد على دالة الفرمتة الدولية المصاغة بالأعلى */}
            <div style={{ 
              backgroundColor: isTrial ? 'rgba(201, 168, 76, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
              color: isTrial ? (C.gold || '#C9A84C') : '#10B981', 
              padding: '10px 12px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              textAlign: 'center', 
              border: isTrial ? '1px solid rgba(201, 168, 76, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              fontWeight: isRtl ? '500' : '600'
            }}>
              <FaClock style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isTrial 
                  ? (isRtl ? `متبقي ${numberFormatter.format(trialDaysLeft)} أيام تجريبية` : `${numberFormatter.format(trialDaysLeft)} trial days left`)
                  : (isRtl ? `متبقي ${numberFormatter.format(trialDaysLeft)} يوماً على الاشتراك` : `${numberFormatter.format(trialDaysLeft)} days left`)}
              </span>
            </div>

            {isTrial && !accountActivated && (
              <button onClick={() => setShowEarlyUpgrade(true)} style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #A58230 100%)', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(201,168,76,0.1)' }}>
                <FaCrown />
                <span style={{ whiteSpace: 'nowrap' }}>{isRtl ? 'ترقية الحساب الآن' : 'Upgrade Account Now'}</span>
              </button>
            )}

            {!isTrial && trialDaysLeft <= 5 && (
              <button onClick={() => setShowEarlyUpgrade(true)} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <FaCrown />
                <span style={{ whiteSpace: 'nowrap' }}>{isRtl ? 'تجديد الاشتراك الحالي 🔄' : 'Renew Subscription'}</span>
              </button>
            )}
          </div>
        )}
        
        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: 'auto' }}>
          {menuItems.map(item => {
            const isSelected = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); if(isMobile) setSidebarOpen(false); }} 
                style={{ 
                  background: isSelected ? (C.gold || '#C9A84C') : 'transparent', 
                  color: isSelected ? '#000' : C.text, 
                  padding: '12px 16px', 
                  borderRadius: 8, 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  width: '100%', 
                  fontSize: '14px', 
                  fontWeight: isSelected ? '700' : '500', 
                  textAlign: isRtl ? 'right' : 'left',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                {/* 🌍 [الركيزة 5] الحماية الكاملة لأسماء الأزرار الطويلة جداً بالإنجليزية من تخريب المحاذاة */}
                <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span> 
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </nav>

        <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', border: '1px solid ' + C.danger, color: C.danger, padding: '11px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center', fontWeight: '700', fontSize: '14px', marginTop: '15px', transition: 'all 0.2s ease' }}>
          <FaSignOutAlt /> <span>{t('logout', 'Log Out')}</span>
        </button>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', padding: '20px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '0 4px' }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '10px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <FaBars size={18} />
            </button>
          )}
          <div style={{ fontSize: '13px', color: '#657585', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '80%' }}>
            {(isRtl ? 'لوحة المتابعة' : 'Management Portal')} / {t(menuItems.find(m => m.id === activeTab)?.labelKey)}
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
