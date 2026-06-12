import { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { C } from './constants/colors';
import { supabase } from './lib/supabase';

// استيراد الـ Context للربط العالمي
import { AcademyProvider } from './context/AcademyContext';

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

  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null); // هذا هو المفتاح العالمي

  const isMobile = windowWidth < 768;

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
    } catch (err) { 
      console.error("Data Load Error:", err); 
    }
  }, []);

  // بقية الـ useEffect الخاصة بالأحداث والجلسة (لا تغيير فيها)
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    const handleResize = () => { setWindowWidth(window.innerWidth); setSidebarOpen(window.innerWidth > 768); };
    const handleHash = () => setIsRecovering(window.location.hash.includes('type=recovery'));
    window.addEventListener('resize', handleResize);
    window.addEventListener('hashchange', handleHash);
    
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

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('hashchange', handleHash);
      subscription.unsubscribe();
    };
  }, [loadAcademyData]);

  if (loading) return <SplashScreen />;

  if (!session) {
    if (isRecovering) return <UpdatePassword />;
    if (view === 'signup') return <SignUpPage onSwitchToLogin={() => setView('login')} />;
    if (view === 'forgot') return <ForgotPassword onBackToLogin={() => setView('login')} />;
    return <LoginPage onSwitchToSignUp={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgot')} />;
  }

  // التعديل الجوهري: تمرير الـ academyId و setAcademyId للـ Context
  return (
    <AcademyProvider value={{ academyId, setAcademyId }}>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: isMobile ? "column" : "row" }}>
        {/* ... (Sidebar Code) ... */}
        
        <main style={{ flex: 1, padding: 24, width: '100%', overflowY: 'auto' }}>
          {activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}
          {/* تم إزالة academyId هنا لأن المكونات تجلبها من الـ Context مباشرة */}
          {activeTab === "students" && <Students students={students} setStudents={setStudents} />}
          {activeTab === "attendance" && <Attendance students={students} />}
          {activeTab === "payments" && <Payments students={students} />}
        </main>
      </div>
    </AcademyProvider>
  );
}
