import React, { useState, useEffect, Component, lazy, Suspense } from 'react';
import { 
  Loader2, Clock, LogOut, Wifi, 
  AlertTriangle, RefreshCw, Zap, CheckCircle, X, Lock 
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
import { ROLES } from '@/constants/roles';
import { colors as C } from '@/theme/colors.js';

import SplashScreen from '@/components/UI/SplashScreen'; 
import DevPlayground from '@/components/DevPlayground';
import LoginPage from '@/components/Auth/LoginPage';
import SignUpPage from '@/components/Auth/SignUpPage';
import ForgotPassword from '@/components/Auth/ForgotPassword';
import UpdatePassword from '@/components/Auth/UpdatePassword';
import MainApp from '@/components/MainApp';
import CreateAcademy from '@/components/CreateAcademy';
import CertificateVerify from '@/components/Certificates/CertificateVerify';

const AdminDashboard = lazy(() => import('@/components/Dashboard/AdminDashboard'));

const ALLOWED_HOSTS = (import.meta.env.VITE_ALLOWED_HOSTS || 'smart-halaqa.vercel.app,halaqa.vercel.app,localhost,127.0.0.1,192.168.1.9')
  .split(',')
  .map((s) => s.trim());

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { profile, appState, logout } = useAcademy();

  if (appState === 'LOADING') {
    return (
      <div style={{ background: C.dark.main, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: C.primary.DEFAULT }}>
        <Loader2 className="fa-spin" size={28} />
      </div>
    );
  }

  const cleanRole = profile?.role?.toLowerCase()?.trim();
  const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(cleanRole);

  if (!isAllowed) {
    return (
      <div style={{
        background: C.dark.main,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.text.title,
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Cairo', system-ui, sans-serif",
        direction: 'rtl'
      }}>
        <div style={{ background: C.error.bgGlow, padding: '20px', borderRadius: '50%', marginBottom: '16px', color: C.error.DEFAULT }}>
          <Lock size={40} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>غير مصرح لك بالوصول لهذه الشاشة</h2>
        <p style={{ color: C.text.muted, fontSize: '14px', maxWidth: '400px', marginBottom: '24px' }}>
          دور حسابك الحقيقي ({profile?.role || 'غير معروف'}) لا يمتلك الصلاحية الكافية لعرض هذا القسم.
        </p>
        <button
          onClick={logout}
          style={{
            padding: '10px 20px',
            background: C.primary.gradient,
            color: C.dark.main,
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          تسجيل الخروج والعودة
        </button>
      </div>
    );
  }

  return children;
};

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
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      <div style={{
        background: C.dark.card,
        border: `1px solid ${C.dark.border}`,
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
            color: C.text.muted,
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: C.brandEmerald.bgGlow,
            color: C.primary.DEFAULT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Zap size={24} />
          </div>
          <h2 style={{ color: C.text.title, fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: 'bold' }}>
            ترقية حساب الأكاديمية
          </h2>
          <p style={{ color: C.text.muted, fontSize: '0.85rem', margin: 0 }}>
            احصل على كافة مميزات المنظومة الاحترافية لأكاديميتك ({academyName || ''})
          </p>
        </div>

        <div style={{
          background: C.dark.surface,
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px',
          border: `1px solid ${C.dark.border}`
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: C.text.body, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.brandEmerald.DEFAULT }} />
              <span>إدارة عدد غير محدود من الطلاب والحلقات</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.brandEmerald.DEFAULT }} />
              <span>تقارير وأداء لحظي وتنبيهات مستمرة</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: C.brandEmerald.DEFAULT }} />
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
              background: C.primary.gradient,
              color: C.dark.main,
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
              color: C.text.muted,
              border: `1px solid ${C.dark.border}`,
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

class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Global App Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: C.text.title, textAlign: 'center', marginTop: '50px', padding: '20px', fontFamily: "'Cairo', system-ui, sans-serif" }}>
          <AlertTriangle size={48} style={{ color: C.error.DEFAULT, marginBottom: '15px' }} />
          <h2 style={{ color: C.error.DEFAULT, marginBottom: '10px' }}>حدث خطأ تقني في النظام</h2>
          <div style={{ background: C.dark.card, padding: '15px', borderRadius: '8px', border: `1px solid ${C.dark.border}`, maxWidth: '600px', margin: '15px auto', textAlign: 'left', direction: 'ltr', fontSize: '0.85rem', color: C.error.light, overflowX: 'auto' }}>
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', background: C.primary.gradient, color: C.dark.main, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainContent() {
  const { appState, user, profile, academy, logout, refreshStatus } = useAcademy();
  const [authView, setAuthView] = useState('login');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/verify/')) {
    return <CertificateVerify />;
  }

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

  if (authView === 'update_password') {
    return (
      <UpdatePassword 
        onSuccess={() => {
          setAuthView('login');
          if (refreshStatus) refreshStatus();
        }} 
      />
    );
  }

  if (appState === 'LOADING') {
    return (
      <div style={{ background: C.dark.main, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.primary.DEFAULT, gap: '12px' }}>
        <Loader2 className="fa-spin" size={28} />
        <span style={{ fontSize: '0.85rem', color: C.text.muted, fontFamily: "'Cairo', system-ui, sans-serif" }}>جاري تحميل المنظومة...</span>
      </div>
    );
  }

  if (appState === 'UNAUTHENTICATED') {
    return (
      <div style={{ background: C.dark.main, minHeight: '100vh', direction: 'rtl' }}>
        {authView === 'login' && (
          <LoginPage 
            onSwitchToSignUp={() => setAuthView('signup')} 
            onForgotPassword={() => setAuthView('forgot')}
            onLoginSuccess={() => refreshStatus && refreshStatus()}
          />
        )}
        {authView === 'signup' && (
          <SignUpPage onSwitchToLogin={() => setAuthView('login')} />
        )}
        {authView === 'forgot' && (
          <ForgotPassword onBackToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  if (appState === 'PENDING_APPROVAL') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.dark.main, padding: '20px', direction: 'rtl', fontFamily: "'Cairo', system-ui, sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '500px', background: C.dark.card, padding: '40px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${C.dark.border}` }}>
          <Clock size={40} style={{ color: C.primary.DEFAULT, marginBottom: '20px' }} />
          <h2 style={{ color: C.text.title, marginBottom: '15px' }}>طلبك قيد المراجعة</h2>
          <p style={{ color: C.text.muted, marginBottom: '25px', lineHeight: '1.6' }}>
            حسابك ({profile?.full_name || 'المستخدم'}) وأكاديميتك قيد التدقيق والموافقة من قبل الإدارة العامة للمنصة.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              style={{ padding: '10px 20px', background: C.primary.gradient, color: C.dark.main, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'fa-spin' : ''} />
              {isRefreshing ? 'جاري الفحص...' : 'تحديث حالة الطلب'}
            </button>
            
            <button 
              onClick={logout} 
              style={{ padding: '10px 20px', background: 'transparent', color: C.error.DEFAULT, border: `1px solid ${C.error.DEFAULT}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'SUPER_ADMIN') {
    return (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <Suspense fallback={
          <div style={{ background: C.dark.main, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary.DEFAULT }}>
            <Loader2 className="fa-spin" size={32} />
          </div>
        }>
          <AdminDashboard session={{ user }} onLogout={logout} />
        </Suspense>
      </ProtectedRoute>
    );
  }

  if (appState === 'NO_ACADEMY') {
    return <CreateAcademy session={{ user }} onAcademyCreated={refreshStatus} onLogout={logout} />;
  }

  if (appState === 'FULLY_ACTIVE') {
    const formattedSession = user ? { user } : null;
    return (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT]}>
        {!isOnline && (
          <div style={{ background: C.error.DEFAULT, color: '#FFF', textAlign: 'center', padding: '8px', position: 'fixed', top: 0, width: '100%', zIndex: 9999, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Wifi size={18} /> انقطع الاتصال بالإنترنت.
          </div>
        )}
        <MainApp 
          session={formattedSession} 
          userRole={profile?.role || 'student'} 
          setShowEarlyUpgrade={setShowEarlyUpgrade}
        />

        <InlineUpgradeModal 
          isOpen={showEarlyUpgrade} 
          onClose={() => setShowEarlyUpgrade(false)} 
          academyName={academy?.name}
        />
      </ProtectedRoute>
    );
  }

  return (
    <div style={{ background: C.dark.main, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: C.text.title, fontFamily: "'Cairo', system-ui, sans-serif", padding: '20px', textAlign: 'center' }}>
      <AlertTriangle size={40} style={{ color: C.error.DEFAULT, marginBottom: '15px' }} />
      <h2 style={{ marginBottom: '10px' }}>عذراً، حالة النظام غير معرفة</h2>
      <p style={{ color: C.text.muted, marginBottom: '5px' }}>App State: <strong style={{ color: C.primary.DEFAULT }}>{appState || 'NULL'}</strong></p>
      <p style={{ color: C.text.muted, marginBottom: '20px' }}>إذا ظهرت هذه الرسالة، فهذا يعني أن النظام لا يستطيع تصنيف حسابك حالياً.</p>
      <button onClick={logout} style={{ background: C.primary.gradient, color: C.dark.main, padding: '10px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تسجيل الخروج</button>
    </div>
  );
}

export default function App() {
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : null;
  const isAllowed = hostname ? ALLOWED_HOSTS.includes(hostname) : true;

  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const view = urlParams.get('view');

  if (view === 'test') {
    return <DevPlayground />;
  }

  if (view === 'splash') {
    return <SplashScreen lang="ar" onFinish={() => alert('انتهى عرض الشاشة الافتتاحية')} />;
  }

  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('app_splash_seen');
  });

  const handleSplashFinish = () => {
    try {
      sessionStorage.setItem('app_splash_seen', 'true');
    } catch {
      // Ignored
    }
    setShowSplash(false);
  };

  if (!isAllowed) {
    return <div style={{ padding: '30px', color: C.error.DEFAULT, textAlign: 'center', fontFamily: "'Cairo', system-ui, sans-serif" }}>🔒 نطاق غير مصرح به.</div>;
  }

  if (showSplash) {
    return <SplashScreen lang="ar" onFinish={handleSplashFinish} />;
  }

  return (
    <GlobalErrorBoundary>
      <MainContent />
    </GlobalErrorBoundary>
  );
}
