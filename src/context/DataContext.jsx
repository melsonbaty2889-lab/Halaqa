/* src/context/DataContext.jsx */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAcademy } from './AcademyContext'; // لجلب بيانات الأكاديمية وحالة الحساب

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const { academy, appState } = useAcademy(); // استخراج الأكاديمية والحالة من الحارس الرئيسي
  const [halaqas, setHalaqas] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // 1. جلب الحلقات النشطة الخاصة بالأكاديمية
  const fetchHalaqas = useCallback(async (academyId) => {
    if (!academyId) return;
    try {
      const { data, error } = await supabase
        .from('halaqas')
        .select('*')
        .eq('academy_id', academyId)
        .or('is_archived.eq.false,is_archived.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHalaqas(data || []);
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب الحلقات:", err.message);
    }
  }, []);

  // 2. جلب الطلاب النشطين الخاصين بالأكاديمية
  const fetchStudents = useCallback(async (academyId) => {
    if (!academyId) return;
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('academy_id', academyId)
        .or('is_archived.eq.false,is_archived.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب الطلاب:", err.message);
    }
  }, []);

  // 3. جلب المدرسين النشطين (استعلام مدمج للربط بطلب واحد بدلاً من طلبين)
  const fetchTeachers = useCallback(async (academyId) => {
    if (!academyId) return;
    try {
      const { data, error } = await supabase
        .from('academy_teachers')
        .select(`
          teacher_id,
          profiles (*)
        `)
        .eq('academy_id', academyId)
        .eq('is_active', true);

      if (error) throw error;

      // استخراج ملفات تعريف المعلمين من نتائج الربط
      const extractedTeachers = data
        ?.map(item => item.profiles)
        .filter(Boolean) || [];

      setTeachers(extractedTeachers);
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب المدرسين:", err.message);
    }
  }, []);

  // 4. دالة تحديث شاملة لجميع البيانات
  const refreshAllData = useCallback(async () => {
    if (!academy?.id) return;
    setLoadingData(true);
    await Promise.all([
      fetchHalaqas(academy.id),
      fetchStudents(academy.id),
      fetchTeachers(academy.id)
    ]);
    setLoadingData(false);
  }, [academy?.id, fetchHalaqas, fetchStudents, fetchTeachers]);

  // مراقبة حالة التطبيق وجلب البيانات عند اكتمال الدخول بنجاح
  useEffect(() => {
    let isMounted = true;

    if (appState === 'FULLY_ACTIVE' && academy?.id) {
      setLoadingData(true);
      Promise.all([
        fetchHalaqas(academy.id),
        fetchStudents(academy.id),
        fetchTeachers(academy.id)
      ]).finally(() => {
        if (isMounted) setLoadingData(false);
      });
    } else {
      // تفريغ البيانات عند خروج المستخدم أو قفل الحساب لضمان الخصوصية والأمان
      setHalaqas([]);
      setStudents([]);
      setTeachers([]);
      setLoadingData(false);
    }

    return () => {
      isMounted = false;
    };
  }, [appState, academy?.id, fetchHalaqas, fetchStudents, fetchTeachers]);

  return (
    <DataContext.Provider value={{
      halaqas,
      students,
      teachers,
      loadingData,
      refreshHalaqas: () => academy?.id && fetchHalaqas(academy.id),
      refreshStudents: () => academy?.id && fetchStudents(academy.id),
      refreshTeachers: () => academy?.id && fetchTeachers(academy.id),
      refreshAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
