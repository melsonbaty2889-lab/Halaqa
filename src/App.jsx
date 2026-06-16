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
  const [appLoading, setAppLoading] = useState(true); // الراية الحاكمة لكل عمليات التحميل في النظام
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); 
  
  // تخزين بيانات الداشبورد مركزياً لمنع تكرار التحميل والوميض المتتابع
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

  const isRtl = i18n.language === 'ar';

  // دالة مركزية ذكية لجلب بيانات الداشبورد بشكل مسبق وموازٍ قبل رفع الشاشة الافتتاحية
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
    // التقاط لغة العودة من رسائل التأكيد وقفل الخيار في ذاكرة المتصفح
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');

    if (urlLang) {
      i18n.changeLanguage(urlLang);
      localStorage.setItem('i18nextLng', urlLang);
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    // دالة التهيئة الشاملة لتنظيم التدفق البرمجي الموحد
    async function initializeApp() {
      try {
        // 1. جلب حالة التحقق الأولية من الجلسة الحالية عند إقلاع التطبيق
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        if (initialSession?.user?.id) {
          // إذا كان المستخدم مسجلاً لدخوله، نجلب بياناته وإحصائياته فوراً وهو لا يزال يرى الـ Splash
          const fetchedData = await fetchDashboardDataCentral(initialSession.user.id);
          setDashboardData(fetchedData);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        // ✨ اللحظة الحاسمة: لا نغلق شاشة الـ Splash إلا والتطبيق محمل وجاهز بالكامل بنسبة 100%
        setAppLoading(false);
      }
    }

    initializeApp();

    // الاستماع لمتغيرات حالة المستخدم وحفظ استقرارية العرض
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      
      if (event === 'SIGNED_IN' && currentSession?.user?.id) {
        setAppLoading(true);
        const fetchedData = await fetchDashboardDataCentral(currentSession.user.id);
        setDashboardData(fetchedData);
        setAppLoading(false);
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
  // 🛡️ منطق العرض الشرطي الموحد الصارم والمنظم بصرياً
  // ==========================================

  // إذا كان التطبيق في مرحلة التحميل الكلية، تظهر شاشة الـ Splash الفخمة فقط
  if (appLoading) {
    return <SplashScreen />;
  }

  // إذا التقط النظام حدث استعادة كلمة المرور
  if (authView === 'update_password') {
    return (
      <div style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <UpdatePassword />
      </div>
    );
  }

  // إذا انتهى التحميل بالكامل والمستخدم مسجل، تفتح لوحة التحكم محملة بالبيانات مسبقاً!
  if (session) {
    // نقوم بتمرير الـ dashboardData الجاهزة كـ Prop إلى تطبيقك الرئيسي ليتم استخدامها مباشرة
    return <MainApp session={session} preloadedDashboardData={dashboardData} setPreloadedDashboardData={setDashboardData} />;
  }

  // إذا انتهى التحميل والمستخدم غير مسجل، تظهر شاشات الـ Auth بدون شاشات تحميل بينهما
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
