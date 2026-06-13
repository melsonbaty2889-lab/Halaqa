import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { C } from './constants/colors';
import { supabase } from './lib/supabase';
import { AcademyProvider } from './context/AcademyContext';
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBars } from "react-icons/fa";

import SplashScreen from './components/SplashScreen.jsx';
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // جلب الجلسة الابتدائية
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // الاستماع لأي تغيير في حالة الدخول
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (loading) return <SplashScreen />;

  if (!session) return <LoginPage />;

  return (
    <AcademyProvider value={{ academyId: null }}>
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>
          <aside style={{ 
            width: 260, background: C.surface, padding: '30px 20px', borderRight: `1px solid ${C.border}`,
            display: isMobile ? (sidebarOpen ? 'block' : 'none') : 'block',
            position: isMobile ? 'fixed' : 'relative', height: '100vh', zIndex: 1000
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

          <main style={{ flex: 1, padding: isMobile ? '20px' : '40px', overflowY: 'auto' }}>
            {isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', marginBottom: 20 }}><FaBars /></button>}
            <Routes>
              <Route path="/" element={
                 activeTab === "dashboard" ? <Dashboard session={session} setActiveTab={setActiveTab} /> :
                 activeTab === "students" ? <Students students={students} setStudents={setStudents} /> :
                 activeTab === "attendance" ? <Attendance students={students} /> : <Payments students={students} />
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AcademyProvider>
  );
}
