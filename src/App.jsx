/* Src/App.jsx */
import React, { useState, useEffect, Component } from 'react';
import { supabase } from './lib/supabase';

import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';
import SubscriptionPage from './components/SubscriptionPage';
import CreateAcademy from './components/CreateAcademy'; 

class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right' }}>
          <h2 style={{ color: '#FBBF24' }}>🚨 رادار الواجهة: عطل داخلي في المكونات</h2>
          <pre style={{ background: '#111827', padding: '20px', color: '#FFF', direction: 'ltr', textAlign: 'left', overflow: 'auto', border: '1px solid #374151', borderRadius: '8px' }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(true); // لفحص وجود الجلسة (Auth)
  const [fetchingData, setFetchingData] = useState(false); // لمنع الوميض والتنقل العشوائي أثناء جلب بيانات السيرفر

  const [userRole, setUserRole] = useState(null);
  const [isActivated, setIsActivated] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [isTrial, setIsTrial] = useState(true);
  const [hasAcademy, setHasAcademy] = useState(false); // فحص حقيقي للأكاديمية من الداتابيز

  useEffect(() => {
    const oldLoader = document.getElementById('fallback-loader');
    if (oldLoader) oldLoader.remove();
    if (!supabase) { setLoading(false); return; }
    
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setTimeout(() => setLoading(false), 1200);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
    });
    return () => { if (subscription) subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session || !supabase) {
      setFetchingData(false);
      return;
    }
    const uid = session.user.id;

    // استثناء المطور / الأدمن الرئيسي
    if (uid === 'cb4a2d6c-4e4f-4752-96e9-b21dd0f66cf9') {
      setUserRole('admin');
      setIsActivated(true);
      setDaysLeft(999);
      setIsTrial(false);
      setHasAcademy(true);
      setFetchingData(false);
      return;
    }

    async function fetchUserStatusAndSubscription() {
      setFetchingData(true); // تثبيت الشاشة الافتتاحية لحين اكتمال كافة البيانات حماية لـ UX
      try {
        // 1. جلب بيانات الملف الشخصي والرتبة
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, is_activated')
          .eq('id', uid)
          .maybeSingle();
        
        let calculatedRole = 'student';
        let calculatedActivation = false;

        if (profileData) {
          calculatedRole = profileData.role?.trim().toLowerCase().replace(/\s+/g, '_') || 'student';
          calculatedActivation = profileData.is_activated || false;
        }
        setUserRole(calculatedRole);
        setIsActivated(calculatedActivation);

        // 2. جلب بيانات الاشتراك الفعلي
        const { data: subData } = await supabase
          .from('saas_subscriptions')
          .select('expires_at')
          .eq('user_id', uid)
          .eq('status', 'active')
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subData && subData.expires_at) {
          const expires = new Date(subData.expires_at);
          const today = new Date();
          const diffTime = expires - today;
          const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          setDaysLeft(remainingDays < 0 ? 0 : remainingDays);
          setIsTrial(false);
        } else {
          const createdAt = new Date(session.user.created_at);
          const today = new Date();
          const diffTime = today - createdAt;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const remainingTrial = 14 - diffDays;
          
          setDaysLeft(remainingTrial < 0 ? 0 : remainingTrial);
          setIsTrial(true);
        }

        // 3. 🛡️ فحص الأكاديمية الحقيقي والمستقر مباشرة من السيرفر (جدول staff)
        const { data: staffData } = await supabase
          .from('staff')
          .select('academy_id')
          .eq('user_id', uid)
          .maybeSingle();

        const academyIdFromDb = staffData?.academy_id;
        const academyIdFromMeta = session.user?.user_metadata?.academy_id;

        // إذا كانت الأكاديمية مسجلة في السيرفر أو الميتا داتا نعتبره يمتلك أكاديمية
        if (academyIdFromDb || academyIdFromMeta) {
          setHasAcademy(true);
        } else {
          setHasAcademy(false);
        }

      } catch (err) {
        console.error("خطأ جلب الصلاحيات والاشتراك الذكي:", err);
        setUserRole('student');
        setIsActivated(false);
        setDaysLeft(0);
        setIsTrial(true);
        setHasAcademy(false);
      } finally {
        setFetchingData(false); // فك الحجز وعرض الشاشة المناسبة فوراً وبشكل نهائي وبدون وميض
      }
    }

    fetchUserStatusAndSubscription();
  }, [session]);

  // ⏸️ حظر العرض: طالما أن الجلسة تفحص أو البيانات يتم جلبها، ابقِ الـ SplashScreen نشطاً
  if (loading || (session && fetchingData)) return <SplashScreen />;
  if (authView === 'update_password') return <UpdatePassword />;

  // 🛡️ منطق المنع المالي والأمان لحماية التطبيق
  const isBlockActive = userRole !== 'admin' && (
    (isTrial && daysLeft <= 0 && !isActivated) || 
    (!isTrial && daysLeft <= 0)
  );

  // 🔐 بوابات التوجيه المرتّبة والمحكمة للمستخدم المسجل
  if (session) {
    // البوابة الأولى: إذا كان الاشتراك منتهياً، يذهب لصفحة الاشتراك فوراً
    if (isBlockActive) {
      return <SubscriptionPage session={session} onBack={null} />;
    }

    // البوابة الثانية: الاشتراك سليم، نتحقق هل أنشأ أكاديمية؟ (باستثناء الإدارة العليا للمنصة)
    const isPlatformAdmin = userRole === 'admin' || userRole === 'super_admin';
    if (!hasAcademy && !isPlatformAdmin) {
      return (
        <CreateAcademy 
          session={session} 
          onAcademyCreated={() => {
            // عند نجاح الإنشاء، نقوم بعمل إعادة تحميل لإعادة بناء الحالة والبيانات بشكل كامل ومستقر من السيرفر
            window.location.reload();
          }} 
        />
      );
    }

    // البوابة الثالثة: الاستقرار والتوجه للوحة التحكم
    return <MainApp session={session} userRole={userRole} trialDaysLeft={daysLeft} isTrial={isTrial} />;
  }

  // بوابات غير المسجلين (الزوار)
  return (
    <div style={{ background: '#090F17', minHeight: '100vh', direction: 'rtl' }}>
      {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
      {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
      {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
    </div>
  );
}

export default function App() {
  const allowedHosts = ['smart-halaqa.vercel.app', 'localhost', '127.0.0.1'];
  const isAllowed = allowedHosts.includes(window.location.hostname);
  if (!isAllowed) {
    return (
      <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#FBBF24', fontSize: '1.6rem', marginBottom: '10px' }}>🔒 نظام الحماية الثلاثي: غير مصرح بالتشغيل</h2>
        <p style={{ color: '#9CA3AF', fontSize: '1.1rem', textAlign: 'center', maxWidth: '500px' }}>تم إيقاف تشغيل هذه المنصة تلقائياً لحماية حقوق الملكية الفكرية للمطور.</p>
      </div>
    );
  }
  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}
