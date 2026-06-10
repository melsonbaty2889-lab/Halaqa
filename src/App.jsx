import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useTranslation } from 'react-i18next';
import { C } from './constants/colors';
import { supabase } from './lib/supabase';
import { Card } from "./components/UI";

const LoginPage = lazy(() => import('./components/LoginPage.jsx'));
const SignUpPage = lazy(() => import('./components/SignUpPage.jsx'));
const CreateAcademy = lazy(() => import('./components/CreateAcademy.jsx'));
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const Students = lazy(() => import('./components/Students.jsx'));
const Attendance = lazy(() => import('./components/Attendance.jsx'));
const Payments = lazy(() => import('./components/Payments.jsx'));

const SECURITY_CONFIG = { allowedHostSuffix: "vercel.app" };

export default function App() {
  const { t, i18n } = useTranslation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSignUp, setShowSignUp] = useState(false);
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng') || 'ar';
    i18n.changeLanguage(savedLang);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadAcademyData = useCallback(async (userId) => {
    try {
      const { data: staffData } = await supabase
        .from('staff')
        .select('academy_id, name, academies(id, name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (staffData?.academies) {
        setAcademyId(staffData.academies.id);
        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .eq('academy_id', staffData.academies.id);
        setStudents(studentsData || []);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (session?.user?.id) loadAcademyData(session.user.id); }, [session, loadAcademyData]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20%', color: C.gold }}>{t('loading')}</div>;

  if (!session) return (
    <Suspense fallback={<div>Loading...</div>}>
      {showSignUp ? <SignUpPage onSwitchToLogin={() => setShowSignUp(false)} /> : <LoginPage onSwitchToSignUp={() => setShowSignUp(true)} />}
    </Suspense>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: isMobile ? "column" : "row", direction: i18n.language === 'ar' ? "rtl" : "ltr" }}>
      
      {isMobile && (
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 15, background: C.surface, border: 'none', color: C.gold, cursor: 'pointer', textAlign: 'center' }}>
          {sidebarOpen ? '✕ إغلاق القائمة' : '☰ القائمة'}
        </button>
      )}

      {(!isMobile || sidebarOpen) && (
        <aside style={{ width: isMobile ? "100%" : 260, background: C.surface, padding: 20 }}>
          <h2 style={{ color: C.gold, marginBottom: 20 }}>الحلقة الذكية</h2>
          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["dashboard", "students", "attendance", "payments"].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); if(isMobile) setSidebarOpen(false); }} 
                style={{ 
                  background: activeTab === tab ? C.gold : "transparent", 
                  color: activeTab === tab ? "#000" : C.text,
                  padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: i18n.language === 'ar' ? 'right' : 'left' 
                }}>
                {t(tab)}
              </button>
            ))}
          </nav>
          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <button onClick={toggleLanguage} style={{ width: '100%', padding: 10, marginBottom: 10 }}>{i18n.language === 'ar' ? 'English' : 'العربية'}</button>
            <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', color: 'red', border: 'none', background: 'transparent' }}>{t('logout')}</button>
          </div>
        </aside>
      )}

      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        <Suspense fallback={<div style={{ textAlign: 'center' }}>جاري التحميل...</div>}>
          {activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}
          {activeTab === "students" && <Students students={students} setStudents={setStudents} academyId={academyId} />}
          {activeTab === "attendance" && <Attendance students={students} academyId={academyId} />}
          {activeTab === "payments" && <Payments students={students} academyId={academyId} />}
        </Suspense>
      </main>
    </div>
  );
}
