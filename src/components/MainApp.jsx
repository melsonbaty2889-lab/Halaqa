import { useState } from "react";
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors'; // نستخدم ألوانك الأصلية
import { useTranslation } from 'react-i18next';
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBars, FaSignOutAlt, FaLanguage } from "react-icons/fa";

import Dashboard from './Dashboard.jsx';
import Students from './Students.jsx';
import Attendance from './Attendance.jsx';
import Payments from './Payments.jsx';

export default function MainApp({ session }) {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // دالة عرض تحافظ على هوية المشروع الغامقة
  const renderContent = () => {
    // نغلف كل صفحة بحاوية تأخذ لون الـ bg الخاص بهويتك
    const containerStyle = { 
      background: C.bg, 
      minHeight: '100vh', 
      padding: '20px', 
      color: C.text 
    };

    switch(activeTab) {
      case 'dashboard': return <div style={containerStyle}><Dashboard session={session} setActiveTab={setActiveTab} /></div>;
      case 'students': return <div style={containerStyle}><Students /></div>;
      case 'attendance': return <div style={containerStyle}><Attendance /></div>;
      case 'payments': return <div style={containerStyle}><Payments /></div>;
      default: return <div style={containerStyle}><Dashboard session={session} setActiveTab={setActiveTab} /></div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>
      {/* Sidebar - بنفس ألوان هويتك */}
      <aside style={{ width: 260, background: C.surface, padding: '20px', borderRight: `1px solid ${C.border}`, display: window.innerWidth < 768 ? (sidebarOpen ? 'block' : 'none') : 'block', position: window.innerWidth < 768 ? 'fixed' : 'relative', height: '100vh', zIndex: 1000 }}>
        <h2 style={{ color: C.gold }}>Smart Halaqa</h2>
        {/* ... (بقية القائمة كما كانت) ... */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
            { id: 'students', label: 'Students', icon: <FaUsers /> },
            { id: 'attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
            { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              style={{ background: activeTab === item.id ? C.gold : 'transparent', color: activeTab === item.id ? '#000' : C.text, padding: 15, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 15 }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  );
}
