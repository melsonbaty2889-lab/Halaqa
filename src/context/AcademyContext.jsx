/* src/context/AcademyContext.jsx */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const AcademyContext = createContext(null);

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

  // دالة التحديث اللحظي لبيانات الأكاديمية في الواجهة
  const updateAcademyState = useCallback((newAcademyData) => {
    if (isMounted.current) {
      setAcademy((prev) => (prev ? { ...prev, ...newAcademyData } : newAcademyData));
    }
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

      // 1. جلب بيانات البروفايل المحددة فقط بدلاً من (*)
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('id, role, is_activated, full_name, email, avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profError) {
        console.error("🚨 خطأ في جلب البروفايل:", profError);
      }

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

      // 3. الحسابات غير المفعلة على مستوى المستخدم
      if (profData.is_activated === false) {
        if (isMounted.current) {
          setAcademy(null);
          setAppState('PENDING_APPROVAL');
        }
        return;
      }

      // 4. جلب الأكاديمية عبر academy_members وتحديد حقول الأكاديمية فقط
      let currentAcademy = null;

      const { data: memList, error: memError } = await supabase
        .from('academy_members')
        .select(`
          role,
          academy:academies (
            id, name, slug, logo_url, is_active, blocked_reason, owner_id, created_at
          )
        `)
        .eq('user_id', currentUser.id)
        .limit(1);

      if (memError) {
        console.error("🚨 خطأ في جلب عضوية الأكاديمية:", memError);
      }

      if (memList && memList.length > 0) {
        currentAcademy = memList[0]?.academy || null;
      }

      // 5. خطة بديلة احتياطية (Fallback): جلب الأكاديمية بحقول محدودة
      if (!currentAcademy) {
        const { data: ownedAcademy, error: ownerError } = await supabase
          .from('academies')
          .select('id, name, slug, logo_url, is_active, blocked_reason, owner_id, created_at')
          .eq('owner_id', currentUser.id)
          .limit(1)
          .maybeSingle();

        if (!ownerError && ownedAcademy) {
          currentAcademy = ownedAcademy;
        }
      }

      if (isMounted.current) {
        if (currentAcademy) {
          setAcademy(currentAcademy);
          if (currentAcademy.slug) {
            localStorage.setItem('current_academy_slug', currentAcademy.slug);
          }

          if (currentAcademy.is_active === false) {
            setAppState('SUSPENDED');
          } else {
            setAppState('FULLY_ACTIVE');
          }
        } else {
          setAcademy(null);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserStatus(session?.user);
    });

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
        localStorage.removeItem('current_academy_slug');
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
      updateAcademyState,
      logout,
      refreshStatus
    }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};
