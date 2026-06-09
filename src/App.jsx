import { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';     
import { C } from './constants/colors';
import { supabase } from './lib/supabase';

// الصفحات والمكونات
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import CreateAcademy from './components/CreateAcademy.jsx'; 
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';

// المكونات العامة
import { Card } from "./components/UI";

const SECURITY_CONFIG = {
  allowedHostSuffix: "vercel.app",
  watermark: "Licensed to The Win Route © 2026",
};

const useWindowSize = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
};

export default function App() {
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 768;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); 
  const { t, i18n } = useTranslation();    
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSignUp, setShowSignUp] = useState(false);
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState({ name: t('loading'), phone: "" });
  const [academyId, setAcademyId] = useState(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadAcademyData = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('academy_id, name, academies(id, name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (staffError || !staffData || !staffData.academies) {
        setAcademyId(null); 
        setLoading(false);
        return;
      }
      setAcademyId(staffData.academies.id);
      setTeacher({ name: staffData.name, phone: "" });

      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('academy_id', staffData.academies.id)
        .order('created_at', { ascending: false });

      setStudents(studentsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) loadAcademyData(session.user.id);
  }, [session, loadAcademyData]);

  useEffect(() => {
    if (!academyId || !session?.user?.id) return;
    const channel = supabase
      .channel(`students_realtime_${academyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `academy_id=eq.${academyId}` }, () => loadAcademyData(session.user.id))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [academyId, session, loadAcademyData]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && !window.location.hostname.endsWith(SECURITY_CONFIG.allowedHostSuffix)) {
      document.body.innerHTML = `<div style="background:#0C1520;color:#EF4444;text-align:center;padding:100px;font-family:'Cairo';direction:rtl;">⚠️ خطأ في الترخيص</div>`;
    }
  }, []);

  const sendWhatsAppReminder = (student) => {
    window.open(`https://wa.me/2${student.parent_phone}?text=${encodeURIComponent(`السلام عليكم، نذكركم بموعد سداد اشتراك ${student.name}`)}`, "_blank");
  };

  if (loading) return <div style={{ color: C.gold, textAlign: 'center', marginTop: '20%' }}>{t('loading')}</div>;
  if (error) return <div style={{ color: '#EF4444', textAlign: 'center', marginTop: '20%' }}>{error}</div>;
  if (!session) return showSignUp ? <SignUpPage onSwitchToLogin={() => setShowSignUp(false)} /> : <LoginPage onSwitchToSignUp={() => setShowSignUp(true)} />;

  const Settings = () => (
    <div style={{ padding: 24 }}>
      <Card>
        <h3 style={{ color: C.gold }}>⚙️ {t('settings')}</h3>
        <p>مرحباً: <strong>{teacher.name}</strong></p>
      </Card>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Cairo', sans-serif",
      direction: i18n.language === 'ar' ? "rtl" : "ltr", display: "flex", flexDirection: isMobile ? "column" : "row"
    }}>
      {isMobile && (
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 15, background: C.gold, border: 'none', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold' }}>
          {sidebarOpen ? '✕ إغلاق القائمة' : '☰ القائمة'}
        </button>
      )}

      {(!isMobile || sidebarOpen) && (
        <aside style={{ width: isMobile ? "100%" : 260, background: C.surface, padding: 20, display: "flex", flexDirection: "column", height: isMobile ? "auto" : "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <span style={{ fontSize: 28 }}>🕌</span>
            <div>
              <h2 style={{ color: C.gold, margin: 0 }}>الحلقة الذكية</h2>
              <span style={{ fontSize: "0.7rem", color: C.muted }}>Smart Halaqa</span>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { id: "dashboard", label: t('dashboard'), icon: "📊" },
              { id: "students", label: t('students'), icon: "👥" },
              { id: "attendance", label: t('attendance'), icon: "📝" },
              { id: "payments", label: t('payments'), icon: "💰" },
              { id: "settings", label: t('settings'), icon: "⚙️" },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); if(isMobile) setSidebarOpen(false); }} style={{
                padding: "12px 16px", borderRadius: 12, background: activeTab === tab.id ? C.gold : "transparent",
                color: activeTab === tab.id ? "#1A1208" : C.text, textAlign: "right", border: "none", cursor: "pointer"
              }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: "auto", paddingTop: 20 }}>
            <button onClick={toggleLanguage} style={{ width: "100%", padding: "8px", marginBottom: 12 }}>{i18n.language === 'ar' ? '🇬🇧 English' : '🇸🇦 العربية'}</button>
            <button onClick={() => supabase.auth.signOut()} style={{ width: "100%", padding: "10px", background: "rgba(239,68,68,0.1)", color: "#EF4444", borderRadius: 10 }}>🚪 {t('logout')}</button>
          </div>
        </aside>
      )}

      <main style={{ flex: 1, padding: isMobile ? 16 : 32, overflowY: "auto" }}>
        {activeTab === "dashboard" && <Dashboard session={session} setActiveTab={setActiveTab} />}
        {activeTab === "students" && <Students students={students} setStudents={setStudents} academyId={academyId} onSendReminder={sendWhatsAppReminder} />}
        {activeTab === "attendance" && <Attendance students={students} academyId={academyId} />}
        {activeTab === "payments" && <Payments students={students} academyId={academyId} />}
        {activeTab === "settings" && <Settings />}
        {activeTab === "create-academy" && <CreateAcademy session={session} onAcademyCreated={() => window.location.reload()} />}
      </main>
    </div>
  );
}
