/* src/App.jsx */
import React, { useState, useEffect, Component, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { useAcademy } from './context/AcademyContext';
import { 
  FaSpinner, FaClock, FaSignOutAlt, FaWifi, 
  FaExclamationTriangle, FaSync, FaBolt, FaCheckCircle, FaTimes 
} from 'react-icons/fa';

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

// 🛡️ مكون نافذة الترقية المبنية داخلياً
function InlineUpgradeModal({ isOpen, onClose, academyName }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      direction: 'rtl',
      fontFamily: "'Cairo', sans-serif"
    }}>
      <div style={{
        background: '#111C2A',
        border: '1px solid #334155',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
        >
          <FaTimes />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto 12px'
          }}>
            <FaBolt />
          </div>
          <h2 style={{ color: '#FFF', fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: 'bold' }}>
            ترقية حساب الأكاديمية
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>
            احصل على كافة مميزات المنظومة الاحترافية لأكاديميتك ({academyName || ''})
          </p>
        </div>

        <div style={{
          background: '#1E293B',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#E2E8F0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle style={{ color: '#10B981' }} />
              <span>إدارة عدد غير محدود من الطلاب والحلقات</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle style={{ color: '#10B981' }} />
              <span>تقارير وأداء لحظي وتنبيهات مستمرة</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle style={{ color: '#10B981' }} />
              <span>دعم فني وتحديثات مستمرة للباقة الاحترافية</span>
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              alert("تم إرسال طلب الترقية إلى إدارة المنصة بنجاح، سيتم التواصل معكم فوراً.");
              onClose();
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            تأكيد طلب الترقية
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              color: '#94A3B8',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// 🛡️ حارس المكونات المطور للتشخيص المباشر
class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Global App Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px', padding: '20px', fontFamily: "'Cairo', sans-serif" }}>
          <FaExclamationTriangle style={{ color: '#EF4444', fontSize: '48px', marginBottom: '15px' }} />
          <h2 style={{ color: '#EF4444', marginBottom: '10px' }}>حدث خطأ تقني في النظام</h2>
          <div style={{ background: '#1E293B', padding: '15px', borderRadius: '8px', border: '1px solid #334155', maxWidth: '600px', margin: '15px auto', textAlign: 'left', direction: 'ltr', fontSize: '0.85rem', color: '#F87171', overflowX: 'auto' }}>
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', background: '#C9A84C', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ALLOWED_HOSTS = (import.meta.env.VITE_ALLOWED_HOSTS || 'smart-halaqa.vercel.app,halaqa.vercel.app,localhost,127.0.0.1,192.168.1.9').split(',').map((s) => s.trim());

function AppContent() {
  const { appState, user, profile, academy, logout, refreshStatus } = useAcademy();
  const [authView, setAuthView] = useState('login');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 1. 🌟 التحقق الذكي: هل تم عرض الـ Splash مسبقاً في هذه الجلسة؟
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('splash_has_shown');
  });

  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);
  const goldColor = '#C9A84C';

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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (refreshStatus) await refreshStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 2. 🌟 دالة إنهاء الـ Splash وتسجيلها في الـ Session
  const handleSplashFinish = () => {
    sessionStorage.setItem('splash_has_shown', 'true');
    setShowSplash(false);
  };

  // 3. 🌟 إظهار الشاشة الافتتاحية للمرة الأولى فقط في الجلسة
  if (showSplash) {
    return (
      <SplashScreen 
        lang="ar" 
        onFinish={handleSplashFinish} 
      />
    );
  }

  // 4. 🌟 شاشة تحميل خفيفة ومستقرة أثناء جلب البيانات (تمنع الوميض)
  if (appState === 'LOADING') {
    return (
      <div style={{
        background: '#090F17',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: goldColor
      }}>
        <FaSpinner className="fa-spin" style={{ fontSize: '32px' }} />
      </div>
    );
  }

  // 5. Password Update
  if (authView === 'update_password') return <UpdatePassword />;

  // 6. Unauthenticated
  if (appState === 'UNAUTHENTICATED') {
    return (
      <div style={{ background: '#090F17', minHeight: '100vh', direction: 'rtl' }}>
        {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
        {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
        {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
      </div>
    );
  }

  // 7. Pending Approval
  if (appState === 'PENDING_APPROVAL') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '500px', background: '#111C2A', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px solid #1E293B' }}>
          <FaClock style={{ color: goldColor, fontSize: '40px', marginBottom: '20px' }} />
          <h2 style={{ color: '#fff', marginBottom: '15px' }}>طلبك قيد المراجعة</h2>
          <p style={{ color: '#94a3b8', marginBottom: '25px', lineHeight: '1.6' }}>
            حسابك ({profile?.full_name || 'المستخدم'}) وأكاديميتك قيد التدقيق والموافقة من قبل الإدارة العامة للمنصة.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              style={{ padding: '10px 20px', background: goldColor, color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaSync className={isRefreshing ? 'fa-spin' : ''} />
              {isRefreshing ? 'جاري الفحص...' : 'تحديث حالة الطلب'}
            </button>
            
            <button 
              onClick={logout} 
              style={{ padding: '10px 20px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaSignOutAlt />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 8. Super Admin
  if (appState === 'SUPER_ADMIN') {
    return (
      <Suspense fallback={
        <div style={{ background: '#090F17', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: goldColor }}>
          <FaSpinner className="fa-spin" style={{ fontSize: '32px' }} />
        </div>
      }>
        <AdminDashboard session={{ user }} onLogout={logout} />
      </Suspense>
    );
  }

  // 9. No Academy
  if (appState === 'NO_ACADEMY') {
    return <CreateAcademy session={{ user }} onAcademyCreated={refreshStatus} onLogout={logout} />;
  }

  // 10. Fully Active
  if (appState === 'FULLY_ACTIVE') {
    const formattedSession = user ? { user } : null;
    return (
      <>
        {!isOnline && (
          <div style={{ background: '#EF4444', color: '#FFF', textAlign: 'center', padding: '8px', position: 'fixed', top: 0, width: '100%', zIndex: 9999, fontWeight: 'bold' }}>
            <FaWifi style={{ marginLeft: '8px' }} /> انقطع الاتصال بالإنترنت.
          </div>
        )}
        <MainApp 
          session={formattedSession} 
          userRole={profile?.role || 'staff'} 
          setShowEarlyUpgrade={setShowEarlyUpgrade}
        />

        <InlineUpgradeModal 
          isOpen={showEarlyUpgrade} 
          onClose={() => setShowEarlyUpgrade(false)} 
          academyName={academy?.name}
        />
      </>
    );
  }

  // 11. Fallback Screen
  return (
    <div style={{ background: '#090F17', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: "'Cairo', sans-serif", padding: '20px', textAlign: 'center' }}>
      <FaExclamationTriangle style={{ fontSize: '40px', color: '#EF4444', marginBottom: '15px' }} />
      <h2 style={{ marginBottom: '10px' }}>عذراً، حالة النظام غير معرفة</h2>
      <p style={{ color: '#9CA3AF', marginBottom: '5px' }}>App State: <strong style={{ color: goldColor }}>{appState || 'NULL'}</strong></p>
      <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>إذا ظهرت هذه الرسالة، فهذا يعني أن النظام لا يستطيع تصنيف حسابك حالياً.</p>
      <button onClick={logout} style={{ background: goldColor, color: '#000', padding: '10px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تسجيل الخروج</button>
    </div>
  );
}

export default function App() {
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : null;
  const isAllowed = hostname ? ALLOWED_HOSTS.includes(hostname) : true;

  if (!isAllowed) return <div style={{ padding: '30px', color: '#EF4444', textAlign: 'center', fontFamily: "'Cairo', sans-serif" }}>🔒 نطاق غير مصرح به.</div>;

  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}
