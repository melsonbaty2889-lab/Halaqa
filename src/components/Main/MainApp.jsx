import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react"; 
import { useTranslation } from 'react-i18next';
import { RefreshCw, AlertTriangle } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { ROLES } from '@/constants/roles';
import { colors as C } from '@/theme/colors.js';
import { Skeleton, CardSkeleton } from '@/components/UI/Skeleton';

import Sidebar from './Sidebar/Sidebar';
import Header from '@/components/Header/Header'; 
import Dashboard from '@/components/Dashboard/Dashboard';
import SubscriptionPage from '@/components/SaaS/SubscriptionPage';
import AffiliateRewards from '@/components/SaaS/AffiliateRewards';

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

const Students = safeLazy(() => import('@/components/Student/StudentProfile.jsx'));
const Teachers = safeLazy(() => import('@/components/Teachers.jsx')); 
const Attendance = safeLazy(() => import('@/components/Attendance.jsx'));
const Exams = safeLazy(() => import('@/components/Exams.jsx')); 
const Payments = safeLazy(() => import('@/components/Payments/StudentPayments.jsx'));
const Settings = safeLazy(() => import('@/components/Settings.jsx')); 
const Reports = safeLazy(() => import('@/components/Reports/Reports.jsx'));
const ActiveHalaqas = safeLazy(() => import('@/components/ActiveHalaqas.jsx'));
const RealtimeAudit = safeLazy(() => import('@/components/RealtimeAudit.jsx'));
const CommunicationHub = safeLazy(() => import('@/components/CommunicationHub.jsx'));
const GamificationStreaks = safeLazy(() => import('@/components/Gamification/GamificationStreaks.jsx'));
const InteractiveQuran = safeLazy(() => import('@/components/Quran/InteractiveQuran.jsx'));

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Error Logged in Boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', background: C.dark.card, borderRadius: '16px', border: `1px solid ${C.error.border}`, color: C.error.light, margin: '20px', direction: 'rtl' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertTriangle size={22} />
            <h3 style={{ margin: 0, color: C.error.light, fontSize: '16px' }}>حدث خطأ أثناء عرض هذا القسم</h3>
          </div>
          <pre style={{ background: C.dark.main, padding: '12px', borderRadius: '8px', color: C.text.body, fontSize: '12px', overflowX: 'auto', direction: 'ltr' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }} 
            style={{ padding: '10px 18px', background: C.primary.gradient, color: C.dark.main, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} /> إعادة تحميل الصفحة
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
  const [isAcademyActive, setIsAcademyActive] = useState(true);
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);

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
        setIsAcademyActive(academyData.is_active ?? true);
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
        
        const { data: staff } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name, currency, timezone, country_code, is_active)')
          .eq('user_id', currentUserId)
          .maybeSingle();

        let currentAcademyId = staff?.academies?.id || staff?.academy_id;

        if (!currentAcademyId) {
          const { data: ownedAcademy } = await supabase
            .from('academies')
            .select('id')
            .eq('owner_id', currentUserId)
            .maybeSingle();
          currentAcademyId = ownedAcademy?.id;
        }

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
          setLoadingData(false);
        }
      } catch (error) {
        console.error("🚨 Error loading initial data:", error);
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
    academyName: isPlatformAdmin ? (isRtl ? "إدارة المنصة العامة" : "Global Platform Admin") : (academyName || (isRtl ? "الأكاديمية" : "Academy")),
    role: userRole || 'staff', 
    is_activated: isAcademyActive,
    stats: {
      students: Array.isArray(students) ? students.length : 0,
      pending: Array.isArray(students) ? students.filter(s => s?.payment_status === 'unpaid' || s?.payment_status === 'pending').length : 0,
      activeHalagas: Array.isArray(halaqas) ? halaqas.filter(h => !h?.is_archived).length : 0, 
      completedExams: completedExamsCount || 0
    }
  }), [isPlatformAdmin, isRtl, academyName, userRole, isAcademyActive, students, halaqas, completedExamsCount]);

  // دالة تحديث العملة فورياً
  const handleCurrencyUpdate = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={isAcademyActive} />;
      case 'interactive_quran':
        return <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'subscriptions':
      case 'upgrade':
        return <SubscriptionPage session={session} academyId={academyId} onBack={() => setActiveTab('dashboard')} />;
      case 'referrals':
      case 'affiliate-rewards':
        return <AffiliateRewards academyId={academyId} currency={currency} isRtl={isRtl} currentLang={currentLang} />;
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
            onNavigateToAttendance={(halaqaId) => {
              setSelectedHalaqaId(halaqaId);
              setActiveTab('attendance');
            }}
          />
        );
      case 'attendance':
        return <Attendance students={students} academyId={academyId} timezone={timezone} halaqas={enrichedHalaqas} selectedHalaqaId={selectedHalaqaId} />;
      case 'exams':
        return <Exams students={students} academyId={academyId} />;
      case 'gamification':
      case 'gamification-streaks':
      case 'badges':
      case 'achievements':
      case 'rewards':
      case 'streaks':
         return <GamificationStreaks academyId={academyId} isRtl={isRtl} />;
      case 'payments':
        return <Payments students={students} academyId={academyId} currency={currency} />;
      case 'settings':
        return (
          <Settings 
            academyId={academyId} 
            session={session} 
            currentCurrency={currency} 
            currentTimezone={timezone} 
            currentCountryCode={countryCode} 
            onCurrencyChange={handleCurrencyUpdate}
          />
        );
      default:
        return <Dashboard session={session} setActiveTab={setActiveTab} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={isAcademyActive} />;
    }
  };

  const skeletonLoader = (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Skeleton width="220px" height="32px" borderRadius="8px" />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <Skeleton width="100%" height="240px" borderRadius="16px" />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: C.dark.main, color: C.text.title, fontFamily: "'Cairo', system-ui, sans-serif" }} dir={isRtl ? 'rtl' : 'ltr'}>
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
          <ErrorBoundaryInner key={activeTab}>
            <Suspense fallback={skeletonLoader}>
              {loadingData ? skeletonLoader : renderActiveTabContent()}
            </Suspense>
          </ErrorBoundaryInner>
        </div>
      </div>
    </div>
  );
}
