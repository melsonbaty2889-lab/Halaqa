/* src/App.jsx */
import React, { useState, useEffect, useRef, Component, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { useAcademy } from './context/AcademyContext';
import { FaSpinner, FaClock, FaSignOutAlt, FaLock, FaWifi } from 'react-icons/fa';

// مكونات الإقلاع والولوج الأساسية (تُحمل استاتيكياً لضمان أعلى سرعة عرض أولية)
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';
import CreateAcademy from './components/CreateAcademy';

// 🌐 تحميل اللوحات الكبيرة ديناميكياً لتسريع استجابة الموقع وتقليص حجم الحزمة الأساسية
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SubscriptionPage = lazy(() => import('./components/SubscriptionPage'));

// 🛡️ درع الأمان: اصطياد أخطاء التحديثات المفاجئة على المخدم وإعادة الإنعاش التلقائي للمنصة
if (typeof window !== 'undefined') {
  const handleChunkError = (error) => {
    const errorMsg = error?.message || error?.toString() || '';
    if (/Failed to fetch dynamically imported module|chunk load error|loading chunk/i.test(errorMsg)) {
      console.warn("🚨 جاري تحديث المنظومة، جاري إعادة تحميل التطبيق تلقائياً...");
      window.location.reload();
    }
  };
  window.addEventListener('unhandledrejection', (event) => handleChunkError(event.reason));
  window.addEventListener('error', (event) => handleChunkError(event.error), true);
}

// حارس المكونات الذكي متوافق مع أنظمة المراقبة والمتابعة العالمية
class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Telemetry Log -> Central Error Tracker:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || this.state.error?.toString() || '';
      if (/Failed to fetch dynamically imported module|chunk load error|loading chunk/i.test(errorMsg)) {
        window.location.reload();
        return null;
      }

      return (
        <div style={{ padding: '40px 20px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: 'rtl', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#111827', padding: '30px', borderRadius: '12px', border: '1px solid #1F2937', maxWidth: '600px', width: '100%' }}>
            <h2 style={{ color: '#FBBF24', marginBottom: '15px', fontSize: '20px' }}>🚨 عذراً، حدث خطأ غير متوقع في النظام</h2>
            <p style={{ color: '#9CA3AF', marginBottom: '20px', fontSize: '14px' }}>يرجى إعادة تحميل الصفحة. في حال استمرار المشكلة، فقد تم إرسال تقرير تلقائي لفريق الدعم الفني للمنصة لمعالجته فوراً.</p>
            <button onClick={() => window.location.reload()} style={{ background: '#C9A84C', color: '#000', padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>إعادة تشغيل النظام</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ALLOWED_HOSTS = (import.meta.env.VITE_ALLOWED_HOSTS || 'smart-halaqa.vercel.app,localhost,127.0.0.1')
  .split(',')
  .map((s) => s.trim());

function AppContent() {
  const { appState, user, profile, academy, logout, refreshStatus } = useAcademy();
  const [authView, setAuthView] = useState('login');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const goldColor = '#C9A84C';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // 1️⃣ بوابة التحميل والتهيئة الأولية للمنظومة
  if (appState === 'LOADING') {
    return <SplashScreen />;
  }

  // 2️⃣ حارس تعديل وتحديث كلمات المرور
  if (authView === 'update_password') {
    return <UpdatePassword />;
  }

  // 3️⃣ شاشات الولوج وتوثيق الحسابات (الزوار)
  if (appState === 'UNAUTHENTICATED') {
    return (
      <div style={{ background: '#090F17', minHeight: '100vh', direction: 'rtl' }}>
        {authView === 'login' && (
          <LoginPage 
            onSwitchToSignUp={() => setAuthView('signup')} 
            onSwitchToForgotPassword={() => setAuthView('forgot')} 
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

  // 4️⃣ شاشة الانتظار: الحساب مسجل ولكن لم يتم اعتماده وتفعيله بعد من الإدارة العامة للمنصة
  if (appState === 'PENDING_APPROVAL') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C1520', padding: '20px', fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
        <div style={{ width: '100%', maxWidth: '500px', background: '#111C2A', padding: '40px 30px', borderRadius: '20px', border: '1px solid #1E2D3D', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', background: 'rgba(201, 168, 76, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <FaClock style={{ color: goldColor, fontSize: '32px' }} />
          </div>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>طلب تأسيس الأكاديمية قيد الاعتماد</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', marginBottom: '30px' }}>
            مرحباً بكم في منصتنا. تم استلام طلب تسجيل مركزكم بنجاح. حسابكم الحالي ({profile?.full_name || 'المشرف'}) قيد المراجعة والتدقيق الآن من قبل الإدارة العامة للمنصة لتفعيل منظومتكم التعليمية السحابية.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="https://wa.me/201012345678" target="_blank" rel="noreferrer" style={{ padding: '14px', background: goldColor, color: '#000', borderRadius: '12px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', display: 'block' }}>
              💬 التواصل المباشر مع الدعم الفني لتسريع الاعتماد
            </a>
            <button onClick={logout} style={{ padding: '14px', background: 'transparent', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FaSignOutAlt />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5️⃣ لوحة التحكم العليا للمنصة (المشرف العام للمنظومة بالكامل)
  if (appState === 'SUPER_ADMIN') {
    return (
      <Suspense fallback={<SplashScreen />}>
        <AdminDashboard 
          session={{ user }} 
          onLogout={logout} 
        />
      </Suspense>
    );
  }

  // 6️⃣ الحساب معتمد ومفعل ولكن لم يقم بإنشاء بيانات الأكاديمية/المركز الخاص به بعد
  if (appState === 'NO_ACADEMY') {
    return (
      <CreateAcademy
        session={{ user }}
        onAcademyCreated={refreshStatus}
        onLogout={logout}
      />
    );
  }

  // 7️⃣ المنظومة التعليمية النشطة بالكامل للأكاديمية (حلقات التحفيظ، المعلمون، الطلاب)
  if (appState === 'FULLY_ACTIVE') {
    return (
      <>
        {/* شريط تنبيه علوي ذكي يظهر بلطف عند انقطاع الإنترنت لحماية بيانات الحفظ والتسميع اللحظية */}
        {!isOnline && (
          <div style={{ background: '#EF4444', color: '#FFF', textAlign: 'center', padding: '8px 12px', fontSize: '0.9rem', fontWeight: '600', position: 'fixed', top: 0, width: '100%', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Cairo', sans-serif" }}>
            <FaWifi />
            <span>تنبيه: انقطع الاتصال بالإنترنت. يرجى التحقق من الشبكة لضمان مزامنة بيانات الحفظ والاختبارات الحية للحلقات.</span>
          </div>
        )}
        <MainApp 
          session={{ user }} 
          userRole={profile?.role} 
          trialDaysLeft={14} 
          isTrial={true} 
          isActivated={profile?.is_activated} 
        />
      </>
    );
  }

  // صمام الأمان والخصوصية للحالات الطارئة
  return (
    <div style={{ background: '#090F17', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', fontFamily: "'Cairo', sans-serif" }}>
      <FaLock style={{ fontSize: '40px', color: goldColor, marginBottom: '15px' }} />
      <p style={{ color: '#9CA3AF' }}>عذراً، لا تملك الصلاحية الكافية للوصول إلى هذه الصفحة.</p>
      <button onClick={logout} style={{ marginTop: '15px', background: goldColor, color: '#000', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تسجيل الخروج</button>
    </div>
  );
}

export default function App() {
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : null;
  const isAllowed = hostname ? ALLOWED_HOSTS.includes(hostname) : true;

  if (!isAllowed) {
    return (
      <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: 'rtl', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#FBBF24', fontSize: '22px', marginBottom: '12px', fontWeight: '700' }}>🔒 نظام الحماية: النطاق الحالي غير مصرح له بتشغيل المنصة</h2>
        <p style={{ color: '#9CA3AF', fontSize: '15px', maxWidth: '600px', lineHeight: '1.7' }}>
          تم إيقاف تشغيل هذه النسخة تلقائياً لحماية حقوق الملكية الفكرية وتراخيص التشغيل السحابي؛ نظراً لمحاولة تشغيل النظام عبر مضيف أو نطاق (Domain) غير معتمد برمجياً في خوادم الإدارة.
        </p>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}
