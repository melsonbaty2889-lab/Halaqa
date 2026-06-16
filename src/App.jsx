import { useState, useEffect, Component } from 'react';
import { supabase } from './lib/supabase'; 
import { useTranslation } from 'react-i18next';

// استيراد المكونات الأساسية
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './.';
import MainApp from './components/MainApp';

// 🛡️ حزام الأمان العالمي لمنع أي انهيار مفاجئ في الواجهة (Error Boundary)
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

  // فحص آمن للذاكرة لمنع الانهيار الصامت في متصفحات الوضع الخفي (Incognito)
  const getBootStatusSafe = () => {
    try {
      return typeof window !== 'undefined' && !!sessionStorage.getItem('is_app_booted');
    } catch (e) {
      return false; 
    }
  };

  const isAlreadyBooted = getBootStatusSafe();
  
  // الحالات البرمجية المستقرة
  const [appLoading, setAppLoading] = useState(!isAlreadyBooted); 
  const [dataLoading, setDataLoading] = useState(false); // يتم تمريرها الآن كـ Prop للداشبورد لتفعيل الـ Skeletons
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); 
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

  const isRtl = i18n.language === 'ar';
  const userId = session?.user?.id;

  // دالة جلب البيانات المركزية فائقة السرعة
  const fetchDashboardDataCentral = async (uid) => {
    try {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('academies(id, name)')
        .eq('user_id', uid)
        .maybeSingle();

      if (!staffError && staff?.academies) {
        const academyId = staff.academies.id;
        
        // جلب الإحصائيات بالتوازي لتسريع الاستجابة
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

  // التأثير الأول: إدارة الجلسة ومؤقت الشاشة الافتتاحية المستقل
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

  // التأثير الثاني: مراقبة المستخدم وجلب بيانات الداشبورد في الخلفية
  useEffect(() => {
    let isCurrentRequest = true;
    if (!userId) {
      setDashboardData({ academyName: '', stats: { students: 0, pending: 0 } });
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    fetchDashboardDataCentral(userId).then(fetchedData => {
      if (isCurrentRequest) {
        setDashboardData(fetchedData);
        setDataLoading(false); // البيانات جاهزة، سيتم إخفاء الـ Skeletons داخل الداشبورد بنعومة
      }
    });
    return () => { isCurrentRequest = false; };
  }, [userId]);

  // ==========================================
  // العرض الشرطي الانسيابي (Fluid Render Flow)
  // ==========================================
  if (appLoading) return <SplashScreen />;
  if (authView === 'update_password') return <UpdatePassword />;

  // التوجيه المباشر والآمن إلى لوحة التحكم مع تمرير حالة التحميل الحالية لعمل الـ Skeletons
  if (session) {
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
