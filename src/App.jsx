import { useState, useEffect } from "react";
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
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });
    return () => { clearTimeout(timer); subscription.unsubscribe(); };
  }, []);

  if (loading) return <SplashScreen />;

  if (!session) {
    if (view === 'signup') return <SignUpPage onSwitchToLogin={() => setView('login')} />;
    if (view === 'forgot') return <ForgotPassword onSwitchToLogin={() => setView('login')} />;
    return <LoginPage onSwitchToSignUp={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgot')} />;
  }

  // دالة اختيار المكون (بدل استخدام Routes المسببة للشاشة السوداء)
  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard session={session} setActiveTab={setActiveTab} />;
      case 'students': return <Students />;
      case 'attendance': return <Attendance />;
      case 'payments': return <Payments />;
      default: return <Dashboard session={session} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AcademyProvider value={{ academyId: null }}>
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
          {renderContent()}
        </main>
      </div>
    </AcademyProvider>
  );
}
