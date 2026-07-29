/* src/context/AcademyContext.jsx */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AcademyContext = createContext({});

export const AcademyProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [academy, setAcademy] = useState(null);
  const [appState, setAppState] = useState('LOADING');

  const fetchUserStatus = async (currentUser) => {
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
        .single();

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
        setAppState('FULLY_ACTIVE'); 
        return;
      }

      setAppState('UNAUTHENTICATED');

    } catch (e) {
      console.error("🚨 خطأ غير متوقع أثناء معالجة الصلاحيات:", e);
      setAppState('UNAUTHENTICATED');
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      fetchUserStatus(session?.user);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AcademyContext.Provider value={{ 
      user, 
      profile, 
      academy, 
      appState, 
      logout: async () => {
        try {
          // 1. مسح القفل فوراً عند الخروج
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('block_splash');
            localStorage.removeItem('app_splash_seen_v4');
          }

          // 2. تصفير الـ States
          setAcademy(null);
          setUser(null);
          setProfile(null);

          // 3. الخروج من Supabase
          await supabase.auth.signOut();
        } catch (error) {
          console.error("🚨 خطأ أثناء تسجيل الخروج:", error);
        }
      }, 
      refreshStatus: () => fetchUserStatus(user) 
    }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => useContext(AcademyContext);
