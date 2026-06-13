import { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { C } from './constants/colors';
import { supabase } from './lib/supabase';
import { AcademyProvider } from './context/AcademyContext';

// استيراد الأيقونات للتصميم الاحترافي
import { FaChartLine, FaUsers, FaCalendarCheck, FaMoneyBillWave } from "react-icons/fa";

// استيراد المكونات
import SplashScreen from './components/SplashScreen.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import UpdatePassword from './components/UpdatePassword.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import StudentProfile from './components/StudentProfile.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';

export default function App() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [view, setView] = useState('login');
  const [students, setStudents] = useState([]);
  const [academyId, setAcademyId] = useState(null);

  // منطق تحميل بيانات الأكاديمية
  const loadAcademyData = useCallback(async (userId) => {
    try {
      const { data: staffData } = await supabase
        .from('staff')
        .select('academy_id, academies(id, name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (staffData?.academies) {
        setAcademyId(staffData.academies.id);
        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .eq('academy_id', staffData.academies.id);
        setStudents(studentsData || []);
      }
    } catch (err) { console.error("Data Load Error:", err); }
  }, []);

  // التحقق من حالة الجلسة
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) loadAcademyData(session.user.id);
      setTimeout(() => setLoading(false), 1000);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s?.user?.id) loadAcademyData(s.user.id);
      else { setStudents([]); setAcademyId(null); }
    });
    return () => subscription.unsubscribe();
  }, [loadAcademyData]);

  if (loading) return <SplashScreen />;

  // منطق صفحات المصادقة
  if (!session) {
    if (window.location.hash.includes('type=recovery')) return <UpdatePassword />;
    if (view === 'signup') return <SignUpPage onSwitchToLogin={() => setView('login')} />;
    if (view === 'forgot') return <ForgotPassword onBackToLogin={() => setView('login')} />;
    return <LoginPage onSwitchToSignUp={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgot')} />;
  }

  // الواجهة الرئيسية بعد تسجيل الدخول
  return (
    <AcademyProvider value={{ academyId, setAcademyId }}>
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, direction: 'ltr' }}>
          
          {/* القائمة الجانبية الثابتة (Sidebar) */}
          <aside style={{ width: 280, background: C.surface, padding: '30px 20px', borderRight: `1px solid ${C.border}` }}>
            <h2 style={{ color: C.gold, marginBottom: 40 }}>Smart Halaqa</h2>
            
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
                { id: 'students', label: 'Students', icon: <FaUsers /> },
                { id: 'attendance', label: 'Attendance', icon: <FaCalendarCheck /> },
                { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
              ].map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  style={{ background: activeTab === item.id ? C.gold : 'transparent', color: activeTab === item.id ? '#000' : C.text, padding: 15, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 15, fontWeight: 'bold' }}>
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>

            <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} style={{ marginTop: 'auto', background: 'transparent', border: `1px solid ${C.gold}`, color: C.gold, padding: 10, borderRadius: 8, cursor: 'pointer' }}>
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </button>
          </aside>

          {/* المحتوى الرئيسي */}
          <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={
                <>
                  {activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}
                  {activeTab === "students" && <Students students={students} setStudents={setStudents} />}
                  {activeTab === "attendance" && <Attendance students={students} />}
                  {activeTab === "payments" && <Payments students={students} />}
                </>
              } />
              <Route path="/student/:id" element={<StudentProfile />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AcademyProvider>
  );
}
