import { useState, useEffect, useRef } from 'react';
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
  
  // حالات التحكم المركزية في التطبيق
  const [appLoading, setAppLoading] = useState(true); // شاشة الإقلاع الأول للموقع
  const [authLoading, setAuthLoading] = useState(false); // ✨ شاشة الانتقال الناعم لمنع الومضات أثناء تسجيل الدخول
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); 
  
  // تخزين بيانات الداشبورد مركزياً لمنع الوميض المتتابع للأرقام
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

  const isRtl = i18n.language === 'ar';

  // 🌟 صمام أمان حقيقي مستقر في الذاكرة ولا يتأثر بإعادة تشغيل الكود أو المكونات إطلاقاً
  const isInitialBoot = useRef(true); 

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

    const startTime = Date.now();

    // 🔄 تثبيت مصدر تدفق الجلسات والبيانات بشكل أحادي ومستقر
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
        return;
      }

      // ✨ [تطوير حاسم]: إذا سجل المستخدم دخوله والتطبيق شغال، نفتح غطاء التحميل الناعم فوراً لحجب الومضات البصرية
      if (event === 'SIGNED_IN' && !isInitialBoot.current) {
        setAuthLoading(true);
      }

      if (currentSession?.user?.id) {
        // جلب البيانات في الخلفية والمستخدم يرى غطاء الحماية
        const fetchedData = await fetchDashboardDataCentral(currentSession.user.id);
        
        setDashboardData(fetchedData);
        setSession(currentSession); // يتم تفعيل الجلسة والبيانات معاً ككتلة واحدة صلبة
        setAuthLoading(false); // إغلاق غطاء حجب الومضات

        // إدارة إغلاق الشاشة الافتتاحية الأساسية (للمرة الأولى فقط في المتصفح)
        if (isInitialBoot.current) {
          isInitialBoot.current = false; // قفل الصمام للأبد
          const elapsedTime = Date.now() - startTime;
          const desiredDuration = 2000; // بقاء فخم ومريح لمدة 2 ثانية في أول فتحة للموقع

          if (elapsedTime < desiredDuration) {
            setTimeout(() => setAppLoading(false), desiredDuration - elapsedTime);
          } else {
            setAppLoading(false);
          }
        }
      } else {
        // في حال عدم وجود جلسة (صفحة تسجيل الدخول)
        setSession(null);
        setDashboardData({ academyName: '', stats: { students: 0, pending: 0 } });
        setAuthLoading(false);

        if (isInitialBoot.current) {
          isInitialBoot.current = false; // قفل الصمام للأبد
          const elapsedTime = Date.now() - startTime;
          const desiredDuration = 2000;

          if (elapsedTime < desiredDuration) {
            setTimeout(() => setAppLoading(false), desiredDuration - elapsedTime);
          } else {
            setAppLoading(false);
          }
        }
      }
    });

    if (window.location.hash.includes('type=recovery') || window.location.href.includes('type=recovery')) {
      setAuthView('update_password');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []); // ✨ مصفوفة فارغة تماماً تضمن عدم تكرار بناء المستمع إطلاقاً عند تبديل اللغات أو الواجهات

  // ==========================================
  // العرض الشرطي المحصّن والنهائي
  // ==========================================

  // 1. شاشة الـ Splash الفخمة (تظهر مرة واحدة فقط عند إقلاع الموقع الأول بالمتصفح)
  if (appLoading) {
    return <SplashScreen />;
  }

  // 2. شاشة الانتقال السائل (تظهر لأجزاء من الثانية أثناء الضغط على "تسجيل الدخول" لحجب الومضات البصرية)
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#090F17', // نفس الخلفية المظلمة الفخمة للموقع الخاص بك
        gap: '15px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255,255,255,0.03)',
          borderTop: '3px solid #C9A84C', // اللون الذهبي الفخم المعتمد لـ "الحلقة الذكية"
          borderRadius: '50%',
          animation: 'spinTransition 1s linear infinite'
        }} />
        <style>{`@keyframes spinTransition { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 3. واجهة تحديث كلمة المرور
  if (authView === 'update_password') {
    return (
      <div style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <UpdatePassword />
      </div>
    );
  }

  // 4. التوجيه الفوري والمستقر إلى التطبيق الرئيسي ممتلئاً بالبيانات مسبقاً وبدون أي ومضات
  if (session) {
    return <MainApp session={session} preloadedDashboardData={dashboardData} setPreloadedDashboardData={setDashboardData} />;
  }

  // 5. واجهات الحماية والدخول في حال عدم وجود جلسة نشطة
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
