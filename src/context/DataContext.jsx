/* src/context/DataContext.jsx */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext.jsx'; 

const DataContext = createContext({});

// مفاتيح التخزين المحلي للـ Caching
const getCacheKey = (academyId, key) => `halaqa_cache_${academyId}_${key}`;

export const DataProvider = ({ children }) => {
  const { academy, appState } = useAcademy();
  const [halaqas, setHalaqas] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // دالة مساعدة لتحميل البيانات المخزنة محلياً فوراً عند الإقلاع
  const loadCachedData = useCallback((academyId) => {
    if (!academyId) return;
    try {
      const cachedHalaqas = localStorage.getItem(getCacheKey(academyId, 'halaqas'));
      const cachedStudents = localStorage.getItem(getCacheKey(academyId, 'students'));
      const cachedTeachers = localStorage.getItem(getCacheKey(academyId, 'teachers'));

      if (cachedHalaqas) setHalaqas(JSON.parse(cachedHalaqas));
      if (cachedStudents) setStudents(JSON.parse(cachedStudents));
      if (cachedTeachers) setTeachers(JSON.parse(cachedTeachers));
    } catch (e) {
      console.warn('⚠️ تعذر قراءة الكاش المحلي:', e);
    }
  }, []);

  // 1. جلب الحلقات النشطة وحفظها في الكاش
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
      
      const freshData = data || [];
      setHalaqas(freshData);
      localStorage.setItem(getCacheKey(academyId, 'halaqas'), JSON.stringify(freshData));
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب الحلقات:", err.message);
    }
  }, []);

  // 2. جلب الطلاب النشطين وحفظهم في الكاش
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

      const freshData = data || [];
      setStudents(freshData);
      localStorage.setItem(getCacheKey(academyId, 'students'), JSON.stringify(freshData));
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب الطلاب:", err.message);
    }
  }, []);

  // 3. جلب المدرسين النشطين وحفظهم في الكاش
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

      const extractedTeachers = data
        ?.map(item => item.profiles)
        .filter(Boolean) || [];

      setTeachers(extractedTeachers);
      localStorage.setItem(getCacheKey(academyId, 'teachers'), JSON.stringify(extractedTeachers));
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

  // مراقبة حالة التطبيق واستعراض الكاش فوراً ثم جلب البيانات الحديثة
  useEffect(() => {
    let isMounted = true;

    if (appState === 'FULLY_ACTIVE' && academy?.id) {
      // أ) قراءة الكاش المحلي أولاً للسرعة اللحظية
      loadCachedData(academy.id);

      // ب) إطلاق التحديث في الخلفية من Supabase
      setLoadingData(true);
      Promise.all([
        fetchHalaqas(academy.id),
        fetchStudents(academy.id),
        fetchTeachers(academy.id)
      ]).finally(() => {
        if (isMounted) setLoadingData(false);
      });
    } else {
      // تفريغ البيانات والـ Cache للحفاظ على خصوصية الحسابات
      setHalaqas([]);
      setStudents([]);
      setTeachers([]);
      setLoadingData(false);
    }

    return () => {
      isMounted = false;
    };
  }, [appState, academy?.id, loadCachedData, fetchHalaqas, fetchStudents, fetchTeachers]);

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
