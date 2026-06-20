import React, { useState, useEffect, Component } from 'react';
import { supabase } from './lib/supabase';

// ⚜️ استيراد الشاشة الافتتاحية المطورة (الحلقة الذهبية المتوهجة للمنصة)
import SplashScreen from './components/SplashScreen';

// استيراد بوابات النظام الثابتة لضمان استقرار الأداء العالمي
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';
import SubscriptionPage from './components/SubscriptionPage';

// جدار حماية داخلي للـ React لمعالجة أي أخطاء مفاجئة في الواجهة
class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#090F17', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right' }}>
          <h2 style={{ color: '#E5C060' }}>🚨 رادار الواجهة: عطل داخلي في المكونات</h2>
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
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    // صمام أمان تنظيف المتصفح من أي مخلفات للودر القديم فور الإقلاع
    const oldLoader = document.getElementById('fallback-loader');
    if (oldLoader) oldLoader.remove();

    if (!supabase) {
      setLoading(false);
      return;
    }

    // جلب الجلسة الحالية فوراً عند الإقلاع
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      // تأخير احترافي مدته 1.2 ثانية لاستعراض جمال الشاشة الافتتاحية السينمائية
      setTimeout(() => setLoading(false), 1200);
    }).catch(() => setLoading(false));

    // الاستماع لمتغيرات تسجيل الدخول والخروج
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') setAuthView('update_password');
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // التحقق من الصلاحيات وحالة تفعيل الحساب والاشتراك
  useEffect(() => {
    if (!session || !supabase) return;
    
    const uid = session.user.id;
    if (uid === 'cb4a2d6c-4e4f-4752-96e9-b21dd0f66cf9') {
      setUserRole('admin');
      setIsActivated(true);
      return;
    }

    supabase.from('profiles').select('role, is_activated').eq('id', uid).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setUserRole(data.role?.trim().toLowerCase().replace(/\s+/g, '_') || 'student');
          setIsActivated(data.is_activated || false);
        } else {
          setUserRole('student');
          setIsActivated(false);
        }
      }).catch(() => {
        setUserRole('student');
        setIsActivated(false);
      });
  }, [session]);

  // معادلة حساب الأيام المتبقية في الفترة التجريبية (14 يوماً)
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

  // ✨ استدعاء الشاشة الافتتاحية الفخمة المطورة العالمية والمطابقة للتصميم الأصلي
  if (loading) {
    return <SplashScreen />;
  }

  if (authView === 'update_password') return <UpdatePassword />;

  // 🔒 جدار حماية الاشتراك: إذا انتهت الـ 14 يوماً والحساب غير مفعّل يدوياً، تظهر صفحة الدفع
  if (session && trialDaysLeft <= 0 && userRole !== 'admin' && !isActivated) {
    return (
      <SubscriptionPage 
        session={session} 
        onBack={() => supabase.auth.signOut()} 
      />
    );
  }

  // إذا كانت الجلسة نشطة والحساب مفعّل، نفتح لوحة التحكم الاحترافية الكاملة
  if (session) {
    return (
      <MainApp 
        session={session} 
        userRole={userRole} 
        trialDaysLeft={trialDaysLeft} 
      />
    );
  }

  // بوابات الزوار غير المسجلين
  return (
    <div style={{ background: '#060B11', minHeight: '100vh', direction: 'rtl' }}>
      {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
      {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
      {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
    </div>
  );
}

// قفل النطاق لحماية الملكية الفكرية
export default function App() {
  const allowedHosts = ['smart-halaqa.vercel.app', 'localhost', '127.0.0.1'];
  const isAllowed = allowedHosts.includes(window.location.hostname);

  if (!isAllowed) {
    return (
      <div style={{ padding: '30px', background: '#060B11', color: '#EF4444', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#E5C060', fontSize: '1.6rem', marginBottom: '10px' }}>🔒 نظام الحماية الثلاثي: غير مصرح بالتشغيل</h2>
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
