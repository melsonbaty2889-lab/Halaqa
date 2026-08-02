/* src/context/AcademyContext.jsx */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AcademyContext = createContext({});

export const AcademyProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [academy, setAcademy] = useState(null);
  const [appState, setAppState] = useState('LOADING');

  const fetchUserStatus = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setAcademy(null);
      setAppState('UNAUTHENTICATED');
      return;
    }

    try {
      setUser(currentUser);
      
      // 1. جلب بيانات الحساب من جدول profiles
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profError || !profData) {
        console.error("🚨 خطأ في جلب البروفايل أو الحساب غير موجود في الجدول:", profError);
        setAppState('UNAUTHENTICATED');
        return;
      }

      setProfile(profData);

      // 2. إذا كان الحساب هو السوبر أدمن العام للمنصة
      if (profData.role === 'super_admin') {
        setAcademy(null);
        setAppState('SUPER_ADMIN');
        return;
      }

      // 3. الحماية المشتركة: إذا كان الحساب غير مفعل من الإدارة
      if (profData.is_activated === false) {
        setAcademy(null);
        setAppState('PENDING_APPROVAL');
        return;
      }

      // 4. إذا كان الحساب مفعل ودوره مدير أكاديمية (admin)
      if (profData.role === 'admin') {
        const { data: acadData } = await supabase
          .from('academies')
          .select('*')
          .eq('owner_id', currentUser.id)
          .maybeSingle();

        if (acadData) {
          setAcademy(acadData);
          setAppState(acadData.is_active ? 'FULLY_ACTIVE' : 'PENDING_APPROVAL');
        } else {
          setAcademy(null);
          setAppState('NO_ACADEMY');
        }
        return;
      }

      // 5. إذا كان الحساب مفعل ودوره (طالب، معلم، ولي أمر)
      if (['student', 'teacher', 'parent'].includes(profData.role)) {
        // جلب الأكاديمية التابع لها إذا كانت مسجلة في البروفايل
        if (profData.academy_id) {
          const { data: userAcademy } = await supabase
            .from('academies')
            .select('*')
            .eq('id', profData.academy_id)
            .maybeSingle();
            
          setAcademy(userAcademy || null);
        } else {
          setAcademy(null);
        }

        setAppState('FULLY_ACTIVE'); 
        return;
      }

      setAppState('UNAUTHENTICATED');

    } catch (e) {
      console.error("🚨 خطأ غير متوقع أثناء معالجة الصلاحيات:", e);
      setAppState('UNAUTHENTICATED');
    }
  }, []);

  // دالة جلب الحالة الحية فوراً
  const refreshStatus = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    await fetchUserStatus(currentUser);
  }, [fetchUserStatus]);

  useEffect(() => {
    // 1. التحقق المباشر عند بدء تشغيل المكون
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserStatus(session?.user);
    });

    // 2. الاستماع لتغيرات الجلسة والتأكد من التحديث
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      fetchUserStatus(session?.user);
    });
    
    return () => subscription.unsubscribe();
  }, [fetchUserStatus]);

  const logout = async () => {
    try {
      // 1. مسح التخزين المؤقت
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('block_splash');
        localStorage.removeItem('app_splash_seen_v4');
      }

      // 2. تصفير الـ States
      setAcademy(null);
      setUser(null);
      setProfile(null);
      setAppState('UNAUTHENTICATED');

      // 3. الخروج من Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error("🚨 خطأ أثناء تسجيل الخروج:", error);
    }
  };

  return (
    <AcademyContext.Provider value={{ 
      user, 
      profile, 
      academy, 
      appState, 
      logout, 
      refreshStatus 
    }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => useContext(AcademyContext);
