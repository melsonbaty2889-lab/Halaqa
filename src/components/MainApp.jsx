/* src/components/MainApp.jsx */
import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react"; 
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar.jsx';
import Header from './header/Header';
import Dashboard from './Dashboard.jsx'; 

// 🛡️ دالة الاستيراد الديناميكي المطور لمكافحة أخطاء التحديث والبناء
const safeLazy = (importFn) => {
  return lazy(() =>
    importFn().catch((error) => {
      const errorMsg = error?.message || error?.toString() || '';
      if (/Failed to fetch dynamically imported module|chunk load error|loading chunk/i.test(errorMsg)) {
        console.warn("🚨 تم رصد تحديث في الملفات، جاري إعادة التحميل تلقائياً...");
        window.location.reload();
        return new Promise(() => {}); 
      }
      throw error;
    })
  );
};

// 🌐 استيراد الأقسام ديناميكياً
const Students = safeLazy(() => import('./Students.jsx'));
const Attendance = safeLazy(() => import('./Attendance.jsx'));
const Exams = safeLazy(() => import('./Exams.jsx')); 
const Payments = safeLazy(() => import('./Payments.jsx'));
const Settings = safeLazy(() => import('./Settings.jsx')); 
const Reports = safeLazy(() => import('./Reports.jsx'));
const ActiveHalaqas = safeLazy(() => import('./ActiveHalaqas.jsx'));
const RealtimeAudit = safeLazy(() => import('./RealtimeAudit.jsx'));
const CommunicationHub = safeLazy(() => import('./CommunicationHub.jsx'));

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Error Logged:", error, errorInfo);
  }
  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', background: '#1e293b', borderRadius: '12px', color: '#EF4444', margin: '20px' }}>
          <h3 style={{ marginBottom: '8px' }}>⚠️ حدث خطأ في تحميل هذا القسم</h3>
          {/* إظهار كود الخطأ الدقيق لتشخيصه */}
          <pre style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', color: '#f87171', fontSize: '0.8rem', overflowX: 'auto', direction: 'ltr', textAlign: 'left' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }} 
            style={{ padding: '8px 16px', background: '#FBBF24', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '12px' }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MainApp({ session, userRole, trialDaysLeft, isTrial = true, isActivated }) {
  const { t, i18n } = useTranslation(); 
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;
  const currentLang = i18n?.language || 'ar';
  const lastFetchedUserId = useRef(null);

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('smart_halaqa_tab') || 'dashboard');
  useEffect(() => {
    localStorage.setItem('smart_halaqa_tab', activeTab);
  }, [activeTab]); 

  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isMobile, setIsMobile] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [halaqas, setHalaqas] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [academyName, setAcademyName] = useState(""); 
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);
  
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const [currency, setCurrency] = useState(isPlatformAdmin ? "EGP" : "USD");          
  const [timezone, setTimezone] = useState(isPlatformAdmin ? "Africa/Cairo" : "UTC");          
  const [countryCode, setCountryCode] = useState(isPlatformAdmin ? "EG" : "US");   
  const [academyTime, setAcademyTime] = useState("");

  const numberFormatter = useMemo(() => new Intl.NumberFormat(currentLang, { useGrouping: true }), [currentLang]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat(currentLang, {
          timeZone: timezone || 'UTC', hour: '2-digit', minute: '2-digit', hour12: true
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

  const fetchAcademyData = useCallback(async (targetAcademyId) => {
    if (!targetAcademyId) {
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    try {
      const { data: academyData, error: acErr } = await supabase
        .from('academies')
        .select('id, name, currency, timezone, country_code, is_active')
        .eq('id', targetAcademyId)
        .maybeSingle();

      if (academyData) {
        setAcademyName(academyData.name || "");
        if (academyData.currency) setCurrency(academyData.currency);
        if (academyData.timezone) setTimezone(academyData.timezone);
        if (academyData.country_code) setCountryCode(academyData.country_code);
      }

      const [studentsRes, examsRes, teachersRes, halaqasRes] = await Promise.all([
        supabase.from('students').select('*').eq('academy_id', targetAcademyId),
        supabase.from('exams').select('*', { count: 'exact', head: true }).eq('academy_id', targetAcademyId),
        supabase.from('teachers').select('*').eq('academy_id', targetAcademyId),
        supabase.from('halaqas').select('*').eq('academy_id', targetAcademyId)
      ]);

      setStudents(studentsRes.data || []);
      setCompletedExamsCount(examsRes.count ?? 0);
      setTeachers(teachersRes.data || []);
      setHalaqas(halaqasRes.data || []);
    } catch (error) {
      console.error("Error fetching academy data:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const handleSwitchAcademy = useCallback((newAcademyId) => {
    if (!newAcademyId || newAcademyId === academyId) return;
    setAcademyId(newAcademyId);
    fetchAcademyData(newAcademyId);
  }, [academyId, fetchAcademyData]);

  useEffect(() => {
    const currentUserId = session?.user?.id;
    if (!currentUserId || lastFetchedUserId.current === currentUserId) return;
    lastFetchedUserId.current = currentUserId;

    async function loadInitialData() {
      try {
        setLoadingData(true);
        const { data: staff, error: staffErr } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name, currency, timezone, country_code, is_active)')
          .eq('user_id', currentUserId)
          .maybeSingle();

        const currentAcademyId = staff?.academies?.id || staff?.academy_id;
        if (currentAcademyId) {
          setAcademyId(currentAcademyId);
          await fetchAcademyData(currentAcademyId);
        } else {
          console.warn("⚠️ لم يتم العثور على أية أكاديمية مرتبطة بهذا الحساب");
          setLoadingData(false);
        }
      } catch (error) {
        console.error("🚨 Error loading user initial data:", error);
        setLoadingData(false);
      }
    }
    loadInitialData();
  }, [session, fetchAcademyData]);

  const enrichedHalaqas = useMemo(() => {
    if (!Array.isArray(halaqas)) return [];
    return halaqas.map(h => {
      const teacher = Array.isArray(teachers) ? teachers.find(t => t.id === h.teacher_id) : null;
      return {
        ...h,
        teacher_name: teacher ? teacher.name : (h.teacher_name || (isRtl ? 'غير معين' : 'Unassigned'))
      };
    });
  }, [halaqas, teachers, isRtl]);

  const preloadedDashboardData = useMemo(() => ({
    academyName: isPlatformAdmin ? (isRtl ? "إدارة المنصة العامة" : "Global Platform Admin") : (academyName || "الأكاديمية"),
    role: userRole || 'staff', 
    is_activated: true,
    stats: {
      students: Array.isArray(students) ? students.length : 0,
      pending: Array.isArray(students) ? students.filter(s => s.payment_status === 'unpaid' || s.payment_status === 'pending').length : 0,
      activeHalagas: Array.isArray(halaqas) ? halaqas.filter(h => !h.is_archived).length : 0, 
      completedExams: completedExamsCount || 0
    }
  }), [isPlatformAdmin, isRtl, academyName, userRole, students, halaqas, completedExamsCount]);

  const tabComponentRegistry = {
    'dashboard': <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={true} />,
    'realtime-audit': <RealtimeAudit session={session} userRole={userRole} />,
    'communication-hub': <CommunicationHub currentAcademyId={academyId} isRtl={isRtl} />,
    'reports': <Reports students={students} academyId={academyId} countryCode={countryCode} />,
    
    'students': <Students students={students} setStudents={setStudents} academyId={academyId} halaqas={enrichedHalaqas} />,
    'teachers': (
      <div style={{ padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', direction: isRtl ? 'rtl' : 'ltr' }}>
        <h2 style={{ color: '#38BDF8', marginBottom: '12px' }}>{isRtl ? '👨‍🏫 الكادر التعليمي والمقرئين' : '👨‍🏫 Faculty & Reciters'}</h2>
        <p style={{ color: '#9CA3AF' }}>{isRtl ? 'إجمالي المقرئين النشطين:' : 'Total active teachers:'} <strong style={{ color: '#FFF' }}>{teachers.length}</strong></p>
      </div>
    ),
    'halaqas': <ActiveHalaqas halaqas={enrichedHalaqas} teachers={teachers} students={students} isLoading={loadingData} error={null} isRtl={isRtl} isMobile={isMobile} />,
    'attendance': <Attendance students={students} academyId={academyId} timezone={timezone} halaqas={enrichedHalaqas} />,
    'exams': <Exams students={students} academyId={academyId} />,

    'guardian-portal': (
      <div style={{ padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
        <h2 style={{ color: '#38BDF8' }}>{isRtl ? '🏠 شبكة أسر الدارسين' : 'Guardian Portal'}</h2>
      </div>
    ),
    'gamification-streaks': (
      <div style={{ padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
        <h2 style={{ color: '#F59E0B' }}>{isRtl ? '🏆 الإنجاز والحوافز' : 'Gamification & Streaks'}</h2>
      </div>
    ),

    'payments': <Payments students={students} academyId={academyId} currency={currency} />,
    'asset-management': (
      <div style={{ padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
        <h2 style={{ color: '#10B981' }}>{isRtl ? '📁 المستندات والأصول' : 'Asset Management'}</h2>
      </div>
    ),
    'referrals': (
      <div style={{ padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
        <h2 style={{ color: '#3B82F6' }}>{isRtl ? '⚡ برنامج الإحالة والأرباح' : 'Affiliate & Rewards'}</h2>
      </div>
    ),
    'settings': <Settings academyId={academyId} session={session} currentCurrency={currency} currentTimezone={timezone} currentCountryCode={countryCode} />
  };

  const skeletonLoader = (
    <div style={{ padding: '24px', opacity: 0.5 }}>
      <div style={{ height: '35px', width: '25%', backgroundColor: '#334155', borderRadius: '6px', marginBottom: '20px' }}></div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ height: '110px', backgroundColor: '#1e293b', borderRadius: '10px' }}></div>
        <div style={{ height: '110px', backgroundColor: '#1e293b', borderRadius: '10px' }}></div>
        <div style={{ height: '110px', backgroundColor: '#1e293b', borderRadius: '10px' }}></div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#0f172a', color: '#fff', fontFamily: "'Cairo', sans-serif" }} dir={isRtl ? 'rtl' : 'ltr'}>
      <Sidebar 
        currentAcademyId={academyId}
        onSwitchAcademy={handleSwitchAcademy}
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
        accountActivated={true} 
        setShowEarlyUpgrade={setShowEarlyUpgrade} 
        numberFormatter={numberFormatter}
        timezone={timezone} 
        academyTime={academyTime}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: '100vh' }}>
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile} 
          isRtl={isRtl} 
          t={t} 
          currency={currency} 
          setCurrency={setCurrency} 
          countryCode={countryCode} 
          i18n={i18n} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          userData={{
            name: session?.user?.user_metadata?.full_name || session?.user?.email || "",
            avatar: session?.user?.user_metadata?.avatar_url || ""
          }}
        />

        <div style={{ padding: isMobile ? '16px' : '24px', flex: 1, overflowY: 'auto' }}>
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
