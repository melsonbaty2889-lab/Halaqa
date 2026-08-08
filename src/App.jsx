/* src/App.jsx */
import React, { useState, useEffect, Component, lazy, Suspense } from 'react';
import { 
  Loader2, Clock, LogOut, Wifi, 
  AlertTriangle, RefreshCw, Zap, CheckCircle, X, Lock 
} from 'lucide-react';

// 🛠️ الخدمات والثوابت والسياقات
import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
import { ROLES, getRouteForRole } from '@/constants/roles';

// 🔄 المكونات العامة
import SplashScreen from '@/components/UI/SplashScreen'; 
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo.jsx';
import DevPlayground from '@/components/DevPlayground'; // 🧪 استدعاء المختبر
import LoginPage from '@/components/Auth/LoginPage';
import SignUpPage from '@/components/Auth/SignUpPage';
import ForgotPassword from '@/components/Auth/ForgotPassword';
import UpdatePassword from '@/components/Auth/UpdatePassword';
import MainApp from '@/components/MainApp';
import CreateAcademy from '@/components/CreateAcademy';
import CertificateVerify from '@/components/Certificates/CertificateVerify';

// 📊 التحميل الكسول لوحة تحكم السوبر أدمن
const AdminDashboard = lazy(() => import('@/components/Dashboard/AdminDashboard'));

// 🎨 ثوابت التصميم الموحدة
const THEME = {
  bgDark: '#090F17',
  bgCard: '#111C2A',
  bgCardHover: '#1E293B',
  gold: '#C9A84C',
  textMuted: '#94A3B8',
  textLight: '#FFFFFF',
  border: '#334155',
  fontFamily: "'Cairo', system-ui, sans-serif"
};

// 🛡️ مكون حماية المسارات (ProtectedRoute)
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { profile, appState, logout } = useAcademy();

  if (appState === 'LOADING') {
    return (
      <div style={{ background: THEME.bgDark, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: THEME.gold }}>
        <Loader2 className="fa-spin" size={28} />
      </div>
    );
  }

  const cleanRole = profile?.role?.toLowerCase()?.trim();
  const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(cleanRole);

  if (!isAllowed) {
    const targetRoute = getRouteForRole ? getRouteForRole(cleanRole) : '/';
    return (
      <div style={{
        background: THEME.bgDark,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: THEME.textLight,
        padding: '20px',
        textAlign: 'center',
        fontFamily: THEME.fontFamily,
        direction: 'rtl'
      }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '16px', color: '#EF4444' }}>
          <Lock size={40} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>غير مصرح لك بالوصول لهذه الشاشة</h2>
        <p style={{ color: THEME.textMuted, fontSize: '14px', maxWidth: '400px', marginBottom: '24px' }}>
          دور حسابك الحقيقي ({profile?.role || 'غير معروف'}) لا يمتلك الصلاحية الكافية لعرض هذا القسم.
        </p>
        <button
          onClick={logout}
          style={{
            padding: '10px 20px',
            background: THEME.gold,
            color: '#000',
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

// 🛡️ درع الأمان: اصطياد أخطاء الشبكة
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

// 🛡️ مكون نافذة الترقية
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
      fontFamily: THEME.fontFamily
    }}>
      <div style={{
        background: THEME.bgCard,
        border: `1px solid ${THEME.border}`,
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
            color: THEME.textMuted,
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
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Zap size={24} />
          </div>
          <h2 style={{ color: THEME.textLight, fontSize: '1.25rem', margin: '0 0 6px 0', fontWeight: 'bold' }}>
            ترقية حساب الأكاديمية
          </h2>
          <p style={{ color: THEME.textMuted, fontSize: '0.85rem', margin: 0 }}>
            احصل على كافة مميزات المنظومة الاحترافية لأكاديميتك ({academyName || ''})
          </p>
        </div>

        <div style={{
          background: THEME.bgCardHover,
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#E2E8F0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: '#10B981' }} />
              <span>إدارة عدد غير محدود من الطلاب والحلقات</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: '#10B981' }} />
              <span>تقارير وأداء لحظي وتنبيهات مستمرة</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: '#10B981' }} />
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
              color: THEME.textMuted,
              border: `1px solid ${THEME.border}`,
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

// 🛡️ حارس المكونات البرمجية العام (Global Error Boundary)
class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Global App Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px', padding: '20px', fontFamily: THEME.fontFamily }}>
          <AlertTriangle size={48} style={{ color: '#EF4444', marginBottom: '15px' }} />
          <h2 style={{ color: '#EF4444', marginBottom: '10px' }}>حدث خطأ تقني في النظام</h2>
          <div style={{ background: THEME.bgCardHover, padding: '15px', borderRadius: '8px', border: `1px solid ${THEME.border}`, maxWidth: '600px', margin: '15px auto', textAlign: 'left', direction: 'ltr', fontSize: '0.85rem', color: '#F87171', overflowX: 'auto' }}>
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
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

// ⚡ منطق التطبيق الداخلي
function MainContent() {
  const { appState, user, profile, academy, logout, refreshStatus } = useAcademy();
  const [authView, setAuthView] = useState('login');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEarlyUpgrade, setShowEarlyUpgrade] = useState(false);

  // 🎓 التحقق الفوري العام من الشهادات
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

  // 1. حالة التحميل
  if (appState === 'LOADING') {
    return (
      <div style={{ background: THEME.bgDark, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: THEME.gold, gap: '12px' }}>
        <Loader2 className="fa-spin" size={28} />
        <span style={{ fontSize: '0.85rem', color: THEME.textMuted, fontFamily: THEME.fontFamily }}>جاري تحميل المنظومة...</span>
      </div>
    );
  }

  // 2. حالة غير المسجلين
  if (appState === 'UNAUTHENTICATED') {
    return (
      <div style={{ background: THEME.bgDark, minHeight: '100vh', direction: 'rtl' }}>
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

  // 3. حالة الحساب قيد المراجعة
  if (appState === 'PENDING_APPROVAL') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', padding: '20px', direction: 'rtl', fontFamily: THEME.fontFamily }}>
        <div style={{ width: '100%', maxWidth: '500px', background: THEME.bgCard, padding: '40px', borderRadius: '20px', textAlign: 'center', border: `1px solid ${THEME.border}` }}>
          <Clock size={40} style={{ color: THEME.gold, marginBottom: '20px' }} />
          <h2 style={{ color: '#fff', marginBottom: '15px' }}>طلبك قيد المراجعة</h2>
          <p style={{ color: THEME.textMuted, marginBottom: '25px', lineHeight: '1.6' }}>
            حسابك ({profile?.full_name || 'المستخدم'}) وأكاديميتك قيد التدقيق والموافقة من قبل الإدارة العامة للمنصة.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              style={{ padding: '10px 20px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'fa-spin' : ''} />
              {isRefreshing ? 'جاري الفحص...' : 'تحديث حالة الطلب'}
            </button>
            
            <button 
              onClick={logout} 
              style={{ padding: '10px 20px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. السوبر أدمن
  if (appState === 'SUPER_ADMIN') {
    return (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <Suspense fallback={
          <div style={{ background: THEME.bgDark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.gold }}>
            <Loader2 className="fa-spin" size={32} />
          </div>
        }>
          <AdminDashboard session={{ user }} onLogout={logout} />
        </Suspense>
      </ProtectedRoute>
    );
  }

  // 5. إنشاء أكاديمية
  if (appState === 'NO_ACADEMY') {
    return <CreateAcademy session={{ user }} onAcademyCreated={refreshStatus} onLogout={logout} />;
  }

  // 6. الدخول النشط والكامل
  if (appState === 'FULLY_ACTIVE') {
    const formattedSession = user ? { user } : null;
    return (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT]}>
        {!isOnline && (
          <div style={{ background: '#EF4444', color: '#FFF', textAlign: 'center', padding: '8px', position: 'fixed', top: 0, width: '100%', zIndex: 9999, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
    <div style={{ background: THEME.bgDark, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: THEME.fontFamily, padding: '20px', textAlign: 'center' }}>
      <AlertTriangle size={40} style={{ color: '#EF4444', marginBottom: '15px' }} />
      <h2 style={{ marginBottom: '10px' }}>عذراً، حالة النظام غير معرفة</h2>
      <p style={{ color: '#9CA3AF', marginBottom: '5px' }}>App State: <strong style={{ color: THEME.gold }}>{appState || 'NULL'}</strong></p>
      <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>إذا ظهرت هذه الرسالة، فهذا يعني أن النظام لا يستطيع تصنيف حسابك حالياً.</p>
      <button onClick={logout} style={{ background: THEME.gold, color: '#000', padding: '10px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تسجيل الخروج</button>
    </div>
  );
}

// 👑 المكون الجذري الأعلى للتطبيق (Root App)
export default function App() {
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : null;
  const isAllowed = hostname ? ALLOWED_HOSTS.includes(hostname) : true;

  // 📱 وضع المعاينة السريعة والمختبر عبر الرابط
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const view = urlParams.get('view');

  // 🧪 فتح مختبر التجارب المستقل عند طلب ?view=test
  if (view === 'test') {
    return <DevPlayground />;
  }

  if (view === 'logo') {
    return (
      <div style={{ background: THEME.bgDark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Logo size={140} />
      </div>
    );
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
    } catch (e) {
      console.warn(e);
    }
    setShowSplash(false);
  };

  if (!isAllowed) {
    return <div style={{ padding: '30px', color: '#EF4444', textAlign: 'center', fontFamily: THEME.fontFamily }}>🔒 نطاق غير مصرح به.</div>;
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
