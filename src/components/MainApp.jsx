import { useState } from "react";
import { supabase } from '../lib/supabase';
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

  // دالة الحماية: تغلف كل مكون بحاوية ذات خلفية فاتحة لمنع الشاشة السوداء
  const renderContent = () => {
    const safeContainer = (component) => (
      <div style={{ background: '#ffffff', minHeight: '80vh', padding: '20px', color: '#1e293b', borderRadius: '10px' }}>
        {component}
      </div>
    );

    switch(activeTab) {
      case 'dashboard': return safeContainer(<Dashboard session={session} />);
      case 'students': return safeContainer(<Students />);
      case 'attendance': return safeContainer(<Attendance />);
      case 'payments': return safeContainer(<Payments />);
      default: return safeContainer(<Dashboard session={session} />);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', color: '#1e293b', fontFamily: 'sans-serif' }}>
      {/* الشريط الجانبي */}
      <aside style={{ width: 260, background: '#ffffff', padding: '20px', borderRight: '1px solid #e2e8f0', display: window.innerWidth < 768 ? (sidebarOpen ? 'block' : 'none') : 'block', position: window.innerWidth < 768 ? 'fixed' : 'relative', height: '100vh', zIndex: 1000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h2 style={{ color: '#0f172a', margin: 0 }}>Smart Halaqa</h2>
          <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FaLanguage size={24} /></button>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
            { id: 'students', label: 'Students', icon: <FaUsers /> },
            { id: 'attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
            { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              style={{ background: activeTab === item.id ? '#3b82f6' : 'transparent', color: activeTab === item.id ? '#ffffff' : '#475569', padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 'bold' }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 'auto', background: '#fee2e2', border: 'none', color: '#b91c1c', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%', position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <FaSignOutAlt /> Sign Out
        </button>
      </aside>

      {/* المحتوى الرئيسي */}
      <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: window.innerWidth < 768 ? 'block' : 'none', background: 'none', border: 'none', fontSize: 24, marginBottom: 20 }}><FaBars /></button>
        {renderContent()}
      </main>
    </div>
  );
}
