import { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { C } from './constants/colors';
import { supabase } from './lib/supabase';
import { AcademyProvider } from './context/AcademyContext';

import SplashScreen from './components/SplashScreen.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import UpdatePassword from './components/UpdatePassword.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import StudentProfile from './components/StudentProfile.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';

export default function App() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [view, setView] = useState('login');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAcademyData = useCallback(async (userId) => {
    try {
      const { data: staffData } = await supabase
        .from('staff')
        .select('academy_id, academies(id, name)')
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
    } catch (err) { console.error("Data Load Error:", err); }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) loadAcademyData(session.user.id);
      setTimeout(() => setLoading(false), 1000);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s?.user?.id) loadAcademyData(s.user.id);
      else { setStudents([]); setAcademyId(null); }
    });
    return () => subscription.unsubscribe();
  }, [loadAcademyData]);

  if (loading) return <SplashScreen />;

  if (!session) {
    if (window.location.hash.includes('type=recovery')) return <UpdatePassword />;
    if (view === 'signup') return <SignUpPage onSwitchToLogin={() => setView('login')} />;
    if (view === 'forgot') return <ForgotPassword onBackToLogin={() => setView('login')} />;
    return <LoginPage onSwitchToSignUp={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgot')} />;
  }

  return (
    <AcademyProvider value={{ academyId, setAcademyId }}>
      <BrowserRouter>
        <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: isMobile ? "column" : "row" }}>
          
          {/* القائمة الجانبية */}
          {(!isMobile || sidebarOpen) && (
            <aside style={{ width: isMobile ? "100%" : 260, background: C.surface, padding: 20, display: 'flex', flexDirection: 'column', zIndex: 1000, height: isMobile ? 'auto' : '100vh' }}>
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', alignSelf: 'flex-start', marginBottom: '10px' }}>✕</button>
              )}
              <h2 style={{ color: C.gold, marginBottom: 30 }}>{t('menu')}</h2>
              <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["dashboard", "students", "attendance", "payments"].map(tab => (
                  <button key={tab} onClick={() => { setActiveTab(tab); if(isMobile) setSidebarOpen(false); }} 
                    style={{ background: activeTab === tab ? C.gold : "transparent", color: activeTab === tab ? "#000" : C.text, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'start' }}>
                    {t(tab)}
                  </button>
                ))}
              </nav>
              <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 'auto', color: 'red', background: 'transparent', border: 'none', cursor: 'pointer' }}>{t('logout')}</button>
            </aside>
          )}
          
          <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            {/* زر الهمبرغر للموبايل */}
            {isMobile && !sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: C.gold, padding: "10px 15px", borderRadius: "8px", border: 'none', marginBottom: "20px", fontWeight: 'bold', cursor: 'pointer' }}>
                ≡ {t('menu')}
              </button>
            )}

            <Routes>
              <Route path="/" element={
                <>
                  {activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}
                  {activeTab === "students" && <Students students={students} setStudents={setStudents} />}
                  {activeTab === "attendance" && <Attendance students={students} />}
                  {activeTab === "payments" && <Payments students={students} />}
                </>
              } />
              <Route path="/student/:id" element={<StudentProfile />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AcademyProvider>
  );
}
