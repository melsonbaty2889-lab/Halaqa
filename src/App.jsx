import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { C } from './constants/colors';
import { AcademyProvider } from './context/AcademyContext';

// استيراد المكونات
import SplashScreen from './components/SplashScreen.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBars } from "react-icons/fa";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [view, setView] = useState('login'); // للتحكم في صفحات Auth
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // 1. منطق الـ Splash Screen: نضمن بقاءها لمدة 2 ثانية على الأقل
    const timer = setTimeout(() => setLoading(false), 2000);

    // 2. التحقق من الجلسة
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 3. الاستماع لأي تغيير في حالة الدخول
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => { clearTimeout(timer); subscription.unsubscribe(); };
  }, []);

  // ترتيب العرض (هذا هو المفتاح)
  if (loading) return <SplashScreen />;

  if (!session) {
    if (view === 'signup') return <SignUpPage onSwitchToLogin={() => setView('login')} />;
    if (view === 'forgot') return <ForgotPassword onSwitchToLogin={() => setView('login')} />;
    return <LoginPage onSwitchToSignUp={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgot')} />;
  }

  return (
    <AcademyProvider value={{ academyId: null }}>
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>
          <aside style={{ 
            width: 260, background: C.surface, borderRight: `1px solid ${C.border}`,
            display: window.innerWidth < 768 ? (sidebarOpen ? 'block' : 'none') : 'block',
            position: window.innerWidth < 768 ? 'fixed' : 'relative', height: '100vh', zIndex: 1000, padding: '20px'
          }}>
            <h2 style={{ color: C.gold, marginBottom: 40 }}>Smart Halaqa</h2>
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
          </aside>

          <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: window.innerWidth < 768 ? 'block' : 'none', background: 'none', border: 'none', color: '#fff', fontSize: 24, marginBottom: 20 }}><FaBars /></button>
            <Routes>
              <Route path="/" element={
                 activeTab === "dashboard" ? <Dashboard session={session} setActiveTab={setActiveTab} /> :
                 activeTab === "students" ? <Students /> :
                 activeTab === "attendance" ? <Attendance /> : <Payments />
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AcademyProvider>
  );
}
