import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; 
import { useTranslation } from 'react-i18next';

// استيراد المكونات الأساسية للنظام الخاص بك
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';

export default function App() {
  const { i18n } = useTranslation();
  
  // حالات التحكم في الواجهات والجلسات
  const [appLoading, setAppLoading] = useState(true); // تظهر فقط عند إقلاع التطبيق لأول مرة
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); 
  
  // تخزين بيانات الداشبورد مركزياً
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

  const isRtl = i18n.language === 'ar';

  // دالة مركزية ذكية لجلب بيانات الداشبورد بشكل مسبق
  const fetchDashboardDataCentral = async (userId) => {
    try {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('academies(id, name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (!staffError && staff?.academies) {
        const academyId = staff.academies.id;

        const [studentsResult, paymentsResult] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
          supabase.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'pending')
        ]);

        return { 
          academyName: staff.academies.name, 
          stats: { 
            students: studentsResult.count || 0, 
            pending: paymentsResult.count || 0 
          } 
        };
      }
    } catch (err) {
      console.error("Error fetching central dashboard data:", err);
    }
    return { academyName: '', stats: { students: 0, pending: 0 } };
  };

  useEffect(() => {
    // التقاط لغة العودة من رسائل التأكيد
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');

    if (urlLang) {
      i18n.changeLanguage(urlLang);
      localStorage.setItem('i18nextLng', urlLang);
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    // دالة التهيئة عند أول إقلاع للتطبيق فقط
    async function initializeApp() {
      const startTime = Date.now();
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        if (initialSession?.user?.id) {
          const fetchedData = await fetchDashboardDataCentral(initialSession.user.id);
          setDashboardData(fetchedData);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finaly {
        const elapsedTime = Date.now() - startTime;
        const desiredDuration = 2000; // بقاء الـ Splash لمدة 2 ثانية مريحة في أول فتحة للتطبيق فقط

        if (elapsedTime < desiredDuration) {
          setTimeout(() => setAppLoading(false), desiredDuration - elapsedTime);
        } else {
          setAppLoading(false);
        }
      }
    }

    initializeApp();

    // الاستماع لمتغيرات حالة المستخدم (تسجيل دخول، خروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      
      // 🌟 [تعديل جوهري]: عند نجاح تسجيل الدخول، نجلب البيانات فوراً دون المساس بـ appLoading لمنع ظهور Splash مرة ثانية!
      if (event === 'SIGNED_IN' && currentSession?.user?.id) {
        const fetchedData = await fetchDashboardDataCentral(currentSession.user.id);
        setDashboardData(fetchedData);
      }

      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
      }
    });

    if (window.location.hash.includes('type=recovery') || window.location.href.includes('type=recovery')) {
      setAuthView('update_password');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [i18n]);

  // ==========================================
  // منطق العرض الشرطي المستقر
  // ==========================================

  // الشاشة الافتتاحية تظهر فقط هنا عند أول فتح للموقع بالمتصفح
  if (appLoading) {
    return <SplashScreen />;
  }

  if (authView === 'update_password') {
    return (
      <div style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <UpdatePassword />
      </div>
    );
  }

  // بمجرد توفر الجلسة ينتقل فوراً وبسلاسة تامة دون وميض
  if (session) {
    return <MainApp session={session} preloadedDashboardData={dashboardData} setPreloadedDashboardData={setDashboardData} />;
  }

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
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
