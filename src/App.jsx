import { useState, useEffect } from 'react'; 
import { supabase } from './lib/supabase'; 
import { useTranslation } from 'react-i18next';

// 📦 استيراد المكونات الأساسية للمنصة
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';

export default function App() {
  const { t, i18n } = useTranslation();

  const getBootStatusSafe = () => {
    try {
      return typeof window !== 'undefined' && !!sessionStorage.getItem('is_app_booted');
    } catch (e) {
      return false; 
    }
  };

  const isAlreadyBooted = getBootStatusSafe();
  
  // 📊 الحالات الأساسية لإدارة التطبيق
  const [appLoading, setAppLoading] = useState(!isAlreadyBooted); 
  const [dataLoading, setDataLoading] = useState(false); 
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [authView, setAuthView] = useState('login'); 
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false); 

  // 💰 محرك الـ SaaS لإدارة الاشتراكات والجدار المالي
  const [subscriptionStatus, setSubscriptionStatus] = useState('trialing'); 
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);

  const isRtl = i18n.language === 'ar' || i18n.dir() === 'rtl';
  const userId = session?.user?.id;

  // 🌐 الدالة المركزية لفحص حالة اشتراك الأكاديمية وجلب إحصائياتها
  const fetchDashboardDataCentral = async (uid) => {
    try {
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('academy_id')
        .eq('user_id', uid)
        .maybeSingle();

      if (staffError || !staffData?.academy_id) {
        return { academyName: '', status: 'expired', trialDaysLeft: 0, stats: { students: 0, pending: 0 } };
      }

      const academyId = staffData.academy_id;

      const { data: academy, error: academyError } = await supabase
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
          supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
          supabase.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'pending')
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

  // 1️⃣ 🛠️ مراقبة الجلسة والتشغيل الأولي وحذف الدائرة الخضراء نهائياً
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang) {
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
    }, 1800);

    return () => {
      clearTimeout(bootTimer);
      if (data?.subscription) {
        data.subscription.unsubscribe();
      } else if (typeof data === 'function') {
        data();
      }
    };
  }, [i18n]);

  // 🛡️ 2️⃣ صمام الأمان الزمني (Fail-Safe) لمنع تجميد الشاشة أثناء جلب البيانات بعد تسجيل الدخول
  useEffect(() => {
    if (session && !isInitialDataFetched) {
      const dataFailSafeTimer = setTimeout(() => {
        setIsInitialDataFetched(true);
      }, 3500); 
      return () => clearTimeout(dataFailSafeTimer);
    }
  }, [session, isInitialDataFetched]);

  // 3️⃣ تتبع هوية المستخدم وتطبيق جدار الحماية المالي
  useEffect(() => {
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
          const fetchedData = await fetchDashboardDataCentral(userId);
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
  }, [userId]);

  // 🛑 التحكم في الشاشات العلوية الحرجة
  if (appLoading) return null; 
  if (authView === 'update_password') return <UpdatePassword />;

  // ✨ حل ذكي لمنع الشاشة السوداء المعلقة أثناء جلب بيانات الأكاديمية بعد تسجيل الدخول مباشرة
  if (session && !isInitialDataFetched) {
    return (
      <div style={{ backgroundColor: "#090F17", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#C9A84C", fontFamily: "sans-serif", gap: "15px" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid rgba(201, 168, 76, 0.1)", borderTop: "3px solid #C9A84C", borderRadius: "50%", animation: "spinApp 0.8s linear infinite" }}></div>
        <style>{`@keyframes spinApp { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: "14px", color: "#657585" }}>{isRtl ? 'جاري مزامنة بيانات الأكاديمية السحابية...' : 'Synchronizing cloud assets...'}</span>
      </div>
    );
  }

  // 💳 التحقق المالي عند وجود جلسة نشطة
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

  // 🔐 شاشات الحماية والمصادقة قبل تسجيل الدخول
  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', background: '#090F17', minHeight: '100vh' }}>
      {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
      {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
      {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
    </div>
  );
}
