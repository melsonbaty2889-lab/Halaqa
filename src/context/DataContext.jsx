/* src/context/DataContext.jsx */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAcademy } from './AcademyContext'; // لجلب بيانات الأكاديمية وحالة الحساب

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const { academy, appState } = useAcademy(); // استخراج الأكاديمية والحالة من الحارس الرئيسي
  const [halaqas, setHalaqas] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // 1. جلب الحلقات (ترتيب أبجدي بالاسم العربي)
  const fetchHalaqas = async (academyId) => {
    try {
      const { data, error } = await supabase
        .from('halaqas')
        .select('*')
        .eq('academy_id', academyId)
        .eq('is_archived', false)
        .order('name_ar', { ascending: true }); // ترتيب أبجدي منظم

      if (error) throw error;
      setHalaqas(data || []);
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب الحلقات:", err.message);
    }
  };

  // 2. جلب الطلاب (ترتيب أبجدي بالاسم)
  const fetchStudents = async (academyId) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('academy_id', academyId)
        .eq('is_archived', false)
        .order('name', { ascending: true }); // ترتيب أبجدي منظم

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب الطلاب:", err.message);
    }
  };

  // 3. جلب المدرسين (ربط جدول academy_teachers مع profiles)
  const fetchTeachers = async (academyId) => {
    try {
      // نجلب أولاً المعرفات النشطة من جدول الربط academy_teachers
      const { data: relationData, error: relError } = await supabase
        .from('academy_teachers')
        .select('teacher_id')
        .eq('academy_id', academyId)
        .eq('is_active', true);

      if (relError) throw relError;

      if (relationData && relationData.length > 0) {
        const teacherIds = relationData.map(r => r.teacher_id);
        
        // جلب بياناتهم الشخصية من جدول profiles
        const { data: profilesData, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', teacherIds)
          .order('full_name', { ascending: true });

        if (profError) throw profError;
        setTeachers(profilesData || []);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب المدرسين:", err.message);
    }
  };

  // مراقبة حالة التطبيق وجلب البيانات عند اكتمال الدخول بنجاح
  useEffect(() => {
    if (appState === 'FULLY_ACTIVE' && academy?.id) {
      setLoadingData(true);
      Promise.all([
        fetchHalaqas(academy.id),
        fetchStudents(academy.id),
        fetchTeachers(academy.id)
      ]).finally(() => setLoadingData(false));
    } else {
      // تفريغ البيانات عند خروج المستخدم أو قفل الحساب
      setHalaqas([]);
      setStudents([]);
      setTeachers([]);
    }
  }, [appState, academy]);

  return (
    <DataContext.Provider value={{
      halaqas,
      students,
      teachers,
      loadingData,
      refreshHalaqas: () => academy?.id && fetchHalaqas(academy.id),
      refreshStudents: () => academy?.id && fetchStudents(academy.id),
      refreshTeachers: () => academy?.id && fetchTeachers(academy.id)
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);