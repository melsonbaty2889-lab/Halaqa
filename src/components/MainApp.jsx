import React, { useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBars, FaSignOutAlt } from "react-icons/fa";

import Dashboard from './Dashboard.jsx';
import Students from './Students.jsx';
import Attendance from './Attendance.jsx';
import Payments from './Payments.jsx';

// 🛡️ درع الحماية الذكي: يمنع الشاشة السوداء نهائياً ويقبض على الأخطاء داخل الصفحات
class LocalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 انهار المكون الداخلي:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', backgroundColor: '#2A161A', border: '1px solid #EF4444', borderRadius: '12px', color: '#FCA5A5', marginTop: '20px', textAlign: 'right', direction: 'rtl' }}>
          <h3 style={{ color: '#F87171', marginBottom: '10px' }}>⚠️ عذراً، حدث خطأ برمجي داخل هذا القسم</h3>
          <p style={{ fontSize: '14px', opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', fontFamily: 'monospace' }}>
            السبب: {this.state.error?.message || "خطأ غير معروف"}
          </p>
          <p style={{ fontSize: '13px', marginTop: '10px', color: '#E4DAC8', opacity: 0.8 }}>
            تنبيه: لوحة التحكم شقالة بنجاح، لكن هذا الخطأ يقع في ملف القسم نفسه الذي حاولت فتحه.
          </p>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ marginTop: '15px', padding: '8px 16px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MainApp({ session }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      if (!session?.user?.id) return;
      try {
        const { data: staff } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name)')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const currentAcademyId = staff?.academies?.id || staff?.academy_id;

        if (currentAcademyId) {
          setAcademyId(currentAcademyId);
          const { data: studentsData } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', currentAcademyId);
          
          if (studentsData) setStudents(studentsData);
        }
      } catch (error) {
        console.error("خطأ جلب البيانات:", error);
      } finally {
        setLoadingData(false);
      }
    }
    loadInitialData();
  }, [session]);

  if (loadingData) {
    return (
      <div style={{ padding: 40, color: C.text, backgroundColor: '#0C1520', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', direction: 'rtl' }}>
        جاري تهيئة لوحة التحكم والبيانات...
      </div>
    );
  }

  const renderContent = () => {
    const pageStyle = { backgroundColor: '#111C2A', minHeight: '80vh', padding: '20px', color: C.text, borderRadius: '12px' };

    return (
      <div style={pageStyle}>
        {/* نغلف محتوى التنقل داخل درع الحماية لحماية التطبيق من السواد */}
        <LocalErrorBoundary key={activeTab}>
          {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} />}
          {activeTab === 'students' && <Students students={students} setStudents={setStudents} academyId={academyId} />}
          {activeTab === 'attendance' && <Attendance />}
          {activeTab === 'payments' && <Payments />}
        </LocalErrorBoundary>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg }}>
      {/* القائمة الجانبية */}
      <aside style={{ 
        width: 260, 
        background: C.surface, 
        height: '100vh', 
        padding: '20px', 
        display: sidebarOpen || window.innerWidth > 768 ? 'block' : 'none',
        position: window.innerWidth <= 768 ? 'fixed' : 'relative',
        zIndex: 2000,
        boxShadow: C.shadow
      }}>
        <h2 style={{ color: C.gold, marginBottom: '20px' }}>Smart Halaqa</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
            { id: 'students', label: 'Students', icon: <FaUsers /> },
            { id: 'attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
            { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              style={{ background: activeTab === item.id ? C.gold : 'transparent', color: activeTab === item.id ? '#000' : C.text, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, width: '100%', fontSize: '15px' }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '40px', background: 'transparent', border: '1px solid ' + C.danger, color: C.danger, padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
          <FaSignOutAlt /> Sign Out
        </button>
      </aside>

      {/* المحتوى الرئيسي */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
            <FaBars size={20} />
          </button>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
