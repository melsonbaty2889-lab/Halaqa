import { useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBars, FaSignOutAlt } from "react-icons/fa";

import Dashboard from './Dashboard.jsx';
import Students from './Students.jsx';
import Attendance from './Attendance.jsx';
import Payments from './Payments.jsx';
import { useAcademy } from "../context/AcademyContext";

export default function MainApp({ session }) {
  const { t } = useTranslation();
  const { academyId } = useAcademy();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // بيانات أساسية سنمررها للمكونات
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (!academyId) return;
      const { data } = await supabase.from('students').select('*').eq('academy_id', academyId);
      if (data) setStudents(data);
    }
    loadData();
  }, [academyId]);

  const renderContent = () => {
    // خلفية الصفحة الأساسية
    const pageStyle = { backgroundColor: '#111C2A', minHeight: '100vh', padding: '20px', color: C.text };

    return (
      <div style={pageStyle}>
        {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} />}
        {activeTab === 'students' && <Students students={students} setStudents={setStudents} />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'payments' && <Payments />}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg }}>
      <aside style={{ width: 260, background: C.surface, height: '100vh', padding: '20px', display: sidebarOpen || window.innerWidth > 768 ? 'block' : 'none' }}>
        <h2 style={{ color: C.gold }}>Smart Halaqa</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
            { id: 'students', label: 'Students', icon: <FaUsers /> },
            { id: 'attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
            { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              style={{ background: activeTab === item.id ? C.gold : 'transparent', color: activeTab === item.id ? '#000' : C.text, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 15, background: 'none', border: 'none', color: '#fff' }}>
          <FaBars size={24} />
        </button>
        {renderContent()}
      </main>
    </div>
  );
}
