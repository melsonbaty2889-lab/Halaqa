import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; 
import { useTranslation } from 'react-i18next';

// استيراد المكونات الأساسية الخاصة بنظامك
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';

export default function App() {
  const { i18n } = useTranslation();

  // ✨ [حصن الأمان]: فحص ذكي لمعرفة هل أقلع التطبيق مسبقاً في علامة التبويب الحالية؟
  const isAlreadyBooted = typeof window !== 'undefined' && sessionStorage.getItem('is_app_booted');
  
  // إذا أقلع مسبقاً، يتم إلغاء شاشة الإقلاع فوراً (false) لحظر التكرار الخبيث
  const [appLoading, setAppLoading] = useState(!isAlreadyBooted); 
  const [dataLoading, setDataLoading] = useState(false); // شاشة الحماية الفاخرة لمنع ومضات الأرقام والبيانات
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); 
  
  // الحالة المركزية لبيانات لوحة التحكم
  const [dashboardData, setDashboardData] = useState({ 
    academyName: '', 
    stats: { students: 0, pending: 0 } 
  });

  const isRtl = i18n.language === 'ar';
  const userId = session?.user?.id;

  // دالة مركزية آمنة ومستقلة لجلب بيانات الأكاديمية والداشبورد بالتوازي
  const fetchDashboardDataCentral = async (uid) => {
    try {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('academies(id, name)')
        .eq('user_id', uid)
        .maybeSingle();

      if (!staffError && staff?.academies) {
        const academyId = staff.academies.id;

        // جلب الإحصائيات بالتوازي لسرعة خارقة في الأداء
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

  // 1️⃣ [التأثير الأول]: مراقبة حالة الحساب وإدارة شاشة الإقلاع (خفيف، سريع ومستقل)
  useEffect(() => {
    // إدارة معلمات اللغة المنقولة عبر الروابط الخارجية
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang) {
      i18n.changeLanguage(urlLang);
      localStorage.setItem('i18nextLng', urlLang);
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    // الاستماع المتزامن لحالة الجلسات من Supabase بدون تعليق للواجهة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
      }
    });

    if (window.location.hash.includes('type=recovery') || window.location.href.includes('type=recovery')) {
      setAuthView('update_password');
    }

    // مؤقت زمني آمن ومستقل تماماً لإغلاق الـ Splash وحفظ حالتها لمنع تكرارها
    const bootTimer = setTimeout(() => {
      setAppLoading(false);
      // تأكيد فتح التطبيق بنجاح في ذاكرة التبويب الحالية
      sessionStorage.setItem('is_app_booted', 'true');
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(bootTimer);
    };
  }, [i18n]);

  // 2️⃣ [التأثير الثاني]: يراقب معرف المستخدم ويتحكم في جلب البيانات ومنع الومضات البصرية
  useEffect(() => {
    let isCurrentRequest = true;

    if (!userId) {
      setDashboardData({ academyName: '', stats: { students: 0, pending: 0 } });
      setDataLoading(false);
      return;
    }

    // تشغيل غطاء الحماية الناعم لحجب ومضات الأرقام الفارغة فوراً
    setDataLoading(true);

    fetchDashboardDataCentral(userId).then(fetchedData => {
      if (isCurrentRequest) {
        setDashboardData(fetchedData);
        setDataLoading(false); // إغلاق غطاء الحماية فور اكتمال البيانات وجاهزيتها 100%
      }
    });

    return () => {
      isCurrentRequest = false;
    };
  }, [userId]);


  // ==========================================
  // العرض الشرطي المستقر (Render Flow)
  // ==========================================

  // أولاً: شاشة الإقلاع المبدئية (تظهر فقط عند أول فتحة للموقع في التاب)
  if (appLoading) {
    return <SplashScreen />;
  }

  // ثانياً: شاشة الانتقال وحجب الومضات (تظهر لأجزاء من الثانية أثناء تبديل البيانات)
  if (dataLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#090F17', // الخلفية الداكنة المعتمدة لتطبيقك
        gap: '15px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255,255,255,0.03)',
          borderTop: '3px solid #C9A84C', // الحلقة الذهبية الفاخرة
          borderRadius: '50%',
          animation: 'spinAppTransition 1s linear infinite'
        }} />
        <style>{`@keyframes spinAppTransition { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ثالثاً: واجهة تحديث كلمة المرور
  if (authView === 'update_password') {
    return (
      <div style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <UpdatePassword />
      </div>
    );
  }

  // رابعاً: التوجيه المستقر والآمن إلى التطبيق الرئيسي ممتلئاً بالبيانات مسبقاً
  if (session) {
    return (
      <MainApp 
        session={session} 
        preloadedDashboardData={dashboardData} 
        setPreloadedDashboardData={setDashboardData} 
      />
    );
  }

  // خامساً: واجهات الحماية والدخول في حال عدم وجود جلسة نشطة
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
