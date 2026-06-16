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
  const { i18n, t } = useTranslation();
  
  // حالات التحكم المركزية في التطبيق
  const [appLoading, setAppLoading] = useState(true); // الشاشة الحاكمة للإقلاع الأول
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); 
  
  // تخزين بيانات الداشبورد مركزياً لمنع الوميض المتتابع للأرقام
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

  const isRtl = i18n.language === 'ar';

  // دالة مركزية لجلب بيانات الداشبورد بشكل مسبق وموازٍ في الخلفية
  const fetchDashboardDataCentral = async (userId) => {
    try {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('academies(id, name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (!staffError && staff?.academies) {
        const academyId = staff.academies.id;

        // جلب الإحصائيات والمستحقات بالتوازي لسرعة خارقة
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
    // إدارة اللغة المنقولة عبر روابط التحقق الخارجية
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');

    if (urlLang) {
      i18n.changeLanguage(urlLang);
      localStorage.setItem('i18nextLng', urlLang);
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    let isMounted = true;
    let isInitialBoot = true; // ✨ صمام الأمان: متغير محلي لمنع تكرار الشاشة الافتتاحية نهائياً
    const startTime = Date.now();

    // 🔄 توحيد إدارة الجلسات والبيانات من مصدر تدفق واحد مستقر
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      // التعامل الفوري مع طلبات استعادة كلمة المرور
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
        return;
      }

      if (currentSession?.user?.id) {
        // [خطوة حاسمة] جلب البيانات أولاً في الخلفية والمستخدم لا يزال في الشاشة السابقة لمنع الوميض
        const fetchedData = await fetchDashboardDataCentral(currentSession.user.id);
        
        if (isMounted) {
          setDashboardData(fetchedData);
          setSession(currentSession); // يتم تفعيل الجلسة والبيانات معاً ككتلة واحدة
          
          // إغلاق الشاشة الافتتاحية إذا كان هذا الإقلاع الأول للموقع
          if (isInitialBoot) {
            isInitialBoot = false; // قفل الصمام فوراً
            const elapsedTime = Date.now() - startTime;
            const desiredDuration = 2000; // حد أدنى 2 ثانية للمظهر الفخم

            if (elapsedTime < desiredDuration) {
              setTimeout(() => { if (isMounted) setAppLoading(false); }, desiredDuration - elapsedTime);
            } else {
              setAppLoading(false);
            }
          }
        }
      } else {
        // في حال عدم وجود جلسة (صفحة تسجيل الدخول) أو عند خروج المستخدم
        if (isMounted) {
          setSession(null);
          setDashboardData({ academyName: '', stats: { students: 0, pending: 0 } });
          
          if (isInitialBoot) {
            isInitialBoot = false; // قفل الصمام
            const elapsedTime = Date.now() - startTime;
            const desiredDuration = 2000;

            if (elapsedTime < desiredDuration) {
              setTimeout(() => { if (isMounted) setAppLoading(false); }, desiredDuration - elapsedTime);
            } else {
              setAppLoading(false);
            }
          }
        }
      }
    });

    if (window.location.hash.includes('type=recovery') || window.location.href.includes('type=recovery')) {
      setAuthView('update_password');
    }

    // تنظيف المستمعات عند مغادرة المكون لمنع تسريب الذاكرة
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [i18n]);

  // ==========================================
  // العرض الشرطي النهائي المستقر بصرياً
  // ==========================================

  // 1. تظهر الشاشة الافتتاحية فقط عند أول تحميل للموقع في المتصفح
  if (appLoading) {
    return <SplashScreen />;
  }

  // 2. واجهة تحديث كلمة المرور
  if (authView === 'update_password') {
    return (
      <div style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <UpdatePassword />
      </div>
    );
  }

  // 3. التوجيه الفوري إلى التطبيق الرئيسي ممتلئاً بالبيانات مسبقاً وبدون أي ومضات
  if (session) {
    return <MainApp session={session} preloadedDashboardData={dashboardData} setPreloadedDashboardData={setDashboardData} />;
  }

  // 4. واجهات الحماية والدخول في حال عدم وجود جلسة نشطة
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
