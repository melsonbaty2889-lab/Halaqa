import { useState, useEffect, Component } from 'react'; 
import { supabase } from './lib/supabase'; 
import { useTranslation } from 'react-i18next';

// ✨ تأكيد المسارات الصحيحة 100% لـ Vite و Vercel ومنع خطأ "./."
import AdminDashboard from './components/AdminDashboard';
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';
import { Skeleton } from './components/Skeleton'; // مسار صريح وصحيح للـ Skeleton

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

  // فحص آمن للذاكرة لمنع الانهيار الصامت في متصفحات الوضع الخفي
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
  const [userRole, setUserRole] = useState(null); // 👑 حالة جديدة لتخزين صلاحية المستخدم الحالية
  const [authView, setAuthView] = useState('login'); 
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });
  
  // 🚀 الإضافة الجديدة: حالة تضمن عدم الانتقال السريع والمزعج قبل اكتمال جلب البيانات الأولية
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false); 

  const isRtl = i18n.language === 'ar';
  const userId = session?.user?.id;

  // دالة جلب البيانات المركزية
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

  // تأثير إدارة الجلسة ومؤقت الشاشة الافتتاحية
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

  // 🛠️ تأثير مراقبة البيانات المحدث: جلب دور المستخدم وبيانات لوحة التحكم بدقة
  useEffect(() => {
    let isCurrentRequest = true;
    if (!userId) {
      setDashboardData({ academyName: '', stats: { students: 0, pending: 0 } });
      setUserRole(null); // إعادة تعيين الدور عند خروج المستخدم
      setDataLoading(false);
      setIsInitialDataFetched(true); 
      return;
    }

    setDataLoading(true);

    const loadUserDataAndRole = async () => {
      try {
        // 1. جلب دور المستخدم من جدول profiles لتحديد واجهته المستهدفة
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;
        const role = profile?.role || null;

        if (isCurrentRequest) {
          setUserRole(role);
        }

        // 2. جلب بيانات الأكاديمية العادية فقط إذا لم يكن المستخدم "أدمن النظام"
        if (role !== 'admin') {
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

  // 🔒 دمج منطق الشاشة الافتتاحية: لن تختفي الشاشة إلا بعد انتهاء العداد وتوافر بيانات المستخدم بالكامل
  if (appLoading || (session && !isInitialDataFetched)) return <SplashScreen />;
  if (authView === 'update_password') return <UpdatePassword />;

  if (session) {
    // 👑 تحويل تلقائي وذكي للسوبر أدمن إلى لوحته المخصصة لإدارة الطلبات
    if (userRole === 'admin') {
      return <AdminDashboard />;
    }

    return (
      <MainApp 
        session={session} 
        isDataLoading={dataLoading} 
        dashboardData={dashboardData} 
        setDashboardData={setDashboardData} 
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
