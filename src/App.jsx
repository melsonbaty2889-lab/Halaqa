import { useState, useEffect } from 'react'; 
import { supabase } from './lib/supabase'; 
import { useTranslation } from 'react-i18next';

// استيراد المكونات الأساسية
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import MainApp from './components/MainApp';

export default function App() {
  const { i18n } = useTranslation();
  
  // حالات الاختبار: سنفرض أن التطبيق يحمل الآن
  const [appLoading, setAppLoading] = useState(true); 
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); 
  const isRtl = i18n.language === 'ar';

  // تايمر اختبار العزل
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Timer finished: Setting appLoading to false");
      setAppLoading(false);
    }, 2000); // 2 ثانية كافية للتجربة
    return () => clearTimeout(timer);
  }, []);

  // 🛑 منطقة العزل: اختبار مباشر بدون استدعاء SplashScreen
  if (appLoading) {
    return (
      <div style={{ 
        background: '#090F17', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#C9A84C',
        fontFamily: 'sans-serif'
      }}>
        <h1>جاري التحميل... (وضع الاختبار)</h1>
        <p style={{color: '#fff'}}>إذا رأيت هذه الرسالة، فالمشكلة كانت في ملف الـ SplashScreen نفسه.</p>
      </div>
    );
  }

  // في حال انتهاء التحميل، عرض شاشة الدخول
  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', background: '#090F17', minHeight: '100vh' }}>
      {authView === 'login' && <LoginPage onSwitchToSignUp={() => setAuthView('signup')} onSwitchToForgotPassword={() => setAuthView('forgot')} />}
      {/* باقي الشاشات */}
    </div>
  );
}
