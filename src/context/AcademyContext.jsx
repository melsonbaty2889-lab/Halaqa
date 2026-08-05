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
        console.error("🚨 خطأ في جلب البروفايل:", profError);
        setAppState('UNAUTHENTICATED');
        return;
      }

      setProfile(profData);

      // 2. السوبر أدمن العام
      if (profData.role === 'super_admin') {
        setAcademy(null);
        setAppState('SUPER_ADMIN');
        return;
      }

      // 3. الحسابات المعلقة من الإدارة
      if (profData.is_activated === false) {
        setAcademy(null);
        setAppState('PENDING_APPROVAL');
        return;
      }

      // 4. مدير الأكاديمية
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

      // 5. باقي الأدوار (طالب، معلم، ولي أمر)
      if (['student', 'teacher', 'parent'].includes(profData.role)) {
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
      console.error("🚨 خطأ في معالجة الصلاحيات:", e);
      setAppState('UNAUTHENTICATED');
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    await fetchUserStatus(currentUser);
  }, [fetchUserStatus]);

  useEffect(() => {
    // التحقق عند البدء
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserStatus(session?.user);
    });

    // الاستماع لتغيرات الجلسة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      fetchUserStatus(session?.user);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserStatus]);

  // Realtime subscription للتغييرات في البروفايل تلقائياً
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile_changes_${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, () => {
        refreshStatus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshStatus]);

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('block_splash');
        localStorage.removeItem('app_splash_seen_v4');
      }
      setAcademy(null);
      setUser(null);
      setProfile(null);
      setAppState('UNAUTHENTICATED');
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
