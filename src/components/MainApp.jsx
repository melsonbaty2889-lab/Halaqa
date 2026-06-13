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

  // تنسيقات ثابتة لا تعتمد على ملف C
  const styles = {
    container: { display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#1e293b' },
    aside: { width: 260, background: '#ffffff', padding: '20px', borderRight: '1px solid #e2e8f0', height: '100vh' },
    main: { flex: 1, padding: 40, background: '#f8fafc' },
    button: { padding: 10, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard session={session} />;
      case 'students': return <Students />;
      case 'attendance': return <Attendance />;
      case 'payments': return <Payments />;
      default: return <Dashboard session={session} />;
    }
  };

  return (
    <div style={styles.container}>
      <aside style={styles.aside}>
        <h2>Smart Halaqa</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button onClick={() => setActiveTab('students')}>Students</button>
          <button onClick={() => setActiveTab('attendance')}>Attendance</button>
          <button onClick={() => setActiveTab('payments')}>Payments</button>
        </nav>
        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 20 }}>Sign Out</button>
      </aside>
      
      <main style={styles.main}>
        {renderContent()}
      </main>
    </div>
  );
}
