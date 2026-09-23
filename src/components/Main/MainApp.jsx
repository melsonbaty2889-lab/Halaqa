import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react"; 
import { useTranslation } from 'react-i18next';
import { RefreshCw, AlertOctagon, MessageCircle, LogOut } from 'lucide-react';
import useIsMobile from '@/hooks/useIsMobile';
import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext'; 
import { ROLES } from '@/constants/roles';
import { UI } from '@/theme/styles.js';
import { PageSkeleton } from '@/components/UI/Skeleton';
import Sidebar from '@/components/Sidebar/Sidebar';
import BottomNav from '@/components/Sidebar/BottomNav';
import Header from '@/components/Header/Header'; 
import Dashboard from '@/components/Dashboard/Dashboard';
import SubscriptionPage from '@/components/SaaS/SubscriptionPage';
import AffiliateRewards from '@/components/SaaS/AffiliateRewards';

// خلفية موحدة شفافة تضمن ظهور التوهج الزمردي والشبكة بشكل واضح
const OriginalEmeraldBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
    {/* طبقة تدرج شبه شفافة تسمح بمرور التوهج وشبكة النقاط */}
    <div className="absolute inset-0 bg-gradient-to-br from-dark-bg/80 via-dark-card/60 to-dark-bg/90 backdrop-blur-[2px]" />
    
    {/* دوائر التوهج الزمردي الدائرية */}
    <div className="absolute -top-[10%] -right-[10%] w-[650px] h-[650px] bg-brandEmerald-bg/25 rounded-full blur-[140px] animate-pulse" />
    <div className="absolute top-[25%] -left-[10%] w-[550px] h-[550px] bg-brandEmerald-bg/20 rounded-full blur-[130px]" />
    <div className="absolute -bottom-[10%] right-[15%] w-[650px] h-[650px] bg-brandEmerald-bg/15 rounded-full blur-[160px]" />
  </div>
);

const formatLocalizedText = (val, lang = 'ar') => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val[lang] || val.ar || val.en || Object.values(val)[0] || '';
  }
  return String(val);
};

const BlockedView = ({ academy, onLogout, isRtl = true }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const academyName = formatLocalizedText(academy?.name, currentLang) || t('common.academy', 'الأكاديمية');
  const blockReason = formatLocalizedText(
    academy?.blocked_reason, 
    currentLang
  ) || t('blocked_view.default_reason', 'تم تعليق حساب الأكاديمية مؤقتاً من قبل إدارة المنصة بسبب مراجعة الاشتراك أو الحساب.');

  const handleSupportContact = () => {
    const supportPhone = import.meta.env.VITE_SUPPORT_WHATSAPP || "201000000000";
    const msgTemplate = t('blocked_view.whatsapp_msg', 'السلام عليكم، أنا مالك أكاديمية ({{name}})، تم تعليق الحساب وأود الاستفسار والتفعيل.');
    const msg = encodeURIComponent(msgTemplate.replace('{{name}}', academyName));
    window.open(`https://wa.me/${supportPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10 bg-dark-bg" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-dark-card border border-appError/30 rounded-2xl p-6 text-center shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-appError/10 text-appError">
          <AlertOctagon size={36} />
        </div>
        <div>
          <h2 className={UI.title}>
            {t('blocked_view.title', 'تم تعليق حساب الأكاديمية')}
          </h2>
          <p className="text-sm font-semibold text-appError mt-1">{academyName}</p>
        </div>
        <div className="bg-dark-bg border border-appBorder-card p-4 rounded-xl text-xs leading-relaxed text-start text-appText-sub">
          {blockReason}
        </div>
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleSupportContact}
            className="w-full border-0 py-3 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors bg-brandEmerald text-white hover:bg-brandEmerald-dark"
          >
            <MessageCircle size={18} />
            {t('blocked_view.whatsapp_button', 'التواصل مع الإدارة عبر الواتساب')}
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className={UI.btnSecondary}
            >
              <LogOut size={16} />
              {t('common.logout', 'تسجيل الخروج')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const safeLazy = (importFn) => {
  return lazy(() =>
    importFn().catch((error) => {
      console.error("🚨 Lazy Load Error:", error);
      return { 
        default: () => (
          <div className="p-4 text-appError text-center font-semibold">
            تعذر تحميل هذا القسم، يرجى إعادة تنشيط الصفحة.
          </div>
        )
      };
    })
  );
};

// الاستدعاء الموزع للمكونات
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

const CommunicationsAndReportsHub = ({ academyId, isRtl, students, countryCode }) => {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('communications');
  return (
    <div className="space-y-6 font-cairo">
      <div className="flex gap-2 p-1 rounded-xl border border-appBorder-card w-fit backdrop-blur-md bg-dark-card/60">
        <button
          type="button"
          onClick={() => setActiveSubTab('communications')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'communications' 
              ? 'bg-brandEmerald text-white shadow-lg' 
              : 'text-appText-sub hover:text-appText-main'
          }`}
        >
          {t('hub.communications', 'مركز التواصل والإشعارات')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'reports' 
              ? 'bg-brandEmerald text-white shadow-lg' 
              : 'text-appText-sub hover:text-appText-main'
          }`}
        >
          {t('hub.reports', 'التقارير الذكية')}
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

export default function MainApp({ session, userRole, trialDaysLeft, isTrial = true, isActivated, setShowEarlyUpgrade, onLogout }) {
  const { t, i18n } = useTranslation(); 
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;
  const currentLang = i18n?.language || 'ar';

  const { academy, academiesList, setAcademy } = useAcademy();
  const isMobile = useIsMobile(1024);

  const getDefaultTabForRole = useCallback((role) => {
    const r = (role || 'admin').toString().toLowerCase().trim();
    switch (r) {
      case 'super_admin':
      case 'admin':
        return 'dashboard';
      case 'teacher':
        return 'halaqas';
      case 'student':
        return 'interactive_quran';
      case 'parent':
        return 'parents';
      default:
        return 'dashboard';
    }
  }, []);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('smart_halaqa_tab');
      if (savedTab) return savedTab;
    }
    return getDefaultTabForRole(userRole);
  });

  const [selectedHalaqaId, setSelectedHalaqaId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_halaqa_tab', activeTab);
    }
  }, [activeTab]); 

  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [halaqas, setHalaqas] = useState([]);
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);

  const isPlatformAdmin = userRole === ROLES.SUPER_ADMIN || userRole === 'super_admin';
  const [currency, setCurrency] = useState(academy?.currency || (isPlatformAdmin ? "EGP" : "USD"));         
  const [timezone, setTimezone] = useState(academy?.timezone || (isPlatformAdmin ? "Africa/Cairo" : "UTC"));         
  const [countryCode, setCountryCode] = useState(academy?.country_code || (isPlatformAdmin ? "EG" : "US"));   
  const [academyTime, setAcademyTime] = useState("");

  const academyId = academy?.id || null;
  const isAcademyActive = academy?.is_active ?? true;

  const fetchedAcademyIdRef = useRef(null);
  const isFetchingRef = useRef(false);

  const numberFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(currentLang, { useGrouping: true });
    } catch (e) {
      return new Intl.NumberFormat('ar', { useGrouping: true });
    }
  }, [currentLang]);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const updateAcademyTime = useCallback(() => {
    try {
      const formatter = new Intl.DateTimeFormat(currentLang, {
        timeZone: timezone || 'UTC', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true
      });
      setAcademyTime(formatter.format(new Date()));
    } catch (e) {
      setAcademyTime(new Date().toLocaleTimeString());
    }
  }, [timezone, currentLang]);

  useEffect(() => {
    updateAcademyTime();
    const interval = setInterval(updateAcademyTime, 10000);
    return () => clearInterval(interval);
  }, [updateAcademyTime]);

  const handleTimezoneUpdate = useCallback((newTimezone) => {
    if (newTimezone) {
      setTimezone(newTimezone);
    }
  }, []);

  const fetchSubResources = useCallback(async (targetAcademyId, forceRefresh = false) => {
    if (!targetAcademyId) {
      setLoadingData(false);
      return;
    }
    if (!forceRefresh) {
      if (fetchedAcademyIdRef.current === targetAcademyId || isFetchingRef.current) {
        return;
      }
    }
    isFetchingRef.current = true;
    setLoadingData(true);
    try {
      const { data: rels } = await supabase
        .from('academy_teachers')
        .select('teacher_id')
        .eq('academy_id', targetAcademyId);

      const teacherIds = rels?.map(r => r.teacher_id).filter(Boolean) || [];

      const [studentsRes, examsRes, teachersRes, halaqasRes] = await Promise.allSettled([
        supabase.from('students').select('*').eq('academy_id', targetAcademyId),
        supabase.from('exams').select('*', { count: 'exact', head: true }).eq('academy_id', targetAcademyId),
        teacherIds.length > 0 
          ? supabase.from('teachers').select('*').in('id', teacherIds)
          : Promise.resolve({ data: [] }),
        supabase.from('halaqas').select('*').eq('academy_id', targetAcademyId)
      ]);

      setStudents(studentsRes.status === 'fulfilled' ? studentsRes.value.data || [] : []);
      setCompletedExamsCount(examsRes.status === 'fulfilled' ? examsRes.value.count ?? 0 : 0);
      setTeachers(teachersRes.status === 'fulfilled' ? teachersRes.value.data || [] : []);
      setHalaqas(halaqasRes.status === 'fulfilled' ? halaqasRes.value.data || [] : []);
      fetchedAcademyIdRef.current = targetAcademyId;
    } catch (error) {
      console.error("Error fetching sub-resources:", error);
    } finally {
      isFetchingRef.current = false;
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (academy) {
      if (academy.currency) setCurrency(academy.currency);
      if (academy.timezone) setTimezone(academy.timezone);
      if (academy.country_code) setCountryCode(academy.country_code);
    }
    if (academyId) {
      fetchSubResources(academyId);
    } else {
      setLoadingData(false);
    }
  }, [academyId, academy?.currency, academy?.timezone, academy?.country_code, fetchSubResources]);

  const handleSwitchAcademy = useCallback((newAcademyId) => {
    if (!newAcademyId || newAcademyId === academyId) return;
    const target = academiesList.find(a => a.id === newAcademyId);
    if (target) {
      fetchedAcademyIdRef.current = null;
      setAcademy(target);
    }
  }, [academyId, academiesList, setAcademy]);

  const handleDeleteStudent = useCallback(async (studentId) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);
      if (error) throw error;
      setStudents(prev => prev.filter(s => s.id !== studentId));
      return { success: true };
    } catch (error) {
      console.error("🚨 Error deleting student:", error);
      return { success: false, error: error.message };
    }
  }, []);

  if (!loadingData && !isPlatformAdmin && isAcademyActive === false) {
    return (
      <BlockedView 
        academy={academy} 
        onLogout={onLogout} 
        isRtl={isRtl} 
      />
    );
  }

  const enrichedHalaqas = useMemo(() => {
    if (!Array.isArray(halaqas)) return [];
    const unassignedLabel = t('halaqa.unassigned', 'غير معين');
    return halaqas.map(h => {
      const teacher = Array.isArray(teachers) ? teachers.find(t => t.id === h.teacher_id) : null;
      return {
        ...h,
        teacher_name: teacher ? formatLocalizedText(teacher.name, currentLang) : (h.teacher_name || unassignedLabel)
      };
    });
  }, [halaqas, teachers, currentLang, t]);

  const preloadedDashboardData = useMemo(() => {
    const rawAcademyName = academy?.name;
    const resolvedName = formatLocalizedText(rawAcademyName, currentLang) || t('common.academy', 'الأكاديمية');
    const globalAdminLabel = t('dashboard.global_admin', 'إدارة المنصة العامة');
    return {
      academyName: isPlatformAdmin 
        ? globalAdminLabel 
        : resolvedName,
      role: userRole || 'staff', 
      is_activated: isAcademyActive,
      stats: {
        students: Array.isArray(students) ? students.length : 0,
        pending: Array.isArray(students) ? students.filter(s => s?.payment_status === 'unpaid' || s?.payment_status === 'pending').length : 0,
        activeHalagas: Array.isArray(halaqas) ? halaqas.filter(h => !h?.is_archived).length : 0, 
        completedExams: completedExamsCount || 0
      }
    };
  }, [isPlatformAdmin, academy?.name, currentLang, userRole, isAcademyActive, students, halaqas, completedExamsCount, t]);

  const renderActiveTabContent = () => {
    const role = (userRole || 'admin').toString().toLowerCase().trim();
    const isAdmin = role === 'admin' || role === 'super_admin';
    const isTeacher = role === 'teacher' || isAdmin;
    const isParent = role === 'parent' || isAdmin;

    switch (activeTab) {
      case 'interactive_quran':
        return <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'gamification':
      case 'gamification-streaks':
      case 'achievements':
      case 'rewards':
        return <GamificationStreaks academyId={academyId} isRtl={isRtl} initialTab="leaderboard" />;
      case 'streaks':
        return <GamificationStreaks academyId={academyId} isRtl={isRtl} initialTab="streaks" />;
      case 'badges':
        return <GamificationStreaks academyId={academyId} isRtl={isRtl} initialTab="badges" />;
      case 'dashboard':
        return isAdmin 
          ? <Dashboard session={session} setActiveTab={handleTabChange} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={isAcademyActive} />
          : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'subscriptions':
      case 'upgrade':
        return isAdmin 
          ? <SubscriptionPage session={session} academyId={academyId} onBack={() => handleTabChange('dashboard')} />
          : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'payments':
      case 'finance':
        return isAdmin 
          ? <Payments students={students} academyId={academyId} currency={currency} />
          : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'settings':
        return isAdmin ? (
          <Settings 
            academyId={academyId} 
            session={session} 
            currentCurrency={currency} 
            currentTimezone={timezone} 
            currentCountryCode={countryCode} 
            onCurrencyChange={(c) => setCurrency(c)}
            onTimezoneChange={handleTimezoneUpdate}
          />
        ) : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'realtime-audit':
      case 'audit_logs':
        return isAdmin ? <RealtimeAudit session={session} userRole={userRole} /> : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'teachers':
        return isAdmin ? (
          <Teachers 
            teachers={teachers} 
            setTeachers={setTeachers} 
            academyId={academyId} 
            halaqas={enrichedHalaqas}
            onRefresh={() => fetchSubResources(academyId, true)}
            t={t}
            isRtl={isRtl}
          />
        ) : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'halaqas':
      case 'active-halaqas':
      case 'classes':
        return isTeacher ? (
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
              handleTabChange('attendance');
            }}
          />
        ) : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'attendance':
        return isTeacher ? <Attendance students={students} academyId={academyId} timezone={timezone} halaqas={enrichedHalaqas} selectedHalaqaId={selectedHalaqaId} /> : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'exams':
        return isTeacher ? <Exams students={students} academyId={academyId} /> : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'curriculum':
      case 'curricula':
      case 'curricula-islamic-studies':
      case 'curricula_islamic_studies':
        return isTeacher ? (
          <Curriculum 
            academyId={academyId} 
            students={students} 
            halaqas={halaqas} 
            isRtl={isRtl} 
          />
        ) : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'students':
      case 'student-profile':
      case 'students-management':
        return isTeacher ? (
          <Students 
            students={students} 
            setStudents={setStudents} 
            academyId={academyId} 
            halaqas={enrichedHalaqas} 
            onDeleteStudent={handleDeleteStudent}
          />
        ) : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'parents':
      case 'parents-guardians':
      case 'parents-management':
        return isParent ? (
          <Parents 
            academyId={academyId} 
            students={students} 
            isRtl={isRtl} 
          />
        ) : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
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
      case 'communications-reports':
      case 'notifications_reports':
      case 'reports':
        return <CommunicationsAndReportsHub academyId={academyId} isRtl={isRtl} students={students} countryCode={countryCode} />;
      case 'referrals':
      case 'affiliate-rewards':
        return <AffiliateRewards academyId={academyId} currency={currency} isRtl={isRtl} currentLang={currentLang} />;
      default:
        return isAdmin 
          ? <Dashboard session={session} setActiveTab={handleTabChange} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={isAcademyActive} />
          : <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
    }
  };

  return (
    <div 
      className="relative flex min-h-screen w-full overflow-x-hidden select-none bg-transparent text-appText-main font-cairo"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <OriginalEmeraldBackground />
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}
      <Sidebar 
        currentAcademyId={academyId}
        academy={academy}
        onSwitchAcademy={handleSwitchAcademy}
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
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
      <div className="flex flex-col flex-1 min-w-0 min-h-screen w-full relative z-10 overflow-x-hidden">
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
          setActiveTab={handleTabChange}
          userData={{
            name: session?.user?.user_metadata?.full_name || session?.user?.email || "",
            avatar: session?.user?.user_metadata?.avatar_url || ""
          }}
        />
        <main 
          className={`flex-1 w-full box-border overflow-y-auto ${
            isMobile ? 'p-3 pb-20' : 'p-6 pb-6'
          }`}
        >
          <Suspense fallback={<PageSkeleton />}>
            {loadingData ? <PageSkeleton /> : renderActiveTabContent()}
          </Suspense>
        </main>
      </div>
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        setSidebarOpen={setSidebarOpen} 
        isRtl={isRtl} 
      />
    </div>
  );
}
