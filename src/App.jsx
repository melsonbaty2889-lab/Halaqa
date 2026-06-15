import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // مسار ملف سوبابيس المعتمد في مشروعك
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
  
  // 1️⃣ حالات التحكم في الواجهات (States)
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); // الكنترول التنقلي: login | signup | forgot | update_password

  // معرفة اتجاه النص بناءً على لغة النظام
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    // 2️⃣ جلب حالة التحقق الأولية من الجلسة الحالية عند إقلاع التطبيق
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 3️⃣ الاستماع الحي والدائم لتغيرات حالة المستخدم (تسجيل دخول، خروج، أو استعادة كلمة مرور)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      // إذا قام المستخدم بالضغط على رابط إعادة تعيين كلمة المرور المرسل لبريده
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
      }
    });

    // 4️⃣ صمام أمان إضافي: فحص الرابط (URL) فوراً عند التشغيل لالتقاط توكن الاستعادة
    if (window.location.hash.includes('type=recovery') || window.location.href.includes('type=recovery')) {
      setAuthView('update_password');
    }

    // 5️⃣ مؤقت الشاشة الافتتاحية (إجبار العرض لمدة 2 ثانية لمنع وميض الشاشة السريع والغير مريح للعين)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    // تنظيف المؤقت والاشتراكات عند مغادرة المكون لمنع تسريب الذاكرة (Memory Leak)
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // ==========================================
  // 🛡️ منطق العرض الشرطي الحاسم (Conditional Rendering)
  // ==========================================

  // المرحلة الأولى: طالما المؤقت الزمني يعمل، تظهر شاشة الـ Splash الفخمة
  if (showSplash) {
    return <SplashScreen />;
  }

  // المرحلة الثانية: إذا التقط النظام حدث استعادة كلمة المرور، يتم إظهار شاشة التحديث فوراً كأولوية قصوى
  if (authView === 'update_password') {
    return (
      <div style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <UpdatePassword />
      </div>
    );
  }

  // المرحلة الثالثة: إذا انتهى الـ Splash وكان المستخدم مسجلاً لدخوله، نفتح لوحة التحكم مباشرة
  if (session) {
    return <MainApp session={session} />;
  }

  // المرحلة الرابعة: إذا انتهى الـ Splash والمستخدم غير مسجل، تظهر شاشات الحماية والـ Auth المتجاوبة
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
