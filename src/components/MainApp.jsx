import { useState } from "react";
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { AcademyProvider } from '../context/AcademyContext';
import { useTranslation } from 'react-i18next';
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBars, FaSignOutAlt, FaLanguage } from "react-icons/fa";

// استيراد المكونات الموجودة لديك بالفعل
import Dashboard from './Dashboard.jsx';
import Students from './Students.jsx';
import Attendance from './Attendance.jsx';
import Payments from './Payments.jsx';

export default function MainApp({ session }) {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

          <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 'auto', background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%', position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <FaSignOutAlt /> Sign Out
          </button>
        </aside>

        <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: window.innerWidth < 768 ? 'block' : 'none', background: 'none', border: 'none', color: '#fff', fontSize: 24, marginBottom: 20 }}><FaBars /></button>
          {renderContent()}
        </main>
      </div>
    </AcademyProvider>
  );
}
