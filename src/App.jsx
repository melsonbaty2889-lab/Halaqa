import React, { useState, useEffect, Component, Suspense } from 'react'; 
import { useTranslation } from 'react-i18next';

// 🛡️ 1️⃣ تحويل كافة المكونات إلى استيراد ديناميكي مؤجل (Lazy) لمنع انهيار بداية التشغيل
const LoginPage = React.lazy(() => import('./components/LoginPage'));
const SignUpPage = React.lazy(() => import('./components/SignUpPage'));
const ForgotPassword = React.lazy(() => import('./components/ForgotPassword'));
const UpdatePassword = React.lazy(() => import('./components/UpdatePassword'));
const MainApp = React.lazy(() => import('./components/MainApp'));

// 🛑 رادار الأعطال الذكي لالتقاط انهيارات الواجهة وعرض التقرير فوراً
class AppErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Critical Render Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#111827', color: '#EF4444', minHeight: '100vh', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }}>
          <h2 style={{ color: '#C9A84C', marginBottom: '10px' }}>🚨 الحارس البرمجي: تم رصد سبب الانهيار بنجاح!</h2>
          <p style={{ color: '#9CA3AF' }}>التطبيق تعطل بسبب هذا الخطأ الصريح في أحد الملفات الداخلية:</p>
          <pre style={{ background: '#090F17', padding: '20px', borderRadius: '8px', overflow: 'auto', color: '#F3F4F6', border: '1px solid #374151', marginTop: '15px', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ background: '#C9A84C', color: '#090F17', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' }}>
            إعادة تحميل المنصة 🔄
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 🧠 2️⃣ محتوى واجهة التطبيق الرئيسي المعزول
function AppContent() {
  const { i18n } = useTranslation();

  // حالات إدارة سوبابيس بشكل ديناميكي آمن
  const [supabase, setSupabase] = useState(null);
  const [supabaseError, setSupabaseError] = useState(null);

  const getBootStatusSafe = () => {
    try {
      return typeof window !== 'undefined' && !!sessionStorage.getItem('is_app_booted');
    } catch (e) {
      return false; 
    }
  };

  const isAlreadyBooted = getBootStatusSafe();
  
  // الحالات الأساسية لإدارة التطبيق
  const [appLoading, setAppLoading] = useState(!isAlreadyBooted); 
  const [dataLoading, setDataLoading] = useState(false); 
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [authView, setAuthView] = useState('login'); 
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false); 

  // محرك الـ SaaS لإدارة الاشتراكات والجدار المالي
  const [subscriptionStatus, setSubscriptionStatus] = useState('trialing'); 
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);

  const isRtl = i18n?.language === 'ar' || (typeof i18n?.dir === 'function' && i18n.dir() === 'rtl');
  const userId = session?.user?.id;

  // 🔌 جلب ملف السوبابيس ديناميكياً وعزله تماماً لحمايته من الانهيار البدئي
  useEffect(() => {
    import('./lib/supabase')
      .then((mod) => {
        if (mod && mod.supabase) {
          setSupabase(mod.supabase);
        } else {
          setSupabaseError("ملف Supabase لم يقم بتصدير كائن الاتصال بشكل صحيح.");
        }
      })
      .catch((err) => {
        setSupabaseError(err?.stack || err?.toString() || "فشل تحميل إعدادات اتصال Supabase السحابية.");
      });
  }, []);

  // الدالة المركزية لفحص حالة اشتراك الأكاديمية وجلب إحصائياتها
  const fetchDashboardDataCentral = async (sb, uid) => {
    try {
      const { data: staffData, error: staffError } = await sb
        .from('staff')
        .select('academy_id')
        .eq('user_id', uid)
        .maybeSingle();

      if (staffError || !staffData?.academy_id) {
        return { academyName: '', status: 'expired', trialDaysLeft: 0, stats: { students: 0, pending: 0 } };
      }

      const academyId = staffData.academy_id;

      const { data: academy, error: academyError } = await sb
        .from('academies')
        .select('name, is_active, subscription_status, trial_ends_at')
        .eq('id', academyId)
        .maybeSingle();

      if (!academyError && academy) {
        let daysLeft = 0;
        if (academy.trial_ends_at) {
          const diffTime = new Date(academy.trial_ends_at) - new Date();
          daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        let finalStatus = academy.subscription_status || 'trialing';
        
        if (academy.is_active === false) {
          finalStatus = 'expired'; 
        } else if (finalStatus === 'trialing' && daysLeft <= 0) {
          finalStatus = 'expired'; 
        }

        const [studentsResult, paymentsResult] = await Promise.all([
          sb.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
          sb.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'pending')
        ]);

        return { 
          academyName: academy.name, 
          status: finalStatus, 
          trialDaysLeft: daysLeft > 0 ? daysLeft : 0,
          stats: { students: studentsResult.count || 0, pending: paymentsResult.count || 0 } 
        };
      }
    } catch (err) {
      console.error("Error loading SaaS dashboard stats:", err);
    }
    return { academyName: '', status: 'expired', trialDaysLeft: 0, stats: { students: 0, pending: 0 } };
  };

  // مراقبة الجلسة والتشغيل الأولي وحذف الدائرة الخضراء برمجياً بعد التأكد من البيئة
  useEffect(() => {
    if (!supabase) return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && i18n) {
      i18n.changeLanguage(urlLang);
      localStorage.setItem('i18nextLng', urlLang);
    }

    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
    });

    const bootTimer = setTimeout(() => {
      setAppLoading(false);
      try {
        sessionStorage.setItem('is_app_booted', 'true');
      } catch (e) {}

      const staticLoader = document.querySelector('.app-loading-screen');
      if (staticLoader) {
        staticLoader.style.opacity = '0'; 
        setTimeout(() => staticLoader.remove(), 300); 
      }
    }, 1500);

    return () => {
      clearTimeout(bootTimer);
      if (data?.subscription) {
        data.subscription.unsubscribe();
      } else if (typeof data === 'function') {
        data();
      }
    };
  }, [supabase, i18n]);

  // صمام الأمان الزمني لمنع تجميد الواجهة بعد تسجيل الدخول
  useEffect(() => {
    if (session && !isInitialDataFetched) {
      const dataFailSafeTimer = setTimeout(() => {
        setIsInitialDataFetched(true);
      }, 3500); 
      return () => clearTimeout(dataFailSafeTimer);
    }
  }, [session, isInitialDataFetched]);

  // تتبع هوية المستخدم وتطبيق جدار الحماية المالي
  useEffect(() => {
    if (!supabase) return;

    let isCurrentRequest = true;
    if (!userId) {
      setDashboardData({ academyName: '', stats: { students: 0, pending: 0 } });
      setUserRole(null); 
      setDataLoading(false);
      setIsInitialDataFetched(true); 
      return;
    }

    if (userId === 'cb4a2d6c-4e4f-4752-96e9-b21dd0f66cf9') {
      setUserRole('admin');
      setSubscriptionStatus('active');
      setDataLoading(false);
      setIsInitialDataFetched(true);
      return;
    }

    setIsInitialDataFetched(false);
    setDataLoading(true);

    const loadUserDataAndRole = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;
        
        const role = profile?.role ? profile.role.trim().toLowerCase().replace(/\s+/g, '_') : 'student';

        if (isCurrentRequest) {
          setUserRole(role);
        }

        if (role !== 'admin') {
          const fetchedData = await fetchDashboardDataCentral(supabase, userId);
          if (isCurrentRequest) {
            setDashboardData(fetchedData);
            setSubscriptionStatus(fetchedData.status);
            setTrialDaysLeft(fetchedData.trialDaysLeft);
          }
        }
      } catch (err) {
        console.error("Error loading user profile or SaaS status:", err);
      } finally {
        if (isCurrentRequest) {
          setDataLoading(false);
          setIsInitialDataFetched(true); 
        }
      }
    };

    loadUserDataAndRole();

    return () => { isCurrentRequest = false; };
  }, [supabase, userId]);

  // 🚨 عرض خطأ السوبابيس إذا كان هو السبب الرئيسي للانهيار الصامت (مثل نقص الـ Env Variables)
  if (supabaseError) {
    return (
      <div style={{ padding: '30px', background: '#111827', color: '#EF4444', minHeight: '100vh', fontFamily: 'monospace', direction: 'rtl', textAlign: 'right' }}>
        <h2 style={{ color: '#C9A84C' }}>🚨 تم كشف الانهيار في اتصال السيرفر (Supabase Connection Failure)</h2>
        <p style={{ color: '#9CA3AF' }}>التطبيق توقف تماماً بسبب فشل قراءة ملف الاتصال بقاعدة البيانات. تأكد من إعداد متغيرات البيئة على فيرسل:</p>
        <pre style={{ background: '#090F17', padding: '20px', borderRadius: '8px', color: '#F3F4F6', border: '1px solid #374151', direction: 'ltr', textAlign: 'left', overflow: 'auto' }}>
          {supabaseError}
        </pre>
      </div>
    );
  }

  // التحكم في الشاشات العلوية الحرجة للمنصة
  if (!supabase || appLoading) {
    return (
      <div style={{ backgroundColor: "#090F17", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "#C9A84C", fontFamily: "sans-serif", direction: "rtl" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "24px", height: "24px", border: "2px solid rgba(201,168,76,0.1)", borderTop: "2px solid #C9A84C", borderRadius: "50%", animation: "spinCore 1s linear infinite", margin: "0 auto 10px auto" }}></div>
          <span style={{ fontSize: "13px", color: "#4b5966" }}>جاري موازنة جدار الحماية والملفات السحابية...</span>
          <style>{`@keyframes spinCore { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (authView === 'update_password') return <UpdatePassword />;

  if (session && !isInitialDataFetched) {
    return (
      <div style={{ backgroundColor: "#090F17", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#C9A84C", fontFamily: "sans-serif", gap: "15px" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid rgba(201, 168, 76, 0.1)", borderTop: "3px solid #C9A84C", borderRadius: "50%", animation: "spinAppCentral 0.8s linear infinite" }}></div>
        <style>{`@keyframes spinAppCentral { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: "14px", color: "#657585" }}>{isRtl ? 'جاري تهيئة قاعدة بيانات الأكاديمية...' : 'Synchronizing cloud assets...'}</span>
      </div>
    );
  }

  // الجدار المالي للاشتراكات
  if (session) {
    if (userRole !== 'admin' && (subscriptionStatus === 'expired' || subscriptionStatus === 'past_due')) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#090F17', color: '#fff', padding: '40px 20px', fontFamily: 'sans-serif', direction: isRtl ? 'rtl' : 'ltr' }}>
          <div style={{ background: '#111827', border: '1px solid #1F2937', padding: '40px', borderRadius: '16px', maxWidth: '550px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>💎</div>
            <h2 style={{ color: '#C9A84C', marginBottom: '15px', fontWeight: 'bold', fontSize: '24px' }}>
              {isRtl ? 'انتهت الفترة التجريبية للمنصة' : 'Your Trial Period Has Expired'}
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: '15px', lineHeight: '1.7', marginBottom: '30px' }}>
              {isRtl 
                ? 'سعداء جداً بتواجدك معنا! للاستمرار في إدارة أكاديميتك، ومتابعة سجلات حضور الطلاب، والتقارير المالية والاشتراكات، يرجى ترقية حسابك إلى الباقة الاحترافية الآن.'
                : 'We love having you here! To continue managing your academy, tracking student attendance, financial records, and invoices, please upgrade to the pro plan now.'}
            </p>

            <div style={{ border: '2px solid #C9A84C', background: 'rgba(201, 168, 76, 0.05)', borderRadius: '12px', padding: '24px', marginBottom: '30px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', background: '#C9A84C', color: '#090F17', padding: '4px 12px', borderRadius: '50px', fontWeight: 'bold' }}>
                {isRtl ? 'الأكثر مبيعاً' : 'Most Popular'}
              </span>
              <h3 style={{ fontSize: '20px', marginTop: '10px', fontWeight: 'bold' }}>{isRtl ? 'الباقة الاحترافية الكاملة' : 'Full Pro Plan'}</h3>
              <div style={{ margin: '15px 0', fontSize: '28px', fontWeight: 'bold', color: '#C9A84C' }}>
                $29 <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 'normal' }}>/ {isRtl ? 'شهرياً' : 'monthly'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => window.open('https://thewinroute.com/checkout', '_blank')} 
                style={{ width: '100%', background: '#C9A84C', color: '#090F17', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
              >
                {isRtl ? 'تفعيل الاشتراك الآن' : 'Activate Subscription Now'}
              </button>
              
              <button 
                onClick={() => supabase.auth.signOut()} 
                style={{ width: '100%', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
              >
                {isRtl ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <MainApp 
        session={session} 
        isDataLoading={dataLoading} 
        dashboardData={dashboardData} 
        setDashboardData={setDashboardData} 
        userRole={userRole} 
        trialDaysLeft={trialDaysLeft} 
      />
    );
  }

  // شاشات المصادقة قبل تسجيل الدخول
  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', background: '#090F17', minHeight: '100vh' }}>
      {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
      {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
      {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
    </div>
  );
}

// 📦 3️⃣ التصدير النهائي المغلف بـ Suspense و ErrorBoundary لحصار الأخطاء تماماً
export default function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={
        <div style={{ backgroundColor: "#090F17", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "#C9A84C" }}>
          <div style={{ width: "24px", height: "24px", border: "2px solid rgba(201,168,76,0.1)", borderTop: "2px solid #C9A84C", borderRadius: "50%", animation: "spinLazy 1s linear infinite" }}></div>
          <style>{`@keyframes spinLazy { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <AppContent />
      </Suspense>
    </AppErrorBoundary>
  );
}
