import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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
          setAppState('NO_PROFILE');
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

      // 4 & 5. جلب الأكاديمية المرتبطة عبر جدول academy_members (لكافة الأدوار)
      const { data: membershipData, error: memError } = await supabase
        .from('academy_members')
        .select(`
          role,
          academy:academies (*)
        `)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (memError) {
        console.error("🚨 خطأ في جلب عضوية الأكاديمية:", memError);
      }

      const currentAcademy = membershipData?.academy || null;

      if (isMounted.current) {
        if (currentAcademy) {
          setAcademy(currentAcademy);
          setAppState(currentAcademy.is_active !== false ? 'FULLY_ACTIVE' : 'PENDING_APPROVAL');
        } else {
          setAcademy(null);
          // المدير بدون أكاديمية يوجه للتأسيس، وباقي الأدوار ينتظرون أو يوجهون بحسب النظام
          setAppState(profData.role === 'admin' ? 'NO_ACADEMY' : 'FULLY_ACTIVE');
        }
      }

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

    // مؤقت أمان (4 ثوانٍ)
    const safetyTimer = setTimeout(() => {
      if (isMounted.current) {
        setAppState((prev) => (prev === 'LOADING' ? 'UNAUTHENTICATED' : prev));
      }
    }, 4000);

    return () => {
      clearTimeout(safetyTimer);
      if (subscription) subscription.unsubscribe();
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
      channel.unsubscribe();
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
