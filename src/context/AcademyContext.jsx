/* src/context/AcademyContext.jsx */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

const AcademyContext = createContext(null);

const extractAcademyName = (nameData, lang = 'ar') => {
  if (!nameData) return '';
  
  let parsed = nameData;
  if (typeof nameData === 'string') {
    try {
      parsed = JSON.parse(nameData);
    } catch {
      return nameData;
    }
  }

  if (typeof parsed === 'object' && parsed !== null) {
    return (
      parsed[lang] ||
      parsed.ar ||
      parsed.en ||
      parsed.tr ||
      parsed.fr ||
      parsed.ur ||
      parsed.id ||
      Object.values(parsed).find((val) => typeof val === 'string' && val.trim() !== '') ||
      ''
    );
  }

  return String(nameData);
};

export const AcademyProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [academy, setAcademy] = useState(null);
  const [academiesList, setAcademiesList] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [appState, setAppState] = useState('LOADING');

  const isMounted = useRef(true);
  const isFetchingRef = useRef(false);

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

  const getAcademyName = useCallback(
    (targetAcademy = academy) => {
      if (!targetAcademy) return '';
      const currentLang = i18n.language || 'ar';
      return extractAcademyName(targetAcademy.name || targetAcademy.title, currentLang);
    },
    [academy, i18n.language]
  );

  const clearAuthState = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_academy_slug');
      sessionStorage.clear();
    }
    if (isMounted.current) {
      setUser(null);
      setProfile(null);
      setAcademy(null);
      setAcademiesList([]);
      setUserRole(null);
      setAppState('UNAUTHENTICATED');
    }
  }, []);

  const fetchUserStatus = useCallback(async (currentUser) => {
    if (!currentUser) {
      clearAuthState();
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (isMounted.current) setUser(currentUser);

      // 1. جلب بيانات البروفايل الرسمية حصرياً من قاعدة البيانات
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profError || !profData) {
        console.error("🚨 تعذر جلب البروفايل المعتمد:", profError);
        clearAuthState();
        return;
      }

      const activeProfile = profData;

      if (isMounted.current) {
        setProfile(activeProfile);
        setUserRole(activeProfile.role || null);
      }

      // حسابات تفتقر لدور محدد
      if (!activeProfile.role) {
        if (isMounted.current) {
          setAcademy(null);
          setAcademiesList([]);
          setAppState('ROLE_SELECTION');
        }
        return;
      }

      // حسابات Super Admin
      if (activeProfile.role === 'super_admin') {
        if (isMounted.current) {
          setAcademy(null);
          setAcademiesList([]);
          setAppState('SUPER_ADMIN');
        }
        return;
      }

      // حسابات غير مفعلة
      if (activeProfile.is_activated === false) {
        if (isMounted.current) {
          setAcademy(null);
          setAcademiesList([]);
          setAppState('PENDING_APPROVAL');
        }
        return;
      }

      let fetchedList = [];
      let currentAcademy = null;
      let detectedRole = activeProfile.role;

      // 2. الاستعلام عن الأكاديمية المرتبطة عبر profile.academy_id
      if (activeProfile.academy_id) {
        const { data: profileAcademy } = await supabase
          .from('academies')
          .select('*')
          .eq('id', activeProfile.academy_id)
          .maybeSingle();

        if (profileAcademy) fetchedList.push(profileAcademy);
      }

      // 3. الاستعلام عن الأكاديميات كمعلم
      if (fetchedList.length === 0) {
        const { data: teacherList } = await supabase
          .from('academy_teachers')
          .select('academy_id, academies(*)')
          .eq('teacher_id', currentUser.id)
          .eq('is_active', true);

        if (teacherList && teacherList.length > 0) {
          fetchedList = teacherList.map((t) => t.academies).filter(Boolean);
          detectedRole = 'teacher';
        }
      }

      // 4. الاستعلام عن الأكاديميات كمالك (Owner)
      if (fetchedList.length === 0) {
        const { data: ownedAcademies } = await supabase
          .from('academies')
          .select('*')
          .eq('owner_id', currentUser.id);

        if (ownedAcademies && ownedAcademies.length > 0) {
          fetchedList = ownedAcademies;
          detectedRole = 'admin';
        }
      }

      currentAcademy = fetchedList[0] || null;

      // 5. تعيين الحالة المعيارية الحقيقية
      if (isMounted.current) {
        setUserRole(detectedRole);
        setAcademiesList(fetchedList);

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
          // إذا كان مديراً أو مستخدماً بدون أكاديمية حقيقية
          setAcademy(null);
          if (detectedRole === 'admin') {
            setAppState('NO_ACADEMY');
          } else {
            setAppState('FULLY_ACTIVE');
          }
        }
      }

    } catch (e) {
      console.error("🚨 خطأ أثناء معالجة الصلاحيات:", e);
      clearAuthState();
    } finally {
      isFetchingRef.current = false;
    }
  }, [clearAuthState]);

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      await fetchUserStatus(data?.user || null);
    } catch (err) {
      console.error("🚨 خطأ أثناء تحديث الحالة:", err);
      clearAuthState();
    }
  }, [fetchUserStatus, clearAuthState]);

  useEffect(() => {
    let isSubscribed = true;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (isSubscribed) {
          const initUser = data?.session?.user;
          // حماية عند التهيئة الأولية للجلسة المتروكة من SignUp
          if (initUser && Array.isArray(initUser.identities) && initUser.identities.length === 0) {
            await supabase.auth.signOut();
            clearAuthState();
            return;
          }
          await fetchUserStatus(initUser || null);
        }
      } catch (err) {
        console.error("🚨 خطأ إقلاع المصادقة:", err);
        if (isSubscribed) clearAuthState();
      }
    }

    initAuth();

    let authListener = null;
    if (supabase?.auth && typeof supabase.auth.onAuthStateChange === 'function') {
      const res = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'INITIAL_SESSION') return;

        const currentUser = session?.user;
        // 🛑 الحماية المركزية: اعتراض أي جلسة ناتجة عن محاولة SignUp ببريد مسجل
        const isExistingUserFromSignUp =
          currentUser &&
          Array.isArray(currentUser.identities) &&
          currentUser.identities.length === 0;

        if (isExistingUserFromSignUp) {
          await supabase.auth.signOut();
          if (isSubscribed) {
            clearAuthState();
          }
          return;
        }

        if (isSubscribed) {
          fetchUserStatus(currentUser || null);
        }
      });
      authListener = res?.data?.subscription || res?.subscription || null;
    }

    const safetyTimer = setTimeout(() => {
      if (isMounted.current) {
        setAppState((prev) => (prev === 'LOADING' ? 'UNAUTHENTICATED' : prev));
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearTimeout(safetyTimer);
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      }
    };
  }, [fetchUserStatus, clearAuthState]);

  useEffect(() => {
    if (!user?.id || !supabase) return;

    let channel = null;
    try {
      channel = supabase.channel(`profile_changes_${user.id}`);
      
      if (channel && typeof channel.on === 'function') {
        channel
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${user.id}`
            },
            () => {
              refreshStatus();
            }
          )
          .subscribe();
      }
    } catch (err) {
      console.error("🚨 خطأ الاشتراك اللحظي:", err);
    }

    return () => {
      if (channel && supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, refreshStatus]);

  const logout = async () => {
    try {
      clearAuthState();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("🚨 خطأ أثناء تسجيل الخروج:", error);
    }
  };

  return (
    <AcademyContext.Provider
      value={{
        user,
        profile,
        academy,
        academiesList,
        userRole,
        appState,
        setAcademy,
        updateAcademyState,
        getAcademyName,
        logout,
        refreshStatus
      }}
    >
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
      academiesList: [],
      userRole: null,
      appState: 'LOADING',
      setAcademy: () => {},
      updateAcademyState: () => {},
      getAcademyName: () => '',
      logout: async () => {},
      refreshStatus: async () => {}
    };
  }
  return context;
};
