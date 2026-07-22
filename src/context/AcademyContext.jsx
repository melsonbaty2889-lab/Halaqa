/* src/context/AcademyContext.jsx */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AcademyContext = createContext({});

export const AcademyProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [academy, setAcademy] = useState(null); // ✨ إضافة حالة الأكاديمية هنا لحل الربط مع DataContext
  const [appState, setAppState] = useState('LOADING');

  const fetchUserStatus = async (currentUser) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setAcademy(null); // ✨ تصفير الأكاديمية عند الخروج
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
        .single();

      if (profError || !profData) {
        console.error("🚨 خطأ في جلب البروفايل أو الحساب غير موجود في الجدول:", profError);
        setAppState('UNAUTHENTICATED');
        return;
      }

      setProfile(profData);

      // 2. إذا كان الحساب هو السوبر أدمن العام للمنصة
      if (profData.role === 'super_admin') {
        setAcademy(null);
        setAppState('SUPER_ADMIN');
        return;
      }

      // 3. الحماية المشتركة: إذا كان الحساب غير مفعل من الإدارة (لأي دور كان)
      if (profData.is_activated === false) {
        setAcademy(null);
        setAppState('PENDING_APPROVAL');
        return;
      }

      // 4. إذا كان الحساب مفعل ودوره مدير أكاديمية (admin)
      if (profData.role === 'admin') {
        const { data: acadData } = await supabase
          .from('academies')
          .select('*')
          .eq('owner_id', currentUser.id)
          .maybeSingle(); // استخدام maybeSingle لتفادي أخطاء جلب عنصر وحيد

        if (acadData) {
          setAcademy(acadData); // ✨ تخزين الأكاديمية هنا ليراها DataContext وسائر المكونات
          // إذا كانت الأكاديمية موجودة ونشطة يدخل، وإلا ينتظر التفعيل
          setAppState(acadData.is_active ? 'FULLY_ACTIVE' : 'PENDING_APPROVAL');
        } else {
          setAcademy(null);
          // أدمن مفعل ولكن لم ينشئ أكاديمية بعد
          setAppState('NO_ACADEMY');
        }
        return;
      }

      // 5. إذا كان الحساب مفعل ودوره (طالب، معلم، ولي أمر)
      if (['student', 'teacher', 'parent'].includes(profData.role)) {
        // ملاحظة: إذا كان الطالب أو المعلم مرتبط بأكاديمية، يمكنك جلبها هنا إذا لزم الأمر، أو تركها FULLY_ACTIVE
        setAppState('FULLY_ACTIVE'); 
        return;
      }

      // حالة احتياطية إذا وجد دور غير معرف بالمنظومة
      setAppState('UNAUTHENTICATED');

    } catch (e) {
      console.error("🚨 خطأ غير متوقع أثناء معالجة الصلاحيات:", e);
      setAppState('UNAUTHENTICATED');
    }
  };

  useEffect(() => {
    // الفحص الفوري عند إقلاع التطبيق
    supabase.auth.getSession().then(({ data: { session } }) => fetchUserStatus(session?.user));
    
    // مراقبة تغير حالة الدخول والخروج في الوقت الفعلي
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => fetchUserStatus(session?.user));
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AcademyContext.Provider value={{ 
      user, 
      profile, 
      academy, // ✨ إرسال الأكاديمية هنا لكي تعمل جميع سياقات البيانات (DataContext) بكفاءة
      appState, 
      logout: async () => {
        setAcademy(null);
        setUser(null);
        setProfile(null);
        await supabase.auth.signOut();
      }, 
      refreshStatus: () => fetchUserStatus(user) 
    }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => useContext(AcademyContext);
