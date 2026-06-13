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

  // دالة عرض قسرية: تضع المكون داخل طبقة تحميه من أي خلفية سوداء خارجية
  const renderContent = () => {
    return (
      <div style={{ 
        background: '#ffffff !important', 
        color: '#000000 !important', 
        minHeight: '100vh', 
        width: '100%',
        padding: '20px' 
      }}>
        {activeTab === 'dashboard' && <Dashboard session={session} />}
        {activeTab === 'students' && <Students />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'payments' && <Payments />}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* الشريط الجانبي */}
      <aside style={{ width: 260, background: '#ffffff', borderRight: '1px solid #ddd', padding: '20px' }}>
        <h2 style={{ color: '#000' }}>Smart Halaqa</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button onClick={() => setActiveTab('students')}>Students</button>
          <button onClick={() => setActiveTab('attendance')}>Attendance</button>
          <button onClick={() => setActiveTab('payments')}>Payments</button>
        </nav>
        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '20px' }}>Sign Out</button>
      </aside>

      {/* المحتوى الرئيسي */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  );
}
