import { useState, useEffect } from "react";
import { supabase } from './lib/supabase';
import { C } from './constants/colors';
import { AcademyProvider } from './context/AcademyContext';
import { useTranslation } from 'react-i18next';

// استيراد المكونات
import SplashScreen from './components/SplashScreen.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBars, FaSignOutAlt, FaLanguage } from "react-icons/fa";

export default function App() {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true); // حالة التحميل الأساسية
  const [session, setSession] = useState(null);
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // 1. التحقق من الجلسة فوراً عند تحميل التطبيق
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // ننهي التحميل بمجرد معرفة حالة الجلسة
    });

    // 2. الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // منع ظهور الشاشة السوداء بضمان وجود المكونات دائماً
  if (loading) return <SplashScreen />;

  if (!session) {
    if (view === 'signup') return <SignUpPage onSwitchToLogin={() => setView('login')} />;
    if (view === 'forgot') return <ForgotPassword onSwitchToLogin={() => setView('login')} />;
    return <LoginPage onSwitchToSignUp={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgot')} />;
  }

  return (
    <AcademyProvider value={{ academyId: null }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>
        <aside style={{ width: 260, background: C.surface, padding: '20px', borderRight: `1px solid ${C.border}`, display: window.innerWidth < 768 ? (sidebarOpen ? 'block' : 'none') : 'block', position: window.innerWidth < 768 ? 'fixed' : 'relative', height: '100vh', zIndex: 1000 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <h2 style={{ color: C.gold, margin: 0 }}>Smart Halaqa</h2>
            <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer' }}><FaLanguage size={24} /></button>
          </div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
              { id: 'students', label: 'Students', icon: <FaUsers /> },
              { id: 'attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
              { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
            ].map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                style={{ background: activeTab === item.id ? C.gold : 'transparent', color: activeTab === item.id ? '#000' : C.text, padding: 15, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 15, fontWeight: 'bold' }}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 'auto', background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <FaSignOutAlt /> Sign Out
          </button>
        </aside>

        <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: window.innerWidth < 768 ? 'block' : 'none', background: 'none', border: 'none', color: '#fff', fontSize: 24, marginBottom: 20 }}><FaBars /></button>
          
          {/* العرض المباشر للمكونات بدون تعقيد */}
          {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} />}
          {activeTab === 'students' && <Students />}
          {activeTab === 'attendance' && <Attendance />}
          {activeTab === 'payments' && <Payments />}
        </main>
      </div>
    </AcademyProvider>
  );
}
