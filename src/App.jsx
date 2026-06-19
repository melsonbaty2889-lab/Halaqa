import React, { useState, useEffect, Component, Suspense } from 'react';

// 🛡️ 1️⃣ استيراد المكونات ديناميكياً لحمايتها من الانهيار المفاجئ أثناء البناء
const LoginPage = React.lazy(() => import('./components/LoginPage'));
const SignUpPage = React.lazy(() => import('./components/SignUpPage'));
const ForgotPassword = React.lazy(() => import('./components/ForgotPassword'));
const UpdatePassword = React.lazy(() => import('./components/UpdatePassword'));
const MainApp = React.lazy(() => import('./components/MainApp'));

// 🚨 جدار الحماية المحلي لالتقاط انهيارات المكونات الداخلية وعرضها فوراً
class ComponentErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Crash inside component tree:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#111827', color: '#EF4444', minHeight: '100vh', fontFamily: 'monospace', direction: 'rtl', textAlign: 'right' }}>
          <h2 style={{ color: '#C9A84C', marginBottom: '10px' }}>🚨 رادار المكونات: تعطل عرض هذه الصفحة داخلياً</h2>
          <p style={{ color: '#9CA3AF' }}>تأكد من صحة التصدير (Export) أو التنسيقات داخل ملف الصفحة المتضررة:</p>
          <pre style={{ background: '#090F17', padding: '20px', borderRadius: '8px', overflow: 'auto', color: '#F3F4F6', border: '1px solid #374151', marginTop: '15px', fontSize: '13px', direction: 'ltr', textAlign: 'left' }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ background: '#C9A84C', color: '#090F17', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' }}>
            إعادة تحميل الصفحة 🔄
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 🧠 2️⃣ المكون الهيكلي لإدارة واجهة المنصة السحابية
function AppContent() {
  const [supabase, setSupabase] = useState(null);
  const [supabaseError, setSupabaseError] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authView, setAuthView] = useState('login');
  
  // إدارة شاشات التحميل الذكية
  const [appLoading, setAppLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false);

  // بيانات لوحة التحكم والجدار المالي (SaaS)
  const [subscriptionStatus, setSubscriptionStatus] = useState('trialing');
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

  // تحديد اتجاه اللغة برمجياً بدون مكتبات خارجية تسبب السواد
  const [currentLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('i18nextLng') || 'ar';
    }
    return 'ar';
  });
  const isRtl = currentLang === 'ar';
  const userId = session?.user?.id;

  // 🔌 استدعاء اتصال السوبابيس مع جدار حماية معزول
  useEffect(() => {
    import('./lib/supabase')
      .then((mod) => {
        if (mod && mod.supabase) {
          setSupabase(mod.supabase);
        } else {
          setSupabaseError("ملف الـ Supabase لم يقم بتصدير الكائن بشكل صحيح.");
        }
      })
      .catch((err) => {
        setSupabaseError(`فشل الاتصال بـ Supabase: ${err.message}`);
      });
  }, []);

  // 🔐 مراقبة حالة جلسة المستخدم وحذف لودر الـ HTML المدمج
  useEffect(() => {
    if (!supabase) return;

    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
    });

    const timer = setTimeout(() => {
      setAppLoading(false);
      const staticLoader = document.querySelector('.app-loading-screen');
      if (staticLoader) staticLoader.remove();
    }, 600);

    return () => {
      if (data?.subscription) data.subscription.unsubscribe();
    };
  }, [supabase]);

  // صمام أمان زمني لمنع تجميد الشاشة أثناء جلب البيانات بعد تسجيل الدخول
  useEffect(() => {
    if (session && !isInitialDataFetched) {
      const failSafe = setTimeout(() => setIsInitialDataFetched(true), 3000);
      return () => clearTimeout(failSafe);
    }
  }, [session, isInitialDataFetched]);

  // 📊 دالة جلب إحصائيات الأكاديمية وفحص صلاحية اشتراك الـ SaaS
  const fetchAcademyData = async (sb, uid) => {
    try {
      const { data: staff } = await sb.from('staff').select('academy_id').eq('user_id', uid).maybeSingle();
      if (!staff?.academy_id) return { academyName: '', status: 'expired', trialDaysLeft: 0, stats: { students: 0, pending: 0 } };

      const { data: academy } = await sb.from('academies').select('name, is_active, subscription_status, trial_ends_at').eq('id', staff.academy_id).maybeSingle();
      if (!academy) return { academyName: '', status: 'expired', trialDaysLeft: 0, stats: { students: 0, pending: 0 } };

      let days = 0;
      if (academy.trial_ends_at) {
        days = Math.ceil((new Date(academy.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
      }

      let status = academy.subscription_status || 'trialing';
      if (academy.is_active === false || (status === 'trialing' && days <= 0)) {
        status = 'expired';
      }

      const [studentsCount, paymentsCount] = await Promise.all([
        sb.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', staff.academy_id),
        sb.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', staff.academy_id).eq('status', 'pending')
      ]);

      return {
        academyName: academy.name,
        status: status,
        trialDaysLeft: days > 0 ? days : 0,
        stats: { students: studentsCount.count || 0, pending: paymentsCount.count || 0 }
      };
    } catch (e) {
      console.error(e);
      return { academyName: '', status: 'expired', trialDaysLeft: 0, stats: { students: 0, pending: 0 } };
    }
  };

  // 👥 التوجيه بناءً على دور المستخدم (أدمن / معلم / طالب) وحالة المحفظة المالية
  useEffect(() => {
    if (!supabase) return;
    if (!userId) {
      setUserRole(null);
      setIsInitialDataFetched(true);
      return;
    }

    // حساب الأدمن الماستر يتخطى الفحص المالي
    if (userId === 'cb4a2d6c-4e4f-4752-96e9-b21dd0f66cf9') {
      setUserRole('admin');
      setSubscriptionStatus('active');
      setIsInitialDataFetched(true);
      return;
    }

    setIsInitialDataFetched(false);
    setDataLoading(true);

    supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
      .then(async ({ data: profile }) => {
        const role = profile?.role ? profile.role.trim().toLowerCase().replace(/\s+/g, '_') : 'student';
        setUserRole(role);

        if (role !== 'admin') {
          const res = await fetchAcademyData(supabase, userId);
          setDashboardData(res);
          setSubscriptionStatus(res.status);
          setTrialDaysLeft(res.trialDaysLeft);
        }
      })
      .finally(() => {
        setDataLoading(false);
        setIsInitialDataFetched(true);
      });
  }, [supabase, userId]);

  // عزل وعرض أخطاء متغيرات بيئة السوبابيس فوراً
  if (supabaseError) {
    return (
      <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
        <h3>🚨 عطل في تهيئة الاتصال السحابي</h3>
        <p style={{ color: '#9CA3AF' }}>برجاء التحقق من كود السوبابيس الداخلي:</p>
        <pre style={{ background: '#111827', padding: '15px', borderRadius: '6px', color: '#FFF', direction: 'ltr', textAlign: 'left' }}>{supabaseError}</pre>
      </div>
    );
  }

  // لودر الانتظار النظيف أثناء قراءة الجلسة وحالة الـ SaaS
  if (!supabase || appLoading) {
    return (
      <div style={{ backgroundColor: "#090F17", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "#C9A84C", direction: "rtl", fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "24px", height: "24px", border: "2px solid rgba(201,168,76,0.1)", borderTop: "2px solid #C9A84C", borderRadius: "50%", animation: "spinCore 1s linear infinite", margin: "0 auto 10px auto" }}></div>
          <span style={{ fontSize: "13px", color: "#6B7280" }}>جاري موازنة الحماية وحالة المنصة...</span>
          <style>{`@keyframes spinCore { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (authView === 'update_password') return <Suspense fallback={null}><UpdatePassword /></Suspense>;

  // شاشة مزامنة البيانات قبل فتح لوحة التحكم
  if (session && !isInitialDataFetched) {
    return (
      <div style={{ backgroundColor: "#090F17", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#C9A84C", gap: "12px", fontFamily: 'sans-serif' }}>
        <div style={{ width: "28px", height: "28px", border: "2px solid rgba(201,168,76,0.1)", borderTop: "2px solid #C9A84C", borderRadius: "50%", animation: "spinData 0.8s linear infinite" }}></div>
        <style>{`@keyframes spinData { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: "13px", color: "#4B5563" }}>جاري مزامنة أصول الأكاديمية السحابية...</span>
      </div>
    );
  }

  // 💎 شاشة انتهاء الفترة التجريبية (الجدار المالي للـ SaaS)
  if (session) {
    if (userRole !== 'admin' && (subscriptionStatus === 'expired' || subscriptionStatus === 'past_due')) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#090F17', color: '#fff', padding: '20px', fontFamily: 'sans-serif', direction: isRtl ? 'rtl' : 'ltr' }}>
          <div style={{ background: '#111827', border: '1px solid #1F2937', padding: '35px', borderRadius: '16px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>💎</div>
            <h2 style={{ color: '#C9A84C', marginBottom: '12px', fontWeight: 'bold', fontSize: '22px' }}>
              {isRtl ? 'انتهت الفترة التجريبية للمنصة' : 'Trial Period Expired'}
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
              {isRtl 
                ? 'للاستمرار في إدارة أكاديميتك ومتابعة سجلات حضور الطلاب والتقارير المالية، يرجى تفعيل الباقة الاحترافية.'
                : 'To continue managing your academy, please activate the pro plan.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => window.open('https://thewinroute.com/checkout', '_blank')} style={{ width: '100%', background: '#C9A84C', color: '#090F17', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isRtl ? 'تفعيل الاشتراك الآن' : 'Activate Now'}
              </button>
              <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isRtl ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 🖥️ عرض اللوحة الرئيسية للتطبيق بعد اجتياز الحماية بنجاح
    return (
      <Suspense fallback={<div style={{ background: '#090F17', minHeight: '100vh' }} />}>
        <MainApp session={session} isDataLoading={dataLoading} dashboardData={dashboardData} setDashboardData={setDashboardData} userRole={userRole} trialDaysLeft={trialDaysLeft} />
      </Suspense>
    );
  }

  // 🚪 بوابات تسجيل الدخول والاشتراك للزوار الجدد
  return (
    <div style={{ background: '#090F17', minHeight: '100vh' }}>
      <Suspense fallback={
        <div style={{ backgroundColor: "#090F17", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "#C9A84C" }}>
          <div style={{ width: "24px", height: "24px", border: "2px solid rgba(201,168,76,0.1)", borderTop: "2px solid #C9A84C", borderRadius: "50%", animation: "spinAuth 1s linear infinite" }}></div>
          <style>{`@keyframes spinAuth { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
        {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
        {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
      </Suspense>
    </div>
  );
}

// 📦 3️⃣ التصدير النهائي الآمن والمحصن ضد التجمد
export default function App() {
  return (
    <ComponentErrorBoundary>
      <AppContent />
    </ComponentErrorBoundary>
  );
}
