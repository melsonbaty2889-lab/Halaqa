import { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { C } from './constants/colors';
import { supabase } from './lib/supabase';

// استيراد المكونات
import SplashScreen from './components/SplashScreen.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import UpdatePassword from './components/UpdatePassword.jsx';
import Dashboard from './components/Dashboard.jsx';
import Students from './components/Students.jsx';
import Attendance from './components/Attendance.jsx';
import Payments from './components/Payments.jsx';

export default function App() {
  const { t, i18n } = useTranslation();
  
  const [loading, setLoading] = useState(true); // يتحكم في الـ Splash
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [view, setView] = useState('login'); 
  
  // حالة الـ Recovery المستقرة
  const [isRecovering, setIsRecovering] = useState(window.location.hash.includes('type=recovery'));

  // مراقبة الرابط في حال تغيره
  useEffect(() => {
    const handleHashChange = () => setIsRecovering(window.location.hash.includes('type=recovery'));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // إدارة الجلسة والتحميل
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      // تأخير بسيط لضمان عرض اللوجو
      setTimeout(() => setLoading(false), 1500);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // شرط العرض الأساسي
  if (loading) return <SplashScreen />;

  if (!session) {
    if (isRecovering) return <UpdatePassword />;
    if (view === 'signup') return <SignUpPage onSwitchToLogin={() => setView('login')} />;
    if (view === 'forgot') return <ForgotPassword onBackToLogin={() => setView('login')} />;
    return <LoginPage onSwitchToSignUp={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgot')} />;
  }

  // الواجهة الرئيسية (نفس كودك السابق)
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex" }}>
      {/* ... (باقي الكود الخاص بالواجهة) ... */}
      <main style={{ flex: 1, padding: 24 }}>
        {activeTab === "dashboard" && <Dashboard session={session} />}
        {/* ... */}
      </main>
    </div>
  );
}
