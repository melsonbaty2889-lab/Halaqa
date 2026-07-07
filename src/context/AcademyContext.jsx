/* src/context/AcademyContext.jsx */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AcademyContext = createContext({});

export const AcademyProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [academy, setAcademy] = useState(null);
  const [appState, setAppState] = useState('LOADING'); // LOADING, UNAUTHENTICATED, PENDING_APPROVAL, NO_ACADEMY, FULLY_ACTIVE, SUPER_ADMIN

  // الدالة المركزية لفحص حالة الحساب وتوجيهه بدقة طبقاً لقاعدة البيانات
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

      // 1. جلب بيانات البروفايل الفعلي من جدول profiles 🌟
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profError || !profData) {
        // في حال عدم وجود بروفايل بعد أو تأخر الـ Trigger الخاص بإنشائه صامتاً
        setAppState('LOADING');
        return;
      }

      setProfile(profData);

      // 2. التحقق مما إذا كان الحساب هو السوبر أدمن للمنصة بالكامل 🌟
      if (profData.role === 'super_admin') {
        setAppState('SUPER_ADMIN');
        return;
      }

      // 3. التحقق من حالة تفعيل حساب الأدمن/صاحب الأكاديمية 🌟
      if (profData.role === 'admin' && !profData.is_activated) {
        setAppState('PENDING_APPROVAL');
        return;
      }

      // 4. فحص الأكاديمية المرتبطة بـ owner_id للأدمن المقبول 🌟
      const { data: acadData, error: acadError } = await supabase
        .from('academies')
        .select('*')
        .eq('owner_id', currentUser.id)
        .single();

      if (acadError && acadError.code === 'PGRST116') {
        // الحساب معتمد ومفعل ولكن لم يقم ببناء بيانات أكاديميته بعد
        setAcademy(null);
        setAppState('NO_ACADEMY');
      } else if (acadData) {
        setAcademy(acadData);
        // التحقق من أن الأكاديمية نفسها نشطة ولم يتم إيقافها من السوبر أدمن
        setAppState(acadData.is_active ? 'FULLY_ACTIVE' : 'PENDING_APPROVAL');
      } else {
        setAppState('NO_ACADEMY');
      }

    } catch (error) {
      console.error("Error evaluating auth state:", error);
      setAppState('UNAUTHENTICATED');
    }
  };

  useEffect(() => {
    // الفحص الأولي للجلسة عند إقلاع التطبيق
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserStatus(session?.user ?? null);
    });

    // مراقبة التغييرات اللحظية في حالات تسجيل الدخول/الخروج
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserStatus(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    setAppState('LOADING');
    await supabase.auth.signOut();
  };

  return (
    <AcademyContext.Provider value={{ user, profile, academy, appState, logout, refreshStatus: () => fetchUserStatus(user) }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => useContext(AcademyContext);
