/* src/context/AcademyContext.jsx */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AcademyContext = createContext({});

export const AcademyProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [academy, setAcademy] = useState(null);
  // تأكدنا هنا من وجود حالة افتراضية صلبة
  const [appState, setAppState] = useState('LOADING'); 

  const fetchUserStatus = async (currentUser) => {
    // حالة 1: لا يوجد مستخدم
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setAcademy(null);
      setAppState('UNAUTHENTICATED');
      return;
    }

    try {
      setUser(currentUser);
      
      // جلب البروفايل
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      // حالة 2: فشل جلب البروفايل (ربما لم ينشأ بعد في قاعدة البيانات)
      if (profError || !profData) {
        console.warn("خطأ في جلب البروفايل:", profError);
        setAppState('LOADING'); // يبقى في وضع التحميل حتى يظهر البروفايل
        return;
      }

      setProfile(profData);

      // حالة 3: السوبر أدمن
      if (profData.role === 'super_admin') {
        setAppState('SUPER_ADMIN');
        return;
      }

      // حالة 4: الأدمن المعلق
      if (profData.role === 'admin' && !profData.is_activated) {
        setAppState('PENDING_APPROVAL');
        return;
      }

      // حالة 5: جلب الأكاديمية
      const { data: acadData, error: acadError } = await supabase
        .from('academies')
        .select('*')
        .eq('owner_id', currentUser.id)
        .single();

      if (acadData) {
        setAcademy(acadData);
        setAppState(acadData.is_active ? 'FULLY_ACTIVE' : 'PENDING_APPROVAL');
      } else {
        // إذا كان الدور admin ولم يجد أكاديمية
        setAppState(profData.role === 'admin' ? 'NO_ACADEMY' : 'UNAUTHENTICATED');
      }

    } catch (error) {
      console.error("خطأ حرج في النظام:", error);
      // حماية: في حالة حدوث أي خطأ غير متوقع، نعيد المستخدم لحالة آمنة
      setAppState('UNAUTHENTICATED'); 
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserStatus(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserStatus(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setAppState('UNAUTHENTICATED');
  };

  return (
    <AcademyContext.Provider value={{ user, profile, academy, appState, logout, refreshStatus: () => fetchUserStatus(user) }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => useContext(AcademyContext);
