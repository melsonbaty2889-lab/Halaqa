import { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { C } from './constants/colors';
import { supabase } from './lib/supabase';

// استيراد مباشر للمكونات (أكثر استقراراً)
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';

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

  if (!session) {
    return showSignUp ? <SignUpPage onSwitchToLogin={() => setShowSignUp(false)} /> : <LoginPage onSwitchToSignUp={() => setShowSignUp(true)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: isMobile ? "column" : "row", direction: i18n.language === 'ar' ? "rtl" : "ltr" }}>
      {isMobile && (
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 15, background: C.surface, border: 'none', color: C.gold, cursor: 'pointer' }}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {(!isMobile || sidebarOpen) && (
        <aside style={{ width: isMobile ? "100%" : 260, background: C.surface, padding: 20 }}>
          <h2 style={{ color: C.gold }}>الحلقة الذكية</h2>
          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["dashboard", "students", "attendance", "payments"].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); if(isMobile) setSidebarOpen(false); }} 
                style={{ background: activeTab === tab ? C.gold : "transparent", color: activeTab === tab ? "#000" : C.text, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                {t(tab)}
              </button>
            ))}
          </nav>
          <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 20, color: 'red', background: 'transparent', border: 'none' }}>{t('logout')}</button>
        </aside>
      )}

      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}
        {activeTab === "students" && <Students students={students} setStudents={setStudents} academyId={academyId} />}
        {activeTab === "attendance" && <Attendance students={students} academyId={academyId} />}
        {activeTab === "payments" && <Payments students={students} academyId={academyId} />}
      </main>
    </div>
  );
}
