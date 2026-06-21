import React, { useState, useEffect, useRef } from "react"; 
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import styles from './MainApp.module.css'; // استيراد التنسيق المنفصل
import { 
  FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, 
  FaBars, FaSignOutAlt, FaCog, FaAward, FaWhatsapp, 
  FaClock, FaCrown 
} from "react-icons/fa";

import Dashboard from './Dashboard.jsx';
import Students from './Students.jsx';
import Attendance from './Attendance.jsx';
import Exams from './Exams.jsx'; 
import Payments from './Payments.jsx';
import Settings from './Settings.jsx'; 
import Reports from './Reports.jsx';
import SubscriptionPage from './SubscriptionPage.jsx';

// [معالج الأخطاء العالمي]
class ErrorBoundaryInner extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div style={{ padding: '20px', color: '#EF4444' }}>Error in Module</div>;
    return this.props.children;
  }
}

function LocalErrorBoundary({ children }) { return <ErrorBoundaryInner>{children}</ErrorBoundaryInner>; }

export default function MainApp({ session, userRole, trialDaysLeft, isTrial = true }) {
  const { t, i18n } = useTranslation(); 
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  
  // [Hydration Safe: State تبدأ false ثم تتحدث داخل المتصفح فقط]
  const [isMobile, setIsMobile] = useState(false);
  
  // States الأخرى
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [accountActivated, setAccountActivated] = useState(true);
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [countryCode, setCountryCode] = useState("US");
  const [academyTime, setAcademyTime] = useState("");

  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  const isFetchLocked = useRef(false);
  const numberFormatter = new Intl.NumberFormat(i18n.language || 'ar', { useGrouping: true });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // التحديث بعد التحميل
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // [باقي الـ useEffects للجلب والتوقيت تظل كما هي]
  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) { setLoadingData(false); return; }
      try {
        const { data: staff } = await supabase.from('staff').select('academy_id, academies(currency, timezone, country_code)').eq('user_id', session.user.id).maybeSingle();
        if (staff?.academies) {
          setCurrency(staff.academies.currency);
          setTimezone(staff.academies.timezone);
          setCountryCode(staff.academies.country_code);
        }
      } catch (e) { console.error(e); } finally { setLoadingData(false); }
    }
    loadData();
  }, [session]);

  if (showEarlyUpgrade) return <SubscriptionPage session={session} onBack={() => setShowEarlyUpgrade(false)} />;

  return (
    <div className={styles.appContainer} dir={isRtl ? 'rtl' : 'ltr'} style={{ backgroundColor: C.bg }}>
      
      {/* طبقة حماية للموبايل */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1999, backdropFilter: 'blur(5px)' }} />
      )}
      
      <aside 
        className={`${styles.sidebar} ${isMobile ? styles.sidebarMobile : ''}`}
        style={{ 
          background: C.surface,
          display: !isMobile || sidebarOpen ? 'flex' : 'none',
          transform: isMobile && !sidebarOpen ? (isRtl ? 'translateX(100%)' : 'translateX(-100%)') : 'translateX(0)'
        }}
      >
        <h2 style={{ color: C.gold, textAlign: 'center', fontSize: '1.35rem', fontWeight: '800' }}>Smart Halaqa</h2>
        {/* أضف عناصر القائمة هنا */}
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.headerBar} style={{ backgroundColor: C.surface }}>
           {isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)}><FaBars /></button>}
           <div>Global Management Portal</div>
        </div>
        
        <div style={{ backgroundColor: C.surface, padding: '24px', borderRadius: '12px' }}>
          <LocalErrorBoundary key={activeTab}>
             {/* منطق عرض التابز */}
          </LocalErrorBoundary>
        </div>
      </main>
    </div>
  );
}
