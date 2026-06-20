import React, { useState, useEffect, Component } from 'react';
import { supabase } from './lib/supabase';

// استيراد ثابت ومباشر (خالٍ تماماً من Lazy Loading المسبب لمشاكل الكاش على الهواتف)
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';
import SubscriptionPage from './components/SubscriptionPage'; // 💳 استيراد صفحة الاشتراكات الجغرافية المحدثة

// جدار حماية داخلي للـ React لضمان استقرار المكونات
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
          <p style={{ color: '#9CA3AF' }}>تأكد من ملفات الواجهة المعروضة حالياً:</p>
          <pre style={{ background: '#111827', padding: '20px', color: '#FFF', direction: 'ltr', textAlign: 'left', overflow: 'auto', border: '1px solid #374151' }}>
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
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isActivated, setIsActivated] = useState(false); // 🔑 تتبع حالة الاشتراك المدفوع رسميًا

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // جلب حالة الجلسة الحالية فوراً
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
    }).catch(() => setLoading(false));

    // مراقبة التغيرات في الحماية
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // تحديد صلاحية المستخدم وحالة تفعيل الحساب عند تسجيل الدخول بنجاح
  useEffect(() => {
    if (!session || !supabase) return;
    
    const uid = session.user.id;
    if (uid === 'cb4a2d6c-4e4f-4752-96e9-b21dd0f66cf9') {
      setUserRole('admin');
      setIsActivated(true); // الأدمن مفعل بشكل دائم ومطلق
      return;
    }

    // جلب الـ role والـ is_activated معاً في طلب واحد فائق السرعة
    supabase.from('profiles').select('role, is_activated').eq('id', uid).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setUserRole(data.role?.trim().toLowerCase().replace(/\s+/g, '_') || 'student');
          setIsActivated(data.is_activated || false); // تعيين حالة الاشتراك الفعلي
        } else {
          setUserRole('student');
          setIsActivated(false);
        }
      }).catch(() => {
        setUserRole('student');
        setIsActivated(false);
      });
  }, [session]);

  // 🛡️ معادلة عالمية لحساب الأيام المتبقية من الفترة التجريبية
  const calculateTrialDaysLeft = () => {
    if (!session) return 0;
    const createdAt = new Date(session.user.created_at);
    const today = new Date();
    const diffTime = today - createdAt;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = 14 - diffDays;
    return daysLeft < 0 ? 0 : daysLeft;
  };

  const trialDaysLeft = userRole === 'admin' ? 999 : calculateTrialDaysLeft();

  if (loading) {
    return (
      <div style={{ background: '#090F17', color: '#FBBF24', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid rgba(251,191,36,0.1)', borderTop: '2px solid #FBBF24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' }}></div>
          <span style={{ fontSize: '13px' }}>جاري تشغيل المنصة بأمان...</span>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (authView === 'update_password') return <UpdatePassword />;

  // 🔒 جدار حماية الاشتراك: إذا انتهت الفترة التجريبية والحساب لم يتم تفعيله يدوياً والدور ليس أدمن، تظهر بوابة الدفع المحدثة فوراً
  if (session && trialDaysLeft <= 0 && userRole !== 'admin' && !isActivated) {
    return (
      <SubscriptionPage 
        session={session} 
        onBack={() => supabase.auth.signOut()} // زر الخروج يقوم بقطع الجلسة بأمان لحين الدفع والتفعيل
      />
    );
  }

  // التوجيه للوحة التحكم الأساسية وتمرير البيانات الموثقة
  if (session) {
    return (
      <MainApp 
        session={session} 
        userRole={userRole} 
        trialDaysLeft={trialDaysLeft} 
      />
    );
  }

  // بوابات الزوار (تسجيل الدخول / إنشاء حساب / استعادة كلمة المرور)
  return (
    <div style={{ background: '#090F17', minHeight: '100vh', direction: 'rtl' }}>
      {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
      {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
      {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
    </div>
  );
}

// 🛡️ المكون الرئيسي محمي بالكامل بقفل النطاق (Domain Lock) لحظر أي سرقة للكود
export default function App() {
  const allowedHosts = ['smart-halaqa.vercel.app', 'localhost', '127.0.0.1'];
  const isAllowed = allowedHosts.includes(window.location.hostname);

  if (!isAllowed) {
    return (
      <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#FBBF24', fontSize: '1.6rem', marginBottom: '10px' }}>🔒 نظام الحماية الثلاثي: غير مصرح بالتشغيل</h2>
        <p style={{ color: '#9CA3AF', fontSize: '1.1rem', textAlign: 'center', maxWidth: '500px' }}>
          تم إيقاف تشغيل هذه المنصة تلقائياً لحماية حقوق الملكية الفكرية للمطور. النطاق الحالي غير مسجل في الخادم الرسمي.
        </p>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}
