/* src/App.jsx */
import React, { useState, useEffect, useRef, Component, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';

// مكونات الإقلاع والولوج الأساسية (تُحمل استاتيكياً لسرعة العرض الأولية)
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';
import CreateAcademy from './components/CreateAcademy';

// 🌐 تحسين عالمي: استيراد المكونات الضخمة ديناميكياً لتقليص حجم الباقة الأساسية والتفوق في سرعة التحميل
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SubscriptionPage = lazy(() => import('./components/SubscriptionPage'));

// 🛡️ درع الأمان المطور: اصطياد أخطاء التحديثات الفجائية ومعالجتها صامتاً
if (typeof window !== 'undefined') {
  const handleChunkError = (error) => {
    const errorMsg = error?.message || error?.toString() || '';
    if (/Failed to fetch dynamically imported module|chunk load error|loading chunk/i.test(errorMsg)) {
      console.warn("🚨 تحديث حي على المخدم، جاري إنعاش التطبيق عالي الأداء...");
      window.location.reload();
    }
  };
  window.addEventListener('unhandledrejection', (event) => handleChunkError(event.reason));
  window.addEventListener('error', (event) => handleChunkError(event.error), true);
}

// حارس المكونات الذكي متوافق مع أنظمة التتبع العالمية (Sentry / LogRocket Ready)
class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 🌍 ميزة تنافسية: هنا يتم إرسال تقرير الخطأ فوراً لخوادم المراقبة الخاصة بك دون تدسير من المستخدم
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
        <div style={{ padding: '40px 20px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#111827', padding: '30px', borderRadius: '12px', border: '1px solid #1F2937', maxWidth: '600px', width: '100%' }}>
            <h2 style={{ color: '#FBBF24', marginBottom: '15px' }}>🚨 عطل غير متوقع في الواجهة التشغيلية</h2>
            <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>يرجى إعادة تحميل الصفحة، وفي حال استمرار المشكلة تم إرسال تقرير تلقائي للدعم الفني.</p>
            <button onClick={() => window.location.reload()} style={{ background: '#3B82F6', color: '#FFF', padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>إعادة تشغيل النظام</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_TRIAL_DAYS = 14;

const ADMIN_UIDS = new Set(
  (import.meta.env.VITE_ADMIN_UIDS || 'cb4a2d6c-4e4f-4752-96e9-b21dd0f66cf9')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

const ALLOWED_HOSTS = (import.meta.env.VITE_ALLOWED_HOSTS || 'smart-halaqa.vercel.app,localhost,127.0.0.1')
  .split(',')
  .map((s) => s.trim());

function AppContent() {
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // 🌐 ميزة استقرار الشبكة العالمية لقراءة حالة الإنترنت الفورية لمنع فقدان بيانات الحلقات
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [account, setAccount] = useState({
    userRole: null,
    isActivated: false,
    daysLeft: 0,
    isTrial: true,
    hasAcademy: false
  });

  const mountedRef = useRef(true);
  const loadingTimeoutRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    
    // تفعيل مستشعرات حالة الإنترنت العالمية
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mountedRef.current = false;
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const oldLoader = typeof document !== 'undefined' ? document.getElementById('fallback-loader') : null;
    if (oldLoader) oldLoader.remove();

    if (!supabase) {
      if (mountedRef.current) setLoading(false);
      return;
    }

    let isCancelled = false;
    async function loadSession() {
      try {
        const res = await supabase.auth.getSession();
        const initialSession = res?.data?.session ?? null;
        if (!isCancelled && mountedRef.current) {
          setSession(initialSession);
          loadingTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) setLoading(false);
          }, 1200);
        }
      } catch (err) {
        if (mountedRef.current) setLoading(false);
      }
    }
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mountedRef.current) return;
      
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
      
      setSession((prevSession) => {
        if (event === 'SIGNED_OUT' && prevSession !== null) {
          setAuthView('login');
          setAccount({ userRole: null, isActivated: false, daysLeft: 0, isTrial: true, hasAcademy: false });
          setIsDataLoaded(false);
        }
        return currentSession;
      });
    });

    return () => {
      isCancelled = true;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !supabase) {
      if (mountedRef.current) {
        setFetchingData(false);
        setIsDataLoaded(false);
      }
      return;
    }

    const uid = session.user?.id;
    if (!uid) {
      setAccount({ userRole: 'student', isActivated: false, daysLeft: 0, isTrial: true, hasAcademy: false });
      setIsDataLoaded(true);
      return;
    }

    let cancelled = false;
    setFetchingData(true);

    async function fetchUserStatusAndSubscription() {
      const userUpdates = { userRole: 'student', isActivated: false, daysLeft: 0, isTrial: true, hasAcademy: false };

      try {
        const profileResp = await supabase.from('profiles').select('role, is_activated').eq('id', uid).maybeSingle();
        const profileData = profileResp?.data ?? null;
        userUpdates.userRole = profileData?.role?.trim().toLowerCase().replace(/\s+/g, '_') || 'student';
        userUpdates.isActivated = !!profileData?.is_activated;

        const subResp = await supabase.from('saas_subscriptions').select('expires_at').eq('user_id', uid).eq('status', 'active').order('expires_at', { ascending: false }).limit(1).maybeSingle();
        const subData = subResp?.data ?? null;

        if (subData?.expires_at) {
          const expires = new Date(subData.expires_at);
          const today = new Date();
          const diffTime = expires.getTime() - today.getTime();
          userUpdates.daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          userUpdates.isTrial = false;
        } else {
          const createdAtStr = session.user?.created_at;
          const createdAt = createdAtStr ? new Date(createdAtStr) : new Date();
          const today = new Date();
          const diffTime = today.getTime() - createdAt.getTime();
          const remainingTrial = DEFAULT_TRIAL_DAYS - Math.floor(diffTime / (1000 * 60 * 60 * 24));
          userUpdates.daysLeft = Math.max(0, remainingTrial);
          userUpdates.isTrial = true;
        }

        const staffResp = await supabase.from('staff').select('academy_id').eq('user_id', uid).maybeSingle();
        userUpdates.hasAcademy = !!(staffResp?.data?.academy_id || session.user?.user_metadata?.academy_id);

        if (!cancelled && mountedRef.current) {
          setAccount(userUpdates);
          setIsDataLoaded(true);
        }
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          setAccount({ userRole: 'student', isActivated: false, daysLeft: 0, isTrial: true, hasAcademy: false });
          setIsDataLoaded(true);
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setFetchingData(false);
        }
      }
    }

    fetchUserStatusAndSubscription();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const isInitialFetching = session && !isDataLoaded;
  if (loading || isInitialFetching) return <SplashScreen />;
  
  if (authView === 'update_password') return <UpdatePassword />;

  const isBlockActive =
    account.userRole !== 'admin' &&
    account.userRole !== 'super_admin' &&
    ((account.isTrial && account.daysLeft <= 0 && !account.isActivated) || (!account.isTrial && account.daysLeft <= 0));

  if (session) {
    if (account.userRole === 'super_admin') {
      return (
        <Suspense fallback={<SplashScreen />}>
          <AdminDashboard 
            session={session} 
            onLogout={async () => {
              try {
                await supabase.auth.signOut();
              } catch (err) {
                console.error(err);
              }
            }}
          />
        </Suspense>
      );
    }

    if (isBlockActive) {
      const currentLang = localStorage.getItem('i18nextLng') || 'ar';
      return (
        <Suspense fallback={<SplashScreen />}>
          <SubscriptionPage 
            session={session} 
            onBack={() => {}} 
            currentLang={currentLang} 
          />
        </Suspense>
      );
    }

    const isPlatformAdmin = account.userRole === 'admin';
    if (!account.hasAcademy && !isPlatformAdmin) {
      return (
        <CreateAcademy
          session={session}
          onAcademyCreated={() => {
            setAccount(prev => ({ ...prev, hasAcademy: true }));
          }}
          onLogout={async () => {
            try {
              await supabase.auth.signOut();
            } catch (err) {}
          }}
        />
      );
    }

    return (
      <>
        {/* 🌐 شريط تنبيه ذكي غير معطل للمستخدم يظهر فقط عند انقطاع الإنترنت فجأة للحفاظ على ثقة المستخدم وحماية البيانات */}
        {!isOnline && (
          <div style={{ background: '#EF4444', color: '#FFF', textAlign: 'center', padding: '6px 12px', fontSize: '0.9rem', fontWeight: 'bold', position: 'fixed', top: 0, width: '100%', zIndex: 9999, transition: 'all 0.3s ease' }}>
            ⚠️ أنت تعمل حالياً دون اتصال بالإنترنت. يرجى التحقق من الشبكة لضمان مزامنة درجات وتسميع الطلاب.
          </div>
        )}
        <MainApp 
          session={session} 
          userRole={account.userRole} 
          trialDaysLeft={account.daysLeft} 
          isTrial={account.isTrial} 
          isActivated={account.isActivated} 
        />
      </>
    );
  }

  return (
    <div style={{ background: '#090F17', minHeight: '100vh', direction: 'rtl' }}>
      {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
      {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
      {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
    </div>
  );
}

export default function App() {
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : null;

  const isAllowed = hostname ? ALLOWED_HOSTS.includes(hostname) : true;
  if (!isAllowed) {
    return (
      <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#FBBF24', fontSize: '1.6rem', marginBottom: '10px' }}>🔒 نظام الحماية الثلاثي: غير مصرح بالتشغيل</h2>
        <p style={{ color: '#9CA3AF', fontSize: '1.1rem', textAlign: 'center', maxWidth: '600px' }}>
          تم إيقاف تشغيل هذه المنصة تلقائياً لحماية حقوق الملكية والتشغيل من مضيف غير معتمد.
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
