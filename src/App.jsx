import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useTranslation } from 'react-i18next';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';

export default function App({ onAppReady }) {
  const { i18n } = useTranslation();
  const [appLoading, setAppLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [subscriptionStatus, setSubscriptionStatus] = useState('trialing');
  const isRtl = i18n.language === 'ar';

  // 1. مراقبة الجلسة والتحقق من صلاحية الاشتراك
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
      
      if (currentSession) {
        checkSubscription(currentSession.user.id);
      }
    });

    // تايمر أمان لفك قفل الشاشة مهما حدث
    const bootTimer = setTimeout(() => {
      setAppLoading(false);
      if (onAppReady) onAppReady();
    }, 1500);

    return () => {
      clearTimeout(bootTimer);
      if (data?.subscription) data.subscription.unsubscribe();
    };
  }, [onAppReady]);

  // 2. منطق الحماية: فحص حالة الأكاديمية (جدار الحماية المالي)
  const checkSubscription = async (uid) => {
    setDataLoading(true);
    try {
      // جلب بيانات الموظف والأكاديمية
      const { data: staff } = await supabase
        .from('staff')
        .select('academies(subscription_status, is_active)')
        .eq('user_id', uid)
        .maybeSingle();

      if (staff?.academies) {
        const acc = staff.academies;
        if (acc.is_active === false || acc.subscription_status === 'expired') {
          setSubscriptionStatus('expired');
        } else {
          setSubscriptionStatus('active');
        }
      }
    } catch (e) {
      console.error("Auth Guard Error:", e);
    } finally {
      setDataLoading(false);
    }
  };

  if (appLoading) return null; // نترك index.html يعرض الشاشة الخضراء
  if (authView === 'update_password') return <UpdatePassword />;

  // 3. عرض التطبيق أو شاشة الحظر
  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', background: '#090F17', minHeight: '100vh' }}>
      {!session ? (
        <>
          {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
          {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
          {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
        </>
      ) : subscriptionStatus === 'expired' ? (
        // شاشة الحماية المالية
        <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>
          <h2>انتهى اشتراك الأكاديمية</h2>
          <button onClick={() => supabase.auth.signOut()}>تسجيل الخروج</button>
        </div>
      ) : (
        <MainApp session={session} isDataLoading={dataLoading} />
      )}
    </div>
  );
}
