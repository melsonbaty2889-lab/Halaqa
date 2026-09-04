import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react"; 
import { useTranslation } from 'react-i18next';
import { RefreshCw, AlertTriangle, AlertOctagon, MessageCircle, LogOut } from 'lucide-react';
import useIsMobile from '@/hooks/useIsMobile';

import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext'; 
import { ROLES } from '@/constants/roles';
import colorsImport from '@/theme/colors.js';

import Sidebar from '@/components/Sidebar/Sidebar';
import BottomNav from '@/components/Sidebar/BottomNav';
import Header from '@/components/Header/Header'; 
import Dashboard from '@/components/Dashboard/Dashboard';
import SubscriptionPage from '@/components/SaaS/SubscriptionPage';
import AffiliateRewards from '@/components/SaaS/AffiliateRewards';

const C = colorsImport?.colors || colorsImport || {
  dark: { main: '#0f172a', card: '#1e293b', border: '#334155' },
  text: { title: '#f8fafc', body: '#cbd5e1' },
  error: { light: '#fca5a5', border: '#f87171' },
  primary: { gradient: 'linear-gradient(to right, #f59e0b, #d97706)' }
};

// مكون الخلفية الخضراء بالنجوم الجمالية
const EmeraldStarryBackground = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.7 + 0.3,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 2}s`
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* التوهج الأخضر الزمردي العلوي */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-600/10 rounded-full blur-[130px]" />

      {/* النجوم المتلألئة */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-emerald-300 animate-pulse"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
            opacity: star.opacity,
            animationDuration: star.duration,
            animationDelay: star.delay,
            boxShadow: `0 0 ${star.size * 2}px rgba(52, 211, 153, 0.8)`
          }}
        />
      ))}
    </div>
  );
};

const formatLocalizedText = (val, lang = 'ar') => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val[lang] || val.ar || val.en || Object.values(val)[0] || '';
  }
  return String(val);
};

const BlockedView = ({ academy, onLogout, isRtl = true }) => {
  const academyName = formatLocalizedText(academy?.name) || (isRtl ? "الأكاديمية" : "Academy");
  const blockReason = formatLocalizedText(
    academy?.blocked_reason, 
    isRtl ? 'ar' : 'en'
  ) || (isRtl 
    ? "تم تعليق حساب الأكاديمية مؤقتاً من قبل إدارة المنصة بسبب مراجعة الاشتراك أو الحساب." 
    : "Your academy account has been suspended by administration.");

  const handleSupportContact = () => {
    const supportPhone = import.meta.env.VITE_SUPPORT_WHATSAPP || "201000000000";
    const msg = encodeURIComponent(`السلام عليكم، أنا مالك أكاديمية (${academyName})، تم تعليق الحساب وأود الاستفسار والتفعيل.`);
    window.open(`https://wa.me/${supportPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center shadow-2xl space-y-5">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <AlertOctagon size={36} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isRtl ? 'تم تعليق حساب الأكاديمية' : 'Academy Account Suspended'}
          </h2>
          <p className="text-sm font-semibold text-rose-400">{academyName}</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed text-right">
          {blockReason}
        </div>
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleSupportContact}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 py-3 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle size={18} />
            {isRtl ? 'التواصل مع الإدارة عبر الواتساب' : 'Contact Support on WhatsApp'}
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border-0 py-2.5 rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              {isRtl ? 'تسجيل الخروج' : 'Log Out'}
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
      return { default: () => <div className="p-4 text-rose-400 text-center">تعذر تحميل هذا القسم، يرجى إعادة تنشيط الصفحة.</div> };
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

const CommunicationsAndReportsHub = ({ academyId, isRtl, students, countryCode }) => {
  const [activeSubTab, setActiveSubTab] = useState('communications');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-800/60 rounded-xl border border-slate-700/50 w-fit backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveSubTab('communications')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'communications' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {isRtl ? 'مركز التواصل والإشعارات' : 'Communication Center'}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'reports' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {isRtl ? 'التقارير الذكية' : 'Reports'}
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
        <div style={{ padding: '24px', background: C?.dark?.card || '#1e293b', borderRadius: '16px', border: `1px solid ${C?.error?.border || '#f87171'}`, color: C?.error?.light || '#fca5a5', margin: '20px', direction: 'rtl' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertTriangle size={22} />
            <h3 style={{ margin: 0, color: C?.error?.light || '#fca5a5', fontSize: '16px' }}>حدث خطأ أثناء عرض هذا القسم</h3>
          </div>
          <pre style={{ background: C?.dark?.main || '#0f172a', padding: '12px', borderRadius: '8px', color: C?.text?.body || '#cbd5e1', fontSize: '12px', overflowX: 'auto', direction: 'ltr' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }} 
            style={{ padding: '10px 18px', background: C?.primary?.gradient || '#d97706', color: C?.dark?.main || '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} /> إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MainApp({ session, userRole, trialDaysLeft, isTrial = true, isActivated, setShowEarlyUpgrade, onLogout }) {
  const { t, i18n } = useTranslation(); 
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;
  const currentLang = i18n?.language || 'ar';
  const lastFetchedUserId = useRef(null);

  let academyContext = null;
  try {
    academyContext = useAcademy();
  } catch (e) {
    console.warn("AcademyContext unavailable:", e);
  }
  const academy = academyContext?.academy || null;

  const isMobile = useIsMobile(1024);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smart_halaqa_tab') || 'dashboard';
    }
    return 'dashboard';
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
  const [academyId, setAcademyId] = useState(null);
  const [academyName, setAcademyName] = useState(""); 
  const [isAcademyActive, setIsAcademyActive] = useState(true);
  const [rawAcademyData, setRawAcademyData] = useState(null);
  const [completedExamsCount, setCompletedExamsCount] = useState(0); 
  const [loadingData, setLoadingData] = useState(true);

  const isPlatformAdmin = userRole === ROLES.SUPER_ADMIN || userRole === 'super_admin';
  
  const [currency, setCurrency] = useState(isPlatformAdmin ? "EGP" : "USD");         
  const [timezone, setTimezone] = useState(isPlatformAdmin ? "Africa/Cairo" : "UTC");         
  const [countryCode, setCountryCode] = useState(isPlatformAdmin ? "EG" : "US");   
  const [academyTime, setAcademyTime] = useState("");

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
        .select('id, name, currency, timezone, country_code, is_active, blocked_reason')
        .eq('id', targetAcademyId)
        .maybeSingle();

      if (academyData) {
        setRawAcademyData(academyData);
        const rawName = academyData.name || academy?.name || "";
        setAcademyName(formatLocalizedText(rawName, currentLang));
        
        setIsAcademyActive(academyData.is_active ?? true);
        if (academyData.currency) setCurrency(academyData.currency);
        if (academyData.timezone) setTimezone(academyData.timezone);
        if (academyData.country_code) setCountryCode(academyData.country_code);
      }

      const [studentsRes, examsRes, teachersRes, halaqasRes] = await Promise.allSettled([
        supabase.from('students').select('*').eq('academy_id', targetAcademyId),
        supabase.from('exams').select('*', { count: 'exact', head: true }).eq('academy_id', targetAcademyId),
        supabase.from('teachers').select('*').eq('academy_id', targetAcademyId),
        supabase.from('halaqas').select('*').eq('academy_id', targetAcademyId)
      ]);

      setStudents(studentsRes.status === 'fulfilled' ? studentsRes.value.data || [] : []);
      setCompletedExamsCount(examsRes.status === 'fulfilled' ? examsRes.value.count ?? 0 : 0);
      setTeachers(teachersRes.status === 'fulfilled' ? teachersRes.value.data || [] : []);
      setHalaqas(halaqasRes.status === 'fulfilled' ? halaqasRes.value.data || [] : []);
    } catch (error) {
      console.error("Error fetching academy data:", error);
    } finally {
      setLoadingData(false);
    }
  }, [academy?.name, currentLang]);

  const handleSwitchAcademy = useCallback((newAcademyId) => {
    if (!newAcademyId || newAcademyId === academyId) return;
    setAcademyId(newAcademyId);
    fetchAcademyData(newAcademyId);
  }, [academyId, fetchAcademyData]);

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
      console.error("🚨 خطأ أثناء حذف الطالب من قاعدة البيانات:", error);
      return { success: false, error: error.message };
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingData(false);
    }, 4000);

    const currentUserId = session?.user?.id;
    if (!currentUserId) {
      setLoadingData(false);
      clearTimeout(timer);
      return;
    }
    if (lastFetchedUserId.current === currentUserId) {
      clearTimeout(timer);
      return;
    }
    lastFetchedUserId.current = currentUserId;

    async function loadInitialData() {
      try {
        setLoadingData(true);
        let currentAcademyId = academy?.id;

        if (!currentAcademyId) {
          const { data: staff } = await supabase
            .from('staff')
            .select('academy_id, academies(id, name, currency, timezone, country_code, is_active, blocked_reason)')
            .eq('user_id', currentUserId)
            .maybeSingle();

          currentAcademyId = staff?.academies?.id || staff?.academy_id;
        }

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
      } finally {
        clearTimeout(timer);
      }
    }
    loadInitialData();

    return () => clearTimeout(timer);
  }, [session, fetchAcademyData, academy?.id]);

  if (!loadingData && !isPlatformAdmin && isAcademyActive === false) {
    return (
      <BlockedView 
        academy={rawAcademyData || academy} 
        onLogout={onLogout} 
        isRtl={isRtl} 
      />
    );
  }

  const enrichedHalaqas = useMemo(() => {
    if (!Array.isArray(halaqas)) return [];
    return halaqas.map(h => {
      const teacher = Array.isArray(teachers) ? teachers.find(t => t.id === h.teacher_id) : null;
      return {
        ...h,
        teacher_name: teacher ? formatLocalizedText(teacher.name, currentLang) : (h.teacher_name || (isRtl ? 'غير معين' : 'Unassigned'))
      };
    });
  }, [halaqas, teachers, isRtl, currentLang]);

  const preloadedDashboardData = useMemo(() => {
    const rawAcademyName = academyName || academy?.name;
    const resolvedName = formatLocalizedText(rawAcademyName, currentLang) || (isRtl ? "الأكاديمية" : "Academy");

    return {
      academyName: isPlatformAdmin 
        ? (isRtl ? "إدارة المنصة العامة" : "Global Platform Admin") 
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
  }, [isPlatformAdmin, isRtl, academyName, academy?.name, currentLang, userRole, isAcademyActive, students, halaqas, completedExamsCount]);

  const handleCurrencyUpdate = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard session={session} setActiveTab={handleTabChange} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={isAcademyActive} />;
      case 'interactive_quran':
        return <InteractiveQuran isRtl={isRtl} countryCode={countryCode} />;
      case 'subscriptions':
      case 'upgrade':
        return <SubscriptionPage session={session} academyId={academyId} onBack={() => handleTabChange('dashboard')} />;
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
            onDeleteStudent={handleDeleteStudent}
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
              handleTabChange('attendance');
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
        return <Dashboard session={session} setActiveTab={handleTabChange} preloadedDashboardData={preloadedDashboardData} currency={currency} isActivated={isAcademyActive} />;
    }
  };

  return (
    <div 
      className="relative flex min-h-screen w-full bg-slate-950 text-slate-100 overflow-x-hidden"
      style={{ 
        fontFamily: "'Cairo', system-ui, sans-serif"
      }} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* خلفية النجوم الخضراء الجمالية */}
      <EmeraldStarryBackground />

      {/* خلفية معتمة للموبايل عند فتح القائمة */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Sidebar القائمة الجانبية */}
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

      {/* المحتوى الرئيسي وهيدر التطبيق */}
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
          className="flex-1 w-full box-border overflow-y-auto"
          style={{ 
            padding: isMobile ? '12px' : '24px', 
            paddingBottom: isMobile ? '80px' : '24px'
          }}
        >
          <ErrorBoundaryInner key={activeTab}>
            <Suspense fallback={null}>
              {renderActiveTabContent()}
            </Suspense>
          </ErrorBoundaryInner>
        </main>
      </div>

      {/* الشريط السفلي للموبايل */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        setSidebarOpen={setSidebarOpen} 
        isRtl={isRtl} 
      />
    </div>
  );
}
