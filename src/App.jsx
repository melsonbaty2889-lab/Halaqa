/* src/App.jsx */
import React, { useState, useEffect, Component, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { useAcademy } from './context/AcademyContext';
import { FaSpinner, FaClock, FaSignOutAlt, FaLock, FaWifi, FaExclamationTriangle } from 'react-icons/fa';

import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';
import CreateAcademy from './components/CreateAcademy';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// 🛡️ درع الأمان: اصطياد أخطاء التحديثات
if (typeof window !== 'undefined') {
  const handleChunkError = (error) => {
    const errorMsg = error?.message || error?.toString() || '';
    if (/Failed to fetch dynamically imported module|chunk load error|loading chunk/i.test(errorMsg)) {
      window.location.reload();
    }
  };
  window.addEventListener('unhandledrejection', (event) => handleChunkError(event.reason));
  window.addEventListener('error', (event) => handleChunkError(event.error), true);
}

// حارس المكونات
class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>حدث خطأ تقني، يرجى تحديث الصفحة.</div>;
    return this.props.children;
  }
}

const ALLOWED_HOSTS = (import.meta.env.VITE_ALLOWED_HOSTS || 'smart-halaqa.vercel.app,localhost,127.0.0.1,192.168.1.9').split(',').map((s) => s.trim());

function AppContent() {
  const { appState, user, profile, academy, logout, refreshStatus } = useAcademy();
  const [authView, setAuthView] = useState('login');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const goldColor = '#C9A84C';

  // 🛠️ تتبع الحالة للتشخيص
  console.log("🛠️ Current App State:", appState);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // 1. Loading
  if (appState === 'LOADING') return <SplashScreen />;

  // 2. Password Update
  if (authView === 'update_password') return <UpdatePassword />;

  // 3. Unauthenticated
  if (appState === 'UNAUTHENTICATED') {
    return (
      <div style={{ background: '#090F17', minHeight: '100vh', direction: 'rtl' }}>
        {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
        {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
        {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
      </div>
    );
  }

  // 4. Pending Approval
  if (appState === 'PENDING_APPROVAL') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', padding: '20px', direction: 'rtl' }}>
        <div style={{ width: '100%', maxWidth: '500px', background: '#111C2A', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
          <FaClock style={{ color: goldColor, fontSize: '40px', marginBottom: '20px' }} />
          <h2 style={{ color: '#fff', marginBottom: '15px' }}>طلبك قيد المراجعة</h2>
          <p style={{ color: '#94a3b8', marginBottom: '25px' }}>حسابك ({profile?.full_name}) قيد التدقيق من الإدارة العامة.</p>
          <button onClick={logout} style={{ padding: '10px 20px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '8px', cursor: 'pointer' }}>تسجيل الخروج</button>
        </div>
      </div>
    );
  }

  // 5. Super Admin
  if (appState === 'SUPER_ADMIN') {
    return <Suspense fallback={<SplashScreen />}><AdminDashboard session={{ user }} onLogout={logout} /></Suspense>;
  }

  // 6. No Academy
  if (appState === 'NO_ACADEMY') {
    return <CreateAcademy session={{ user }} onAcademyCreated={refreshStatus} onLogout={logout} />;
  }

  // 7. Fully Active
  if (appState === 'FULLY_ACTIVE') {
    return (
      <>
        {!isOnline && <div style={{ background: '#EF4444', color: '#FFF', textAlign: 'center', padding: '8px', position: 'fixed', top: 0, width: '100%', zIndex: 9999 }}>انقطع الاتصال بالإنترنت.</div>}
        <MainApp session={{ user }} userRole={profile?.role} />
      </>
    );
  }

  // 8. Debug / Fallback Screen (هنا تظهر شاشة القفل إذا لم تكن الحالة مطابقة)
  return (
    <div style={{ background: '#090F17', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: "'Cairo', sans-serif" }}>
      <FaExclamationTriangle style={{ fontSize: '40px', color: '#EF4444', marginBottom: '15px' }} />
      <h2 style={{ marginBottom: '10px' }}>عذراً، حالة النظام غير معرفة</h2>
      <p style={{ color: '#9CA3AF', marginBottom: '5px' }}>App State: <strong style={{ color: goldColor }}>{appState || 'NULL'}</strong></p>
      <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>إذا ظهرت هذه الرسالة، فهذا يعني أن النظام لا يستطيع تصنيفك.</p>
      <button onClick={logout} style={{ background: goldColor, color: '#000', padding: '10px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تسجيل الخروج</button>
    </div>
  );
}

export default function App() {
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : null;
  const isAllowed = hostname ? ALLOWED_HOSTS.includes(hostname) : true;

  if (!isAllowed) return <div style={{ padding: '30px', color: '#EF4444', textAlign: 'center' }}>🔒 نطاق غير مصرح به.</div>;

  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}
