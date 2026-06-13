import { useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import { C } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaBars, FaSignOutAlt } from "react-icons/fa";

import Dashboard from './Dashboard.jsx';
import Students from './Students.jsx';
import Attendance from './Attendance.jsx';
import Payments from './Payments.jsx';

export default function MainApp({ session }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // تعريف الحالات الأساسية لحفظ البيانات محلياً لمنع الانهيار
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // جلب البيانات مباشرة من الجلسة (Session) دون الاعتماد على useAcademy لتفادي الشاشة السوداء
  useEffect(() => {
    async function loadInitialData() {
      if (!session?.user?.id) return;
      try {
        // 1. جلب معرف الأكاديمية التابع لها هذا المستخدم (مثل كود الداشبورد القديم تماماً)
        const { data: staff } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name)')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const currentAcademyId = staff?.academies?.id || staff?.academy_id;

        if (currentAcademyId) {
          setAcademyId(currentAcademyId);

          // 2. جلب الطلاب بناءً على معرف الأكاديمية مباشرة لتجهيز القائمة
          const { data: studentsData } = await supabase
            .from('students')
            .select('*')
            .eq('academy_id', currentAcademyId);
          
          if (studentsData) setStudents(studentsData);
        }
      } catch (error) {
        console.error("حدث خطأ أثناء تحميل البيانات:", error);
      } finally {
        setLoadingData(false);
      }
    }
    loadInitialData();
  }, [session]);

  // شاشة تحميل مصغرة مدمجة لحين انتهاء جلب البيانات لمنع الوميض الأسود
  if (loadingData) {
    return (
      <div style={{ padding: 40, color: C.text, backgroundColor: '#111C2A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
        جاري تحميل البيانات...
      </div>
    );
  }

  const renderContent = () => {
    const pageStyle = { backgroundColor: '#111C2A', minHeight: '100vh', padding: '20px', color: C.text };

    return (
      <div style={pageStyle}>
        {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} />}
        {/* نمرر الـ academyId هنا كـ Prop احتياطياً إذا كان ملف الطلاب يشتكي منه */}
        {activeTab === 'students' && <Students students={students} setStudents={setStudents} academyId={academyId} />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'payments' && <Payments />}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg }}>
      {/* القائمة الجانبية (Sidebar) */}
      <aside style={{ width: 260, background: C.surface, height: '100vh', padding: '20px', display: sidebarOpen || window.innerWidth > 768 ? 'block' : 'none' }}>
        <h2 style={{ color: C.gold, marginBottom: '20px' }}>Smart Halaqa</h2>
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

        {/* زر تسجيل الخروج المفقود أعدته لك هنا */}
        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '40px', background: 'transparent', border: '1px solid ' + C.danger, color: C.danger, padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
          <FaSignOutAlt /> Sign Out
        </button>
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
