import { useState, useEffect } from "react";
import { supabase } from './lib/supabase';
import SplashScreen from './components/SplashScreen.jsx';
import LoginPage from './components/LoginPage.jsx';

// 1. المكون الرئيسي للتطبيق بعد تسجيل الدخول
import MainApp from './components/MainApp.jsx'; 

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // التحقق من الجلسة
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // الاستماع لأي تغيير
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // 1. شاشة البداية
  if (loading) return <SplashScreen />;

  // 2. إذا لم يوجد مستخدم -> صفحة الدخول
  if (!session) return <LoginPage />;

  // 3. إذا وجد مستخدم -> نذهب لمكون التطبيق الرئيسي
  return <MainApp session={session} />;
}
