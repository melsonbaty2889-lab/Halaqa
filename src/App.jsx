import React, { useState, useEffect, Component, Suspense } from 'react';

// 🔌 1️⃣ مستورد ديناميكي ذكي ومراقب لحالة الملفات
const safeLazy = (importFn, name) => React.lazy(() => 
  importFn()
    .then(module => {
      if (!module || !module.default) {
        throw new Error(`المكون [${name}] لا يحتوي على تصدير افتراضي (export default).`);
      }
      return module;
    })
    .catch(err => {
      throw new Error(`فشل نظام التشغيل في قراءة ملف ${name}: ${err.message}`);
    })
);

const LoginPage = safeLazy(() => import('./components/LoginPage'), 'LoginPage');
const SignUpPage = safeLazy(() => import('./components/SignUpPage'), 'SignUpPage');
const ForgotPassword = safeLazy(() => import('./components/ForgotPassword'), 'ForgotPassword');
const UpdatePassword = safeLazy(() => import('./components/UpdatePassword'), 'UpdatePassword');
const MainApp = safeLazy(() => import('./components/MainApp'), 'MainApp');

// 🛡️ 2️⃣ جدار حماية محلي ومبسط ومضمون التشغيل
class ComponentErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '25px', background: '#7F1D1D', color: '#FCA5A5', fontFamily: 'sans-serif', direction: 'rtl', textAlign: 'right' }}>
          <h3 style={{ color: '#FFF' }}>🚨 رادار الأعطال: تعطل عرض المكون الداخلي</h3>
          <p style={{ fontSize: '13px' }}>تفاصيل العطل المباشر:</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#000', padding: '15px', color: '#34D399', borderRadius: '6px', direction: 'ltr', textAlign: 'left' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// 🧠 3️⃣ محرك تشغيل المنصة ومراقبة الخطوات
function AppContent() {
  const [supabase, setSupabase] = useState(null);
  const [supabaseError, setSupabaseError] = useState(null);
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [appLoading, setAppLoading] = useState(true);
  const [radarStatus, setRadarStatus] = useState('بدء الفحص الخلوي...');

  // جلب السوبابيس مراقباً
  useEffect(() => {
    setRadarStatus('جاري استدعاء محرك Supabase السحابي...');
    import('./lib/supabase')
      .then((mod) => {
        if (mod && mod.supabase) {
          setSupabase(mod.supabase);
          setRadarStatus('تم الاتصال بالسوبابيس بنجاح.');
        } else {
          setSupabaseError("كائن الـ Supabase مفقود داخل الملف الداخلي.");
          setRadarStatus('عطل في كائن السوبابيس.');
        }
      })
      .catch((err) => {
        setSupabaseError(err.message);
        setRadarStatus(`فشل استيراد ملف السوبابيس: ${err.message}`);
      });
  }, []);

  // مراقبة الجلسة والتحميل
  useEffect(() => {
    if (!supabase) return;
    setRadarStatus('جاري فحص حماية جلسة المستخدم...');
    
    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setRadarStatus(`الحالة: ${event} | المستخدم: ${currentSession ? 'مسجل دخول' : 'زائر جديد'}`);
    });

    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 400);

    return () => {
      if (data?.subscription) data.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [supabase]);

  if (supabaseError) {
    return (
      <div style={{ color: '#EF4444', padding: '30px', background: '#090F17', minHeight: '100vh', direction: 'rtl' }}>
        <h3>🚨 خطأ سحابي حرج:</h3>
        <p>{supabaseError}</p>
      </div>
    );
  }

  if (!supabase || appLoading) {
    return (
      <div style={{ background: '#090F17', color: '#C9A84C', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', direction: 'rtl' }}>
        <div>⏳ جاري تهيئة النظام السحابي... ({radarStatus})</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#090F17', minHeight: '100vh', position: 'relative', fontFamily: 'sans-serif' }}>
      
      {/* 📢 كشاف الرادار الأصفر: مستحيل يختفي أو يتغطى بالسواد إذا كان الـ React يعمل */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, 
        background: '#FBBF24', color: '#000', padding: '12px', 
        fontSize: '13px', fontWeight: 'bold', zIndex: 99999, 
        textAlign: 'center', direction: 'rtl', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      }}>
        📢 رادار الأكاديمية الحية 🛰️ الواجهة المستهدفة: [{authView}] | {radarStatus}
      </div>

      {/* محتوى الواجهات تحته */}
      <div style={{ paddingTop: '60px' }}>
        <Suspense fallback={<div style={{ color: '#C9A84C', textAlign: 'center', padding: '30px' }}>⏳ جاري سحب ملفات واجهة {authView} من السيرفر...</div>}>
          {!session ? (
            <div style={{ direction: 'rtl' }}>
              {/* نص رمادي تأكيدي لمعرفة حدود الحاوية */}
              <div style={{ color: '#374151', fontSize: '11px', textAlign: 'center', padding: '5px' }}>[نظام التشخيص: تم تفعيل حاوية العرض بنجاح]</div>
              
              {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
              {authView === 'signup' && <SignUpPage onSwitchToLogin={() => setAuthView('login')} />}
              {authView === 'forgot' && <ForgotPassword onBackToLogin={() => setAuthView('login')} />}
            </div>
          ) : (
            <MainApp session={session} isDataLoading={false} dashboardData={{ academyName: '', stats: { students: 0, pending: 0 } }} setDashboardData={() => {}} userRole={null} trialDaysLeft={7} />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ComponentErrorBoundary>
      <AppContent />
    </ComponentErrorBoundary>
  );
}
