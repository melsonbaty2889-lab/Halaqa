/* src/context/AcademyContext.jsx */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AcademyContext = createContext({});

export const AcademyProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [academy, setAcademy] = useState(null);
  const [appState, setAppState] = useState('LOADING');

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchUserStatus = useCallback(async (currentUser) => {
    if (!currentUser) {
      if (isMounted.current) {
        setUser(null);
        setProfile(null);
        setAcademy(null);
        setAppState('UNAUTHENTICATED');
      }
      return;
    }

    try {
      if (isMounted.current) setUser(currentUser);

      // 1. جلب بيانات البروفايل من جدول profiles
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profError) {
        console.error("🚨 خطأ في جلب البروفايل:", profError);
      }

      // إذا لم يوجد بروفايل للمستخدم في قاعدة البيانات
      if (!profData) {
        console.warn("⚠️ لم يتم العثور على بروفايل للمستخدم في جدول profiles");
        if (isMounted.current) {
          setProfile(null);
          setAcademy(null);
          setAppState('NO_PROFILE'); // أو PENDING_APPROVAL بحسب هيكلة تطبيقك
        }
        return;
      }

      if (isMounted.current) setProfile(profData);

      // 2. السوبر أدمن
      if (profData.role === 'super_admin') {
        if (isMounted.current) {
          setAcademy(null);
          setAppState('SUPER_ADMIN');
        }
        return;
      }

      // 3. الحسابات غير المفعلة
      if (profData.is_activated === false) {
        if (isMounted.current) {
          setAcademy(null);
          setAppState('PENDING_APPROVAL');
        }
        return;
      }

      // 4. مدير الأكاديمية (Admin)
      if (profData.role === 'admin') {
        const { data: acadData } = await supabase
          .from('academies')
          .select('*')
          .eq('owner_id', currentUser.id)
          .maybeSingle();

        if (isMounted.current) {
          if (acadData) {
            setAcademy(acadData);
            setAppState(acadData.is_active ? 'FULLY_ACTIVE' : 'PENDING_APPROVAL');
          } else {
            setAcademy(null);
            setAppState('NO_ACADEMY');
          }
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

          if (isMounted.current) setAcademy(userAcademy || null);
        } else {
          if (isMounted.current) setAcademy(null);
        }

        if (isMounted.current) setAppState('FULLY_ACTIVE');
        return;
      }

      // افتراضي لأي دور آخر
      if (isMounted.current) setAppState('FULLY_ACTIVE');

    } catch (e) {
      console.error("🚨 خطأ غير متوقع في معالجة الصلاحيات:", e);
      if (isMounted.current) setAppState('UNAUTHENTICATED');
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      await fetchUserStatus(currentUser);
    } catch (err) {
      console.error("🚨 خطأ أثناء تحديث الحالة:", err);
      if (isMounted.current) setAppState('UNAUTHENTICATED');
    }
  }, [fetchUserStatus]);

  useEffect(() => {
    // الاستماع لإنشاء الجلسة أو تسجيل الدخول
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserStatus(session?.user);
    });

    // مؤقت أمان (4 ثوانٍ): يفحص الحالة الفعلية الحالية ولا يلغي الدخول إذا تم بنجاح
    const safetyTimer = setTimeout(() => {
      if (isMounted.current) {
        setAppState((prev) => (prev === 'LOADING' ? 'UNAUTHENTICATED' : prev));
      }
    }, 4000);

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchUserStatus]);

  // التحديث اللحظي للبروفايل
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
      if (isMounted.current) {
        setAcademy(null);
        setUser(null);
        setProfile(null);
        setAppState('UNAUTHENTICATED');
      }
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
