import { useState, useEffect, Component } from 'react'; 
import { supabase } from './lib/supabase'; 
import { useTranslation } from 'react-i18next';

// ✨ تأكيد المسارات الصحيحة 100% لـ Vite و Vercel ومنع خطأ "./."
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';
import { Skeleton } from './components/Skeleton'; 

// 🛡️ حزام الأمان لمنع انهيار الواجهة (Error Boundary)
class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Application Crashed:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#090F17', color: '#fff', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h2 style={{ color: '#C9A84C', marginBottom: '10px' }}>عذراً، حدث خطأ غير متوقع أثناء تحميل الواجهة</h2>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>جاري العمل على استقرار النظام تلقائياً</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', background: '#C9A84C', color: '#090F17', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>إعادة تحديث الصفحة</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainAppContainer() {
  const { i18n } = useTranslation();

  const getBootStatusSafe = () => {
    try {
      return typeof window !== 'undefined' && !!sessionStorage.getItem('is_app_booted');
    } catch (e) {
      return false; 
    }
  };

  const isAlreadyBooted = getBootStatusSafe();
  
  const [appLoading, setAppLoading] = useState(!isAlreadyBooted); 
  const [dataLoading, setDataLoading] = useState(false); 
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [authView, setAuthView] = useState('login'); 
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false); 

  const isRtl = i18n.language === 'ar';
  const userId = session?.user?.id;

  const fetchDashboardDataCentral = async (uid) => {
    try {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('academies(id, name)')
        .eq('user_id', uid)
        .maybeSingle();

      if (!staffError && staff?.academies) {
        const academyId = staff.academies.id;
        
        const [studentsResult, paymentsResult] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
          supabase.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'pending')
        ]);

        return { 
          academyName: staff.academies.name, 
          stats: { students: studentsResult.count || 0, pending: paymentsResult.count || 0 } 
        };
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
    return { academyName: '', stats: { students: 0, pending: 0 } };
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang) {
      i18n.changeLanguage(urlLang);
      localStorage.setItem('i18nextLng', urlLang);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
    });

    const bootTimer = setTimeout(() => {
      setAppLoading(false);
      try {
        sessionStorage.setItem('is_app_booted', 'true');
      } catch (e) {}
    }, 1800);

    return () => {
      subscription.unsubscribe();
      clearTimeout(bootTimer);
    };
  }, [i18n]);

  useEffect(() => {
    let isCurrentRequest = true;
    if (!userId) {
      setDashboardData({ academyName: '', stats: { students: 0, pending: 0 } });
      setUserRole(null); 
      setDataLoading(false);
      setIsInitialDataFetched(true); 
      return;
    }

    // 👑 حزام الأمان الخاص بحسابك الأدمن الرئيسي
    if (userId === 'cb4a2d6c-4e4f-4752-96e9-b21dd0f66cf9') {
      setUserRole('admin');
      setDataLoading(false);
      setIsInitialDataFetched(true);
      return;
    }

    setDataLoading(true);

    const loadUserDataAndRole = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;
        
        // 🛠️ معالجة ذكية: تحويل الأحرف لصغيرة واستبدال أي مسافة بشرطة سفلية لضمان مطابقة دقيقة
        const role = profile?.role ? profile.role.trim().toLowerCase().replace(/\s+/g, '_') : 'student';

        if (isCurrentRequest) {
          setUserRole(role);
        }

        if (role !== 'admin' && role !== 'pending_manager') {
          const fetchedData = await fetchDashboardDataCentral(userId);
          if (isCurrentRequest) {
            setDashboardData(fetchedData);
          }
        }
      } catch (err) {
        console.error("Error loading user profile or stats:", err);
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

  if (appLoading || (session && !isInitialDataFetched)) return <SplashScreen />;
  if (authView === 'update_password') return <UpdatePassword />;

  if (session) {
    // 1️⃣ شاشة الانتظار والمراجعة للحسابات الجديدة (تدعم اللغتين بناءً على اختيار المستخدم)
    if (userRole === 'pending_manager') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#090F17', color: '#fff', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', direction: isRtl ? 'rtl' : 'ltr' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#C9A84C', marginBottom: '15px', fontWeight: 'bold' }}>
            {isRtl ? 'طلب تسجيل الأكاديمية قيد المراجعة' : 'Academy Registration Pending Approval'}
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '15px', maxWidth: '450px', lineHeight: '1.7' }}>
            {isRtl 
              ? 'مرحباً بك! تم استلام طلبك بنجاح وهو الآن تحت التدقيق من قبل الإدارة العليا. سيتم تفعيل لوحة التحكم الخاصة بك فور الموافقة.'
              : 'Welcome! Your registration request has been successfully received and is currently under review by the super admin. Your dashboard will be activated upon approval.'}
          </p>
          <button 
            onClick={() => supabase.auth.signOut()} 
            style={{ marginTop: '30px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
            onMouseOver={(e) => { e.target.style.background = '#EF4444'; e.target.style.color = '#fff'; }}
            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#EF4444'; }}
          >
            {isRtl ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </div>
      );
    }

    // 2️⃣ دخول جميع الحسابات المعتمدة (بما فيهم حساب الأدمن بعد دمج اللوحات بنجاح)
    return (
      <MainApp 
        session={session} 
        isDataLoading={dataLoading} 
        dashboardData={dashboardData} 
        setDashboardData={setDashboardData} 
        userRole={userRole} // نمرر الـ role للوحة المدمجة لتهيئة الميزات الإدارية
      />
    );
  }

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', background: '#090F17', minHeight: '100vh' }}>
      {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
      {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
      {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainAppContainer />
    </ErrorBoundary>
  );
}
