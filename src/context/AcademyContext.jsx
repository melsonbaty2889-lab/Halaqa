/* src/context/AcademyContext.jsx */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
  
  // 🛡️ قراءة سريعة من الـ LocalStorage لمنع تأخر المعرف أثناء الريفرش
  const cachedAcademyId = typeof window !== 'undefined' 
    ? (localStorage.getItem('active_academy_id') || localStorage.getItem('academy_id') || null)
    : null;

  const [academy, setAcademy] = useState(() => cachedAcademyId ? { id: cachedAcademyId } : null);
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
      setAcademy((prev) => {
        const updated = prev ? { ...prev, ...newAcademyData } : newAcademyData;
        if (updated?.id) {
          localStorage.setItem('active_academy_id', updated.id);
          localStorage.setItem('academy_id', updated.id);
        }
        return updated;
      });

      setAcademiesList((prevList) => 
        prevList.map((item) => {
          if (newAcademyData?.id && item.id === newAcademyData.id) {
            return { ...item, ...newAcademyData };
          }
          if (!newAcademyData?.id && academy?.id && item.id === academy.id) {
            return { ...item, ...newAcademyData };
          }
          return item;
        })
      );
    }
  }, [academy?.id]);

  const getAcademyName = useCallback(
    (targetAcademy = academy) => {
      if (!targetAcademy) return '';
      const currentLang = i18n?.language || 'ar';
      return extractAcademyName(targetAcademy.name || targetAcademy.title, currentLang);
    },
    [academy, i18n?.language]
  );

  const clearAuthState = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_academy_slug');
      localStorage.removeItem('active_academy_id');
      localStorage.removeItem('academy_id');
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

      const { data: activeProfile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profError || !activeProfile) {
        console.error("🚨 تعذر جلب البروفايل:", profError);
        clearAuthState();
        return;
      }

      if (isMounted.current) {
        setProfile(activeProfile);
        setUserRole(activeProfile.role || null);
      }

      if (!activeProfile.role) {
        if (isMounted.current) setAppState('ROLE_SELECTION');
        return;
      }

      if (activeProfile.role === 'super_admin') {
        if (isMounted.current) setAppState('SUPER_ADMIN');
        return;
      }

      let targetAcademy = null;
      let detectedRole = activeProfile.role;

      if (activeProfile.academy_id) {
        const { data: profileAcademy } = await supabase
          .from('academies')
          .select('*')
          .eq('id', activeProfile.academy_id)
          .maybeSingle();
        
        if (profileAcademy) targetAcademy = profileAcademy;
      }

      if (!targetAcademy && activeProfile.role === 'admin') {
        const { data: ownedAcademies } = await supabase
          .from('academies')
          .select('*')
          .eq('owner_id', currentUser.id)
          .limit(1);

        if (ownedAcademies && ownedAcademies.length > 0) {
          targetAcademy = ownedAcademies[0];
          
          if (targetAcademy?.id && !activeProfile.academy_id) {
            await supabase
              .from('profiles')
              .update({ academy_id: targetAcademy.id })
              .eq('id', currentUser.id);
            
            activeProfile.academy_id = targetAcademy.id;
            if (isMounted.current) setProfile({ ...activeProfile });
          }
        }
      }

      if (isMounted.current) {
        setUserRole(detectedRole);

        if (targetAcademy) {
          setAcademy(targetAcademy);
          setAcademiesList([targetAcademy]);
          
          localStorage.setItem('active_academy_id', targetAcademy.id);
          localStorage.setItem('academy_id', targetAcademy.id);
          if (targetAcademy.slug) {
            localStorage.setItem('current_academy_slug', targetAcademy.slug);
          }

          setAppState('FULLY_ACTIVE');
        } else {
          setAcademy(null);
          setAcademiesList([]);
          localStorage.removeItem('active_academy_id');
          localStorage.removeItem('academy_id');

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
      if (typeof supabase.channel === 'function') {
        const channelName = `profile_changes_${user.id}_${Date.now()}`;
        
        channel = supabase
          .channel(channelName)
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

  // 🛡️ استخراج معرّف الأكاديمية الصريح بحماية كاملة
  const resolvedAcademyId = academy?.id || profile?.academy_id || cachedAcademyId || null;

  const contextValue = useMemo(() => ({
    user,
    profile,
    academy,
    academiesList,
    userRole,
    appState,
    academyId: resolvedAcademyId,       // 👈 إتاحة camelCase
    academyid: resolvedAcademyId,       // 👈 إتاحة lowercase لمنع أي خطأ أملائي
    activeAcademyId: resolvedAcademyId,
    setAcademy: (newAcademy) => {
      if (newAcademy?.id) {
        localStorage.setItem('active_academy_id', newAcademy.id);
        localStorage.setItem('academy_id', newAcademy.id);
      }
      setAcademy(newAcademy);
    },
    updateAcademyState,
    getAcademyName,
    logout,
    refreshStatus
  }), [user, profile, academy, academiesList, userRole, appState, resolvedAcademyId, updateAcademyState, getAcademyName, logout, refreshStatus]);

  return (
    <AcademyContext.Provider value={contextValue}>
      {children}
    </AcademyContext.Provider>
  );
};

// 🛡️ هانئ ومحصن 100% يمنع أي كراش حتى لو استدعي خارج الـ Provider أو أثناء الإقلاع
export const useAcademy = () => {
  const context = useContext(AcademyContext);
  const fallbackId = typeof window !== 'undefined' 
    ? (localStorage.getItem('active_academy_id') || localStorage.getItem('academy_id') || null) 
    : null;

  if (!context) {
    return {
      user: null,
      profile: null,
      academy: fallbackId ? { id: fallbackId } : null,
      academiesList: [],
      userRole: null,
      appState: 'LOADING',
      academyId: fallbackId,
      academyid: fallbackId,
      activeAcademyId: fallbackId,
      setAcademy: () => {},
      updateAcademyState: () => {},
      getAcademyName: () => '',
      logout: async () => {},
      refreshStatus: async () => {}
    };
  }
  return context;
};
