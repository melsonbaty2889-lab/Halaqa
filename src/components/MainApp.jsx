/* src/components/MainApp.jsx */
import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react"; 
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { ROLES } from '../constants/roles';
import Sidebar from './Sidebar.jsx';
import Header from './header/Header';
import Dashboard from './Dashboard.jsx'; 
import SubscriptionPage from './SubscriptionPage';

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
const Students = safeLazy(() => import('./Student/StudentProfile.jsx'))
const Teachers = safeLazy(() => import('./Teachers.jsx')); 
const Attendance = safeLazy(() => import('./Attendance.jsx'));
const Exams = safeLazy(() => import('./Exams.jsx')); 
const Payments = safeLazy(() => import('./Payments.jsx'));
const Settings = safeLazy(() => import('./Settings.jsx')); 
const Reports = safeLazy(() => import('./Reports.jsx'));
const ActiveHalaqas = safeLazy(() => import('./ActiveHalaqas.jsx'));
const RealtimeAudit = safeLazy(() => import('./RealtimeAudit.jsx'));
const CommunicationHub = safeLazy(() => import('./CommunicationHub.jsx'));
const GamificationStreaks = safeLazy(() => import('./GamificationStreaks.jsx'));

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Error Logged in Boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', background: '#1e293b', borderRadius: '12px', color: '#EF4444', margin: '20px', direction: 'ltr', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '8px', color: '#F87171' }}>⚠️ Component Render Error</h3>
          <pre style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', color: '#f87171', fontSize: '0.85rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </pre>
          {this.state.errorInfo && (
            <details style={{ marginTop: '10px', color: '#94a3b8', fontSize: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', color: '#FBBF24' }}>Stack Details</summary>
              <pre style={{ marginTop: '5px' }}>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }} 
            style={{ padding: '8px 16px', background: '#FBBF24', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '12px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MainApp({ session, userRole, trialDaysLeft, isTrial = true, isActivated, setShowEarlyUpgrade }) {
  const { t, i18n } = useTranslation(); 
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;
  const currentLang = i18n?.language || 'ar';
  const lastFetchedUserId = useRef(null);

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('smart_halaqa_tab') || 'dashboard');
  
  // 🚀 حالة التوجيه لحلقة محددة بين الشاشات
  const [selectedHalaqaId, setSelectedHalaqaId] = useState(null);

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
  const [isAcademyActive, setIsAcademyActive] = useState(true); // 🔐 حالة تفعيل الأكاديمية الحقيقية
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);

  // 🛡️ تحديد أدمن المنصة العامة بدقة
  const isPlatformAdmin = userRole === ROLES.SUPER_ADMIN || userRole === 'super_admin';
  
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
      const { data: academyData } = await supabase
        .from('academies')
        .select('id, name, currency, timezone, country_code, is_active')
        .eq('id', targetAcademyId)
        .maybeSingle();

      if (academyData) {
        setAcademyName(academyData.name || "");
        setIsAcademyActive(academyData.is_active ?? true); // 👈 تحديث حالة التفعيل الفعلية للأكاديمية
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
        
        // 1. محاولة جلب أكاديمية الكادر / المعلم
        const { data: staff } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name, currency, timezone, country_code, is_active)')
          .eq('user_id', currentUserId)
          .maybeSingle();

        let currentAcademyId = staff?.academies?.id || staff?.academy_id;

        // 2. Fallback: إذا لم يعثر عليه بالـ staff، جرب كـ Owner في الأكاديمية
        if (!currentAcademyId) {
          const { data: ownedAcademy } = await supabase
            .from('academies')
            .select('id')
            .eq('owner_id', currentUserId)
            .maybeSingle();
          currentAcademyId = ownedAcademy?.id;
        }

        // 3. Fallback: جرب جدول البروفايل
        if (!currentAcademyId) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('academy_id')
            .eq('id', currentUserId)
            .maybeSingle();
          currentAcademyId = profileData?.academy_id;
        }

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
    is_activated: isAcademyActive,
    stats: {
      students: Array.isArray(students) ? students.length : 0,
      pending: Array.isArray(students) ? students.filter(s => s?.payment_status === 'unpaid' || s?.payment_status === 'pending').length : 0,
      activeHalagas: Array.isArray(halaqas) ? halaqas.filter(h => !h?.is_archived).length : 0, 
      completedExams: completedExamsCount || 0
    }
  }), [isPlatformAdmin, isRtl, academyName, userRole, isAcademyActive, students, halaqas, completedExamsCount]);

  // 🎯 بناء التبويب النشط
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={isAcademyActive} />;
      case 'subscriptions':
      case 'upgrade':
        return (
          <SubscriptionPage 
            session={session} 
            academyId={academyId} 
            onBack={() => setActiveTab('dashboard')} 
          />
        );
      case 'realtime-audit':
        return <RealtimeAudit session={session} userRole={userRole} />;
      case 'communication-hub':
        return <CommunicationHub currentAcademyId={academyId} isRtl={isRtl} />;
      case 'reports':
        return <Reports students={students} academyId={academyId} countryCode={countryCode} />;
      case 'students':
        return <Students students={students} setStudents={setStudents} academyId={academyId} halaqas={enrichedHalaqas} />;
      case 'teachers':
        return <Teachers teachers={teachers} setTeachers={setTeachers} academyId={academyId} halaqas={enrichedHalaqas} />;
      case 'halaqas':
        return (
          <ActiveHalaqas 
            halaqas={enrichedHalaqas} 
            teachers={teachers} 
            students={students} 
            isLoading={loadingData} 
            error={null} 
            isRtl={isRtl} 
            isMobile={isMobile} 
            // 🚀 ربط التنقل الذكي لغرفة التسميع
            onNavigateToAttendance={(halaqaId) => {
              setSelectedHalaqaId(halaqaId);
              setActiveTab('attendance');
            }}
          />
        );
      case 'attendance':
        return (
          <Attendance 
            students={students} 
            academyId={academyId} 
            timezone={timezone} 
            halaqas={enrichedHalaqas} 
            // 🚀 تمرير رقم الحلقة المحددة لتثبيتها في الشاشة
            selectedHalaqaId={selectedHalaqaId}
          />
        );
      case 'exams':
        return <Exams students={students} academyId={academyId} />;
      case 'guardian-portal':
        return (
          <div style={{ padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h2 style={{ color: '#38BDF8' }}>{isRtl ? '🏠 شبكة أسر الدارسين' : 'Guardian Portal'}</h2>
          </div>
        );
      case 'gamification-streaks':
        return <GamificationStreaks academyId={academyId} isRtl={isRtl} />;
      case 'payments':
        return <Payments students={students} academyId={academyId} currency={currency} />;
      case 'asset-management':
        return (
          <div style={{ padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h2 style={{ color: '#10B981' }}>{isRtl ? '📁 المستندات والأصول' : 'Asset Management'}</h2>
          </div>
        );
      case 'referrals':
        return (
          <div style={{ padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h2 style={{ color: '#3B82F6' }}>{isRtl ? '⚡ برنامج الإحالة والأرباح' : 'Affiliate & Rewards'}</h2>
          </div>
        );
      case 'settings':
        return <Settings academyId={academyId} session={session} currentCurrency={currency} currentTimezone={timezone} currentCountryCode={countryCode} />;
      default:
        return <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={isAcademyActive} />;
    }
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

  // إذا كانت البيانات قيد التحميل لأول مرة
  if (loadingData && activeTab === 'dashboard' && students.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0C1520', 
        color: '#C9A84C', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: "'Cairo', system-ui, sans-serif"
      }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#0f172a', color: '#fff', fontFamily: "'Cairo', system-ui, sans-serif" }} dir={isRtl ? 'rtl' : 'ltr'}>
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
        accountActivated={isAcademyActive} 
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
              {loadingData ? skeletonLoader : renderActiveTabContent()}
            </Suspense>
          </ErrorBoundaryInner>
        </div>
      </div>
    </div>
  );
}
