import { useState } from "react";
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBars, FaSignOutAlt, FaLanguage } from "react-icons/fa";

// استيراد المكونات
import Dashboard from './Dashboard.jsx';
import Students from './Students.jsx';
import Attendance from './Attendance.jsx';
import Payments from './Payments.jsx';

export default function MainApp({ session }) {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // دالة عرض آمنة: تضع كل مكون داخل حاوية بيضاء/رمادية لتجنب الشاشة السوداء
  const renderContent = () => {
    const commonStyle = { padding: '20px', minHeight: '80vh', background: 'transparent' };
    
    switch(activeTab) {
      case 'dashboard': return <div style={commonStyle}><Dashboard session={session} setActiveTab={setActiveTab} /></div>;
      case 'students': return <div style={commonStyle}><Students /></div>;
      case 'attendance': return <div style={commonStyle}><Attendance /></div>;
      case 'payments': return <div style={commonStyle}><Payments /></div>;
      default: return <div style={commonStyle}><Dashboard session={session} setActiveTab={setActiveTab} /></div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg || '#0f172a', color: C.text || '#ffffff' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: C.surface || '#1e293b', padding: '20px', borderRight: `1px solid ${C.border || '#334155'}`, display: window.innerWidth < 768 ? (sidebarOpen ? 'block' : 'none') : 'block', position: window.innerWidth < 768 ? 'fixed' : 'relative', height: '100vh', zIndex: 1000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h2 style={{ color: C.gold || '#fbbf24', margin: 0 }}>Smart Halaqa</h2>
          <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} style={{ background: 'none', border: 'none', color: C.gold || '#fbbf24', cursor: 'pointer' }}><FaLanguage size={24} /></button>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
            { id: 'students', label: 'Students', icon: <FaUsers /> },
            { id: 'attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
            { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              style={{ background: activeTab === item.id ? (C.gold || '#fbbf24') : 'transparent', color: activeTab === item.id ? '#000' : (C.text || '#ffffff'), padding: 15, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 15, fontWeight: 'bold' }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 'auto', background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%', position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <FaSignOutAlt /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: window.innerWidth < 768 ? 'block' : 'none', background: 'none', border: 'none', color: '#fff', fontSize: 24, marginBottom: 20 }}><FaBars /></button>
        {renderContent()}
      </main>
    </div>
  );
}
