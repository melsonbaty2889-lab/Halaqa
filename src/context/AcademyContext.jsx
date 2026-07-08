import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AcademyContext = createContext({});

export const AcademyProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [appState, setAppState] = useState('LOADING');

  const fetchUserStatus = async (currentUser) => {
    if (!currentUser) {
      setAppState('UNAUTHENTICATED');
      return;
    }

    try {
      setUser(currentUser);
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profError || !profData) {
        setAppState('UNAUTHENTICATED');
        return;
      }

      setProfile(profData);

      if (profData.role === 'super_admin') {
        setAppState('SUPER_ADMIN');
      } else if (profData.role === 'admin' && !profData.is_activated) {
        setAppState('PENDING_APPROVAL');
      } else {
        // فحص الأكاديمية
        const { data: acadData } = await supabase
          .from('academies')
          .select('*')
          .eq('owner_id', currentUser.id)
          .single();

        if (acadData) {
          setAppState(acadData.is_active ? 'FULLY_ACTIVE' : 'PENDING_APPROVAL');
        } else {
          setAppState(profData.role === 'admin' ? 'NO_ACADEMY' : 'UNAUTHENTICATED');
        }
      }
    } catch (e) {
      setAppState('UNAUTHENTICATED');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => fetchUserStatus(session?.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => fetchUserStatus(session?.user));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AcademyContext.Provider value={{ user, profile, appState, logout: () => supabase.auth.signOut(), refreshStatus: () => fetchUserStatus(user) }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => useContext(AcademyContext);
