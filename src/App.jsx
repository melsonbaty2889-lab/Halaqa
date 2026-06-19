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
  const [dashboardData, setDashboardData] = useState({ academyName: '', stats: { students: 0, pending: 0 } });

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

  // التوجيه للوحة التحكم الأساسية في حال وجود جلسة صالحة
  if (session) {
    return (
      <MainApp 
        session={session} 
        isDataLoading={false} 
        dashboardData={dashboardData} 
        setDashboardData={setDashboardData} 
        userRole={userRole} 
        trialDaysLeft={7} 
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

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}
