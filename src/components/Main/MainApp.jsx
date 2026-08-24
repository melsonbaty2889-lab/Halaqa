import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react"; 
import { useTranslation } from 'react-i18next';
import { 
  RefreshCw, 
  AlertTriangle, 
  MessageSquare, 
  BarChart2, 
  FolderOpen 
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { ROLES } from '@/constants/roles';

import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header'; 
import Dashboard from '@/components/Dashboard/Dashboard';
import SubscriptionPage from '@/components/SaaS/SubscriptionPage';
import AffiliateRewards from '@/components/SaaS/AffiliateRewards';
import { Skeleton, CardSkeleton } from '@/components/UI/Skeleton';

// ----------------------------------------------------
// التحميل المتأخر الآمن للمكونات (Safe Lazy Loading)
// ----------------------------------------------------
const safeLazy = (importFn) => {
  return lazy(() =>
    importFn().catch((error) => {
      const errorMsg = error?.message || error?.toString() || '';
      if (/Failed to fetch dynamically imported module|chunk load error|loading chunk/i.test(errorMsg)) {
        console.warn("Module update detected, reloading application...");
        window.location.reload();
        return new Promise(() => {}); 
      }
      throw error;
    })
  );
};

const Students = safeLazy(() => import('@/components/Student/StudentsList.jsx'));
const Teachers = safeLazy(() => import('@/components/Teachers/Teachers.jsx')); 
const Attendance = safeLazy(() => import('@/components/Attendance/Attendance.jsx'));
const Exams = safeLazy(() => import('@/components/Exams/Exams.jsx')); 
const Payments = safeLazy(() => import('@/components/Payments/StudentPayments.jsx'));
const Settings = safeLazy(() => import('@/components/Settings/Settings.jsx')); 
const CommunicationHub = safeLazy(() => import('@/components/Notifications/CommunicationHub.jsx'));
const Reports = safeLazy(() => import('@/components/Reports/Reports.jsx'));
const ActiveHalaqas = safeLazy(() => import('@/components/Halaqat/ActiveHalaqas.jsx'));
const RealtimeAudit = safeLazy(() => import('@/components/Logs/RealtimeAudit.jsx'));
const Parents = safeLazy(() => import('@/components/Parents/ParentsManagement.jsx'));
const GamificationStreaks = safeLazy(() => import('@/components/Gamification/GamificationStreaks.jsx'));
const InteractiveQuran = safeLazy(() => import('@/components/Quran/InteractiveQuran.jsx'));
const Curriculum = safeLazy(() => import('@/components/Curriculum/CurriculumManagement.jsx'));
const StudentDocuments = safeLazy(() => import('@/components/Student/StudentDocuments.jsx'));

// ----------------------------------------------------
// مكوّن مركز التواصل والتقارير الموحد
// ----------------------------------------------------
const CommunicationsAndReportsHub = ({ academyId, isRtl, students, countryCode }) => {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('communications');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-800/60 rounded-xl border border-slate-700/50 w-fit">
        <button
          onClick={() => setActiveSubTab('communications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'communications' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('communications.hub_title', 'مركز التواصل والإشعارات')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'reports' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>{t('reports.smart_reports', 'التقارير الذكية')}</span>
        </button>
      </div>

      {activeSubTab === 'communications' ? (
        <CommunicationHub currentAcademyId={academyId} isRtl={isRtl} />
      ) : (
        <Reports students={students} academyId={academyId} countryCode={countryCode} />
      )}
    </div>
  );
};

// ----------------------------------------------------
// حدود معالجة الأخطاء الموحدة
// ----------------------------------------------------
class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("System Error Boundary Captured:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-800/90 rounded-2xl border border-rose-500/30 text-rose-300 m-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <h3 className="m-0 text-lg font-semibold text-rose-200">
              حدث خطأ أثناء تحميل هذا القسم
            </h3>
          </div>
          <pre className="bg-slate-950 p-3 rounded-lg text-slate-400 text-xs overflow-x-auto dir-ltr">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }} 
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ----------------------------------------------------
// المكون الرئيسي للتطبيق MainApp
// ----------------------------------------------------
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
        console.error("Error loading initial data:", error);
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
        teacher_name: teacher ? teacher.name : (h.teacher_name || t('common.unassigned', 'غير معين'))
      };
    });
  }, [halaqas, teachers, t]);

  const preloadedDashboardData = useMemo(() => ({
    academyName: isPlatformAdmin 
      ? t('common.platform_admin', 'إدارة المنصة العامة') 
      : (academyName || t('common.academy', 'الأكاديمية')),
    role: userRole || 'staff', 
    is_activated: isAcademyActive,
    stats: {
      students: Array.isArray(students) ? students.length : 0,
      pending: Array.isArray(students) ? students.filter(s => s?.payment_status === 'unpaid' || s?.payment_status === 'pending').length : 0,
      activeHalagas: Array.isArray(halaqas) ? halaqas.filter(h => !h?.is_archived).length : 0, 
      completedExams: completedExamsCount || 0
    }
  }), [isPlatformAdmin, academyName, userRole, isAcademyActive, students, halaqas, completedExamsCount, t]);

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
      case 'audit_logs':
        return <RealtimeAudit session={session} userRole={userRole} />;
      case 'communications-reports':
      case 'notifications_reports':
      case 'reports':
        return <CommunicationsAndReportsHub academyId={academyId} isRtl={isRtl} students={students} countryCode={countryCode} />;
      case 'students':
      case 'student-profile':
      case 'students-management':
        return (
          <Students 
            students={students} 
            setStudents={setStudents} 
            academyId={academyId} 
            halaqas={enrichedHalaqas} 
          />
        );
      case 'parents':
      case 'parents-guardians':
      case 'parents-management':
        return (
          <Parents 
            academyId={academyId} 
            students={students} 
            isRtl={isRtl} 
          />
        );
      case 'teachers':
        return (
          <Teachers 
            teachers={teachers} 
            setTeachers={setTeachers} 
            academyId={academyId} 
            halaqas={enrichedHalaqas}
            onRefresh={() => fetchAcademyData(academyId)}
            t={t}
            isRtl={isRtl}
          />
        );
      case 'halaqas':
      case 'active-halaqas':
      case 'classes':
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
      case 'curriculum':
      case 'curricula':
      case 'curricula-islamic-studies':
      case 'curricula_islamic_studies':
        return (
          <Curriculum 
            academyId={academyId} 
            students={students} 
            halaqas={halaqas} 
            isRtl={isRtl} 
          />
        );
      case 'documents':
      case 'student-documents':
      case 'documents-files':
        return (
          <StudentDocuments 
            academyId={academyId} 
            students={students} 
            teachers={teachers} 
            isRtl={isRtl} 
          />
        );
      case 'attendance':
        return <Attendance students={students} academyId={academyId} timezone={timezone} halaqas={enrichedHalaqas} selectedHalaqaId={selectedHalaqaId} />;
      case 'exams':
        return <Exams students={students} academyId={academyId} />;
      case 'gamification':
      case 'gamification-streaks':
      case 'achievements':
      case 'rewards':
        return <GamificationStreaks academyId={academyId} isRtl={isRtl} initialTab="leaderboard" />;
      case 'streaks':
        return <GamificationStreaks academyId={academyId} isRtl={isRtl} initialTab="streaks" />;
      case 'badges':
        return <GamificationStreaks academyId={academyId} isRtl={isRtl} initialTab="badges" />;
      case 'payments':
      case 'finance':
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
    <div className="p-6 flex flex-col gap-5">
      <Skeleton width="220px" height="32px" borderRadius="8px" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <Skeleton width="100%" height="240px" borderRadius="16px" />
    </div>
  );

  return (
    <div 
      className="flex min-h-screen w-full bg-slate-950 text-slate-100 font-sans" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
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

      <div className="flex flex-col flex-1 min-w-0 min-h-screen bg-slate-900">
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

        <main className="p-4 md:p-6 flex-1 overflow-y-auto">
          <ErrorBoundaryInner key={activeTab}>
            <Suspense fallback={skeletonLoader}>
              {loadingData ? skeletonLoader : renderActiveTabContent()}
            </Suspense>
          </ErrorBoundaryInner>
        </main>
      </div>
    </div>
  );
}
