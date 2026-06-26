/* src/App.jsx */
import React, { useState, useEffect, useRef, Component } from 'react';
import { supabase } from './lib/supabase';

import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';
import SubscriptionPage from './components/SubscriptionPage';
import CreateAcademy from './components/CreateAcademy';

// Error boundary must be a class component
class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // TODO: replace with real logging/telemetry
    // console.error('GlobalErrorBoundary caught:', { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right' }}>
          <h2 style={{ color: '#FBBF24' }}>🚨 رادار الواجهة: عطل داخلي في المكونات</h2>
          <pre style={{ background: '#111827', padding: '20px', color: '#FFF', direction: 'ltr', textAlign: 'left', overflow: 'auto', border: '1px solid #374151', borderRadius: '8px' }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_TRIAL_DAYS = 14;
// Prefer environment-configured admin list and allowed hosts
const ADMIN_UIDS = new Set(
  (process.env.REACT_APP_ADMIN_UIDS || 'cb4a2d6c-4e4f-4752-96e9-b21dd0f66cf9')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);
const ALLOWED_HOSTS = (process.env.REACT_APP_ALLOWED_HOSTS || 'smart-halaqa.vercel.app,localhost,127.0.0.1')
  .split(',')
  .map((s) => s.trim());

function AppContent() {
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);

  const [userRole, setUserRole] = useState(null);
  const [isActivated, setIsActivated] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [isTrial, setIsTrial] = useState(true);
  const [hasAcademy, setHasAcademy] = useState(false);

  // refs to avoid setting state after unmount and to clear timers
  const mountedRef = useRef(true);
  const loadingTimeoutRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Remove fallback loader if present
    const oldLoader = typeof document !== 'undefined' ? document.getElementById('fallback-loader') : null;
    if (oldLoader) oldLoader.remove();

    if (!supabase) {
      if (mountedRef.current) setLoading(false);
      return;
    }

    // initial session
    let isCancelled = false;
    async function loadSession() {
      try {
        const res = await supabase.auth.getSession();
        const initialSession = res?.data?.session ?? null;
        if (!isCancelled && mountedRef.current) {
          setSession(initialSession);
          // keep a short splash; store timeout ref so we can clear on unmount
          loadingTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) setLoading(false);
          }, 1200);
        }
      } catch (err) {
        if (mountedRef.current) setLoading(false);
      }
    }
    loadSession();

    // subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mountedRef.current) return;
      
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
      
      // 💡 حل مشكلة طرد المستخدم من صفحة الـ SignUp تلقائياً
      setSession((prevSession) => {
        if (event === 'SIGNED_OUT' && prevSession !== null) {
          setAuthView('login');
          setUserRole(null);
          setIsActivated(false);
          setHasAcademy(false);
        }
        return currentSession;
      });
    });
    const subscription = data?.subscription ?? data?.value ?? null;

    return () => {
      isCancelled = true;
      if (subscription?.unsubscribe) {
        try {
          subscription.unsubscribe();
        } catch (e) {
          // ignore unsubscribe errors
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!session || !supabase) {
      if (mountedRef.current) setFetchingData(false);
      return;
    }

    const uid = session.user?.id;
    if (!uid) {
      setUserRole('student');
      setIsActivated(false);
      setIsTrial(true);
      setDaysLeft(0);
      setHasAcademy(false);
      return;
    }

    // fast-path admin UIDs
    if (ADMIN_UIDS.has(uid)) {
      setUserRole('admin');
      setIsActivated(true);
      setDaysLeft(999);
      setIsTrial(false);
      setHasAcademy(true);
      setFetchingData(false);
      return;
    }

    let cancelled = false;
    setFetchingData(true);

    async function fetchUserStatusAndSubscription() {
      try {
        // profile
        const profileResp = await supabase
          .from('profiles')
          .select('role, is_activated')
          .eq('id', uid)
          .maybeSingle();

        const profileData = profileResp?.data ?? null;
        const calculatedRole = profileData?.role?.trim().toLowerCase().replace(/\s+/g, '_') || 'student';
        const calculatedActivation = !!profileData?.is_activated;

        if (!cancelled && mountedRef.current) {
          setUserRole(calculatedRole);
          setIsActivated(calculatedActivation);
        }

        // subscription
        const subResp = await supabase
          .from('saas_subscriptions')
          .select('expires_at')
          .eq('user_id', uid)
          .eq('status', 'active')
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const subData = subResp?.data ?? null;

        if (!cancelled && mountedRef.current) {
          if (subData?.expires_at) {
            const expires = new Date(subData.expires_at);
            const today = new Date();
            const diffTime = expires.getTime() - today.getTime();
            const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysLeft(Math.max(0, remainingDays));
            setIsTrial(false);
          } else {
            // trial calculation using user.created_at (fallback)
            const createdAtStr = session.user?.created_at;
            const createdAt = createdAtStr ? new Date(createdAtStr) : new Date();
            const today = new Date();
            const diffTime = today.getTime() - createdAt.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const remainingTrial = DEFAULT_TRIAL_DAYS - diffDays;
            setDaysLeft(Math.max(0, remainingTrial));
            setIsTrial(true);
          }
        }

        // academy (staff) check
        const staffResp = await supabase
          .from('staff')
          .select('academy_id')
          .eq('user_id', uid)
          .maybeSingle();

        const academyIdFromDb = staffResp?.data?.academy_id;
        const academyIdFromMeta = session.user?.user_metadata?.academy_id;

        if (!cancelled && mountedRef.current) {
          setHasAcademy(!!(academyIdFromDb || academyIdFromMeta));
        }
      } catch (err) {
        if (mountedRef.current) {
          setUserRole('student');
          setIsActivated(false);
          setDaysLeft(0);
          setIsTrial(true);
          setHasAcademy(false);
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

  // 💡 إصلاح جوهري: منع تدمير شجرة المكونات وفقدان البيانات أثناء جلب البيانات بالخلفية.
  // يتم عرض الـ SplashScreen فقط في التحميل الأولي للموقع أو إذا كانت الجلسة نشطة ولم يتم جلب الـ Role بعد.
  const isInitialFetching = session && fetchingData && userRole === null;
  if (loading || isInitialFetching) return <SplashScreen />;
  
  if (authView === 'update_password') return <UpdatePassword />;

  // computed block: when the platform should block access
  const isBlockActive =
    userRole !== 'admin' &&
    ((isTrial && daysLeft <= 0 && !isActivated) || (!isTrial && daysLeft <= 0));

  if (session) {
    if (isBlockActive) {
      return <SubscriptionPage session={session} onBack={() => {/* optionally: setAuthView('login') */}} />;
    }

    const isPlatformAdmin = userRole === 'admin' || userRole === 'super_admin';
    if (!hasAcademy && !isPlatformAdmin) {
      return (
        <CreateAcademy
          session={session}
          onAcademyCreated={() => {
            // immediate, local update — no hard reload
            setHasAcademy(true);
          }}
          onLogout={async () => {
            try {
              await supabase.auth.signOut();
            } catch (err) {
              // console.warn('Logout failed', err);
            }
          }}
        />
      );
    }

    return <MainApp session={session} userRole={userRole} trialDaysLeft={daysLeft} isTrial={isTrial} />;
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
  // safe check for SSR
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : null;

  const isAllowed = hostname ? ALLOWED_HOSTS.includes(hostname) : true;
  if (!isAllowed) {
    return (
      <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#FBBF24', fontSize: '1.6rem', marginBottom: '10px' }}>🔒 نظام الحماية الثلاثي: غير مصرح بالتشغيل</h2>
        <p style={{ color: '#9CA3AF', fontSize: '1.1rem', textAlign: 'center', maxWidth: '600px' }}>
          تم إيقاف تشغيل هذه المنصة تلقائياً لحماية حقوق الملكية والتشغيل من مضيف غير معتمد.
          تواصل مع فريق الدعم أو شغّل التطبيق على نطاق معتمد.
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
