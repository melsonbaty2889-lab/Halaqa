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

  // دالة العرض بـ "عزل كامل"
  const renderContent = () => {
    // نستخدم خلفية محددة لكل صفحة لمنع الشاشة السوداء
    const pageStyle = {
      backgroundColor: '#111C2A', // لون الهوية الأساسي
      minHeight: '100vh',
      padding: '20px',
      color: C.text,
      width: '100%'
    };

    return (
      <div style={pageStyle}>
        {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} />}
        {activeTab === 'students' && <Students students={[]} setStudents={() => {}} />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'payments' && <Payments />}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: C.bg }}>
      {/* القائمة الجانبية */}
      <aside style={{ 
        width: 260, 
        background: C.surface, 
        borderRight: `1px solid ${C.border}`,
        display: sidebarOpen ? 'block' : (window.innerWidth < 768 ? 'none' : 'block'),
        position: window.innerWidth < 768 ? 'fixed' : 'relative',
        zIndex: 1000,
        height: '100vh',
        padding: '20px'
      }}>
        <h2 style={{ color: C.gold, marginBottom: '30px' }}>Smart Halaqa</h2>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
            { id: 'students', label: 'Students', icon: <FaUsers /> },
            { id: 'attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
            { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              style={{ 
                background: activeTab === item.id ? C.gold : 'transparent', 
                color: activeTab === item.id ? '#000' : C.text, 
                padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'right' 
              }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '20px', background: 'transparent', border: '1px solid ' + C.danger, color: C.danger, padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
          <FaSignOutAlt /> Sign Out
        </button>
      </aside>

      {/* المحتوى */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '10px', background: 'none', border: 'none', color: C.text }}>
          <FaBars size={24} />
        </button>
        {renderContent()}
      </main>
    </div>
  );
}
