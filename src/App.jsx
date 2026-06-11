import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { C } from './constants/colors';
import { supabase } from './lib/supabase';

// استيراد المكونات
import SplashScreen from './components/SplashScreen.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import UpdatePassword from './components/UpdatePassword.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';

export default function App() {
  const { t, i18n } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [view, setView] = useState('login');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isRecovering, setIsRecovering] = useState(window.location.hash.includes('type=recovery'));

  const isMobile = windowWidth < 768;

  useEffect(() => {
    // تحديث اتجاه الموقع عند تغيير اللغة
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setSidebarOpen(width > 768);
    };
    const handleHash = () => setIsRecovering(window.location.hash.includes('type=recovery'));

    window.addEventListener('resize', handleResize);
    window.addEventListener('hashchange', handleHash);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setTimeout(() => setLoading(false), 2000); // 2s للـ Splash
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('hashchange', handleHash);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <SplashScreen />;

  if (!session) {
    if (isRecovering) return <UpdatePassword />;
    if (view === 'signup') return <SignUpPage onSwitchToLogin={() => setView('login')} />;
    if (view === 'forgot') return <ForgotPassword onBackToLogin={() => setView('login')} />;
    return <LoginPage onSwitchToSignUp={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgot')} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {isMobile && (
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 15, background: C.surface, border: 'none', color: C.gold, fontSize: '20px', cursor: 'pointer' }}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {(!isMobile || sidebarOpen) && (
        <aside style={{ width: isMobile ? "100%" : 260, background: C.surface, padding: 20, display: 'flex', flexDirection: 'column', position: isMobile ? 'absolute' : 'relative', height: '100vh', zIndex: 1000, boxShadow: isMobile ? '0 0 10px rgba(0,0,0,0.5)' : 'none' }}>
          <h2 style={{ color: C.gold, marginBottom: 30 }}>{t('menu')}</h2>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["dashboard", "students", "attendance", "payments"].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); if(isMobile) setSidebarOpen(false); }} 
                style={{ background: activeTab === tab ? C.gold : "transparent", color: activeTab === tab ? "#000" : C.text, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'start' }}>
                {t(tab)}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
            <button 
              onClick={() => {
                const newLang = i18n.language === 'ar' ? 'en' : 'ar';
                i18n.changeLanguage(newLang);
              }}
              style={{ width: '100%', padding: 10, background: 'transparent', color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 8, cursor: 'pointer' }}
            >
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          <button onClick={() => supabase.auth.signOut()} style={{ color: 'red', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            {t('logout')}
          </button>
        </aside>
      )}

      <main style={{ flex: 1, padding: 24, width: '100%' }}>
  {activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}
  
  {/* تأكد من تمرير البيانات هنا، وإلا ستكون القوائم فارغة! */}
  {activeTab === "students" && (
    <Students students={students} setStudents={setStudents} academyId={academyId} />
  )}
  {activeTab === "attendance" && (
    <Attendance students={students} academyId={academyId} />
  )}
  {activeTab === "payments" && (
    <Payments students={students} academyId={academyId} />
  )}
</main>

    </div>
  );
}
