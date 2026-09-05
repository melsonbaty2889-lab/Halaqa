/* src/context/AcademyContext.jsx */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const AcademyContext = createContext(null);

export const AcademyProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [academy, setAcademy] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [appState, setAppState] = useState('LOADING');

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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
        setUserRole(null);
        setAppState('UNAUTHENTICATED');
      }
      return;
    }

    try {
      if (isMounted.current) setUser(currentUser);

      // 1. جلب بيانات البروفايل
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profError) {
        console.error("🚨 خطأ في جلب البروفايل:", profError);
      }

      const activeProfile = profData || {
        id: currentUser.id,
        role: 'admin',
        is_activated: true,
        full_name: currentUser.email || 'مستخدم'
      };

      if (isMounted.current) {
        setProfile(activeProfile);
        setUserRole(activeProfile.role || 'admin');
      }

      // حسابات Super Admin
      if (activeProfile.role === 'super_admin') {
        if (isMounted.current) {
          setAcademy(null);
          setAppState('SUPER_ADMIN');
        }
        return;
      }

      // حسابات غير مفعلة
      if (activeProfile.is_activated === false) {
        if (isMounted.current) {
          setAcademy(null);
          setAppState('PENDING_APPROVAL');
        }
        return;
      }

      let currentAcademy = null;
      let detectedRole = activeProfile.role || 'admin';

      // 2. البحث عن الأكاديمية المملوكة أولاً
      const { data: ownedAcademy } = await supabase
        .from('academies')
        .select('*')
        .eq('owner_id', currentUser.id)
        .limit(1)
        .maybeSingle();

      if (ownedAcademy) {
        currentAcademy = ownedAcademy;
        detectedRole = 'admin';
      } else {
        // 3. البحث في عضويات الأكاديمية كـ Fallback مع استرجاع الدور المخصص
        const { data: memList } = await supabase
          .from('academy_members')
          .select('academy_id, role')
          .eq('user_id', currentUser.id)
          .limit(1);

        if (memList && memList.length > 0 && memList[0]?.academy_id) {
          const { data: joinedAcademy } = await supabase
            .from('academies')
            .select('*')
            .eq('id', memList[0].academy_id)
            .maybeSingle();

          if (joinedAcademy) {
            currentAcademy = joinedAcademy;
            if (memList[0].role) {
              detectedRole = memList[0].role;
            }
          }
        }
      }

      // 4. تعيين الحالة النهائية مع تثبيت الدور
      if (isMounted.current) {
        setUserRole(detectedRole);
        
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
          // في حال عدم وجود أكاديمية، ننشئ كائن مؤقت لتفادي حظر الشاشات
          setAcademy({
            id: 'default',
            name: 'الأكاديمية الافتراضية',
            is_active: true
          });
          setAppState('FULLY_ACTIVE');
        }
      }

    } catch (e) {
      console.error("🚨 خطأ غير متوقع في معالجة الصلاحيات:", e);
      if (isMounted.current) setAppState('FULLY_ACTIVE');
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      await fetchUserStatus(data?.user || null);
    } catch (err) {
      console.error("🚨 خطأ أثناء تحديث الحالة:", err);
      if (isMounted.current) setAppState('FULLY_ACTIVE');
    }
  }, [fetchUserStatus]);

  useEffect(() => {
    let isSubscribed = true;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (isSubscribed) {
          await fetchUserStatus(data?.session?.user || null);
        }
      } catch (err) {
        console.error("🚨 Auth initialization error:", err);
        if (isSubscribed && isMounted.current) setAppState('UNAUTHENTICATED');
      }
    }

    initAuth();

    let authListener = null;
    if (supabase?.auth && typeof supabase.auth.onAuthStateChange === 'function') {
      const res = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'INITIAL_SESSION') return;
        if (isSubscribed) {
          fetchUserStatus(session?.user || null);
        }
      });
      authListener = res?.data?.subscription || res?.subscription || null;
    }

    const safetyTimer = setTimeout(() => {
      if (isMounted.current) {
        setAppState((prev) => (prev === 'LOADING' ? 'FULLY_ACTIVE' : prev));
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearTimeout(safetyTimer);
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      }
    };
  }, [fetchUserStatus]);

  useEffect(() => {
    if (!user?.id || !supabase) return;

    let channel = null;
    try {
      channel = supabase.channel(`profile_changes_${user.id}`);
      
      if (channel && typeof channel.on === 'function') {
        channel
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          }, () => {
            refreshStatus();
          })
          .subscribe();
      }
    } catch (err) {
      console.error("🚨 Realtime subscription error:", err);
    }

    return () => {
      if (channel && supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, refreshStatus]);

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.removeItem('current_academy_slug');
      }
      if (isMounted.current) {
        setAcademy(null);
        setUser(null);
        setProfile(null);
        setUserRole(null);
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
      userRole,
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
    return {
      user: null,
      profile: null,
      academy: null,
      userRole: null,
      appState: 'LOADING',
      updateAcademyState: () => {},
      logout: async () => {},
      refreshStatus: async () => {}
    };
  }
  return context;
};
