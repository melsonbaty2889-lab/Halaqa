import React, { useState, useEffect, Component } from 'react';
import { supabase } from './lib/supabase';

// استيراد ثابت ومباشر (خالٍ تماماً من Lazy Loading المسبب لمشاكل الكاش على الهواتف)
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';

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

  // تحديد صلاحية المستخدم عند تسجيل الدخول بنجاح
  useEffect(() => {
    if (!session || !supabase) return;
    
    const uid = session.user.id;
    if (uid === 'cb4a2d6c-4e4f-4752-96e9-b21dd0f66cf9') {
      setUserRole('admin');
      return;
    }

    supabase.from('profiles').select('role').eq('id', uid).maybeSingle()
      .then(({ data }) => {
        if (data?.role) {
          setUserRole(data.role.trim().toLowerCase().replace(/\s+/g, '_'));
        } else {
          setUserRole('student');
        }
      }).catch(() => setUserRole('student'));
  }, [session]);

  // 🛡️ معادلة عالمية لحساب الأيام المتبقية من السيرفر مباشرة دون استهلاك باقة البيانات
  const calculateTrialDaysLeft = () => {
    if (!session) return 0;
    const createdAt = new Date(session.user.created_at); // تاريخ إنشاء الحساب الموثق
    const today = new Date();
    const diffTime = today - createdAt;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // حساب الأيام المنقضية
    const daysLeft = 14 - diffDays; // طرحها من الـ 14 يوماً التجريبية
    return daysLeft < 0 ? 0 : daysLeft;
  };

  // لو كان الأدمن هو من يتصفح، نمنحه صلاحية مفتوحة دائماً (مثال: 999 يوم)، وللمستخدم العادي نحسب الأيام ديناميكياً
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

  // 🔒 جدار حماية الفترة التجريبية: إذا انتهت الـ 14 يوماً والمستخدم ليس أدمن، يتم حظر الواجهة فوراً
  if (session && trialDaysLeft <= 0 && userRole !== 'admin') {
    return (
      <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#111827', border: '1px solid #374151', padding: '40px', borderRadius: '16px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ color: '#FBBF24', fontSize: '1.6rem', marginBottom: '15px' }}>⏳ انتهت الفترة التجريبية للمنصة</h2>
          <p style={{ color: '#9CA3AF', fontSize: '1rem', lineHeight: '1.6', marginBottom: '25px' }}>
            لقد انتهت المدة المتاحة لتجربة منصة <strong>"الحلقة الذكية"</strong> (14 يوماً). لحفظ سجلات طلابك ومجموعاتك والاستمرار في استخدام النظام، يرجى التواصل مع الإدارة لتفعيل الحساب بشكل دائم.
          </p>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', width: '100%', transition: '0.3s' }}
          >
            تسجيل الخروج الآمن
          </button>
        </div>
      </div>
    );
  }

  // التوجيه للوحة التحكم الأساسية وتمرير الأيام المحسوبة ديناميكياً
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
