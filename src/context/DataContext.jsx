/* src/context/DataContext.jsx */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext.jsx'; 

const DataContext = createContext({
  halaqas: [],
  students: [],
  teachers: [],
  loadingData: false,
  refreshHalaqas: () => {},
  refreshStudents: () => {},
  refreshTeachers: () => {},
  refreshAllData: () => {}
});

// مفاتيح التخزين المحلي للـ Caching
const getCacheKey = (academyId, key) => `halaqa_cache_${academyId}_${key}`;

export const DataProvider = ({ children }) => {
  const academyContext = useAcademy() || {};
  const { academy, appState } = academyContext;
  
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
      const { data: relations, error: relError } = await supabase
        .from('academy_teachers')
        .select('teacher_id, is_active')
        .eq('academy_id', academyId)
        .eq('is_active', true);

      if (relError) throw relError;

      const teacherIds = (relations || []).map(item => item.teacher_id).filter(Boolean);

      if (teacherIds.length === 0) {
        setTeachers([]);
        localStorage.setItem(getCacheKey(academyId, 'teachers'), JSON.stringify([]));
        return;
      }

      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .in('id', teacherIds)
        .eq('is_archived', false);

      if (teachersError) throw teachersError;

      const freshData = teachersData || [];
      setTeachers(freshData);
      localStorage.setItem(getCacheKey(academyId, 'teachers'), JSON.stringify(freshData));
    } catch (err) {
      console.error("🚨 خطأ أثناء جلب المدرسين:", err.message);
    }
  }, []);

  // 4. دالة تحديث شاملة لجميع البيانات
  const refreshAllData = useCallback(async () => {
    const targetId = academy?.id || localStorage.getItem('active_academy_id');
    if (!targetId) return;
    setLoadingData(true);
    await Promise.all([
      fetchHalaqas(targetId),
      fetchStudents(targetId),
      fetchTeachers(targetId)
    ]);
    setLoadingData(false);
  }, [academy?.id, fetchHalaqas, fetchStudents, fetchTeachers]);

  // مراقبة حالة التطبيق واستعراض الكاش فوراً ثم جلب البيانات الحديثة
  useEffect(() => {
    let isMounted = true;
    const targetId = academy?.id || localStorage.getItem('active_academy_id');

    if ((appState === 'FULLY_ACTIVE' || targetId) && targetId) {
      loadCachedData(targetId);

      setLoadingData(true);
      Promise.all([
        fetchHalaqas(targetId),
        fetchStudents(targetId),
        fetchTeachers(targetId)
      ]).finally(() => {
        if (isMounted) setLoadingData(false);
      });
    } else {
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
      refreshHalaqas: () => (academy?.id || localStorage.getItem('active_academy_id')) && fetchHalaqas(academy?.id || localStorage.getItem('active_academy_id')),
      refreshStudents: () => (academy?.id || localStorage.getItem('active_academy_id')) && fetchStudents(academy?.id || localStorage.getItem('active_academy_id')),
      refreshTeachers: () => (academy?.id || localStorage.getItem('active_academy_id')) && fetchTeachers(academy?.id || localStorage.getItem('active_academy_id')),
      refreshAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};

// 🛡️ حماية نهائية لهوك useData لمنع الكراش تماماً لو تم استدعاؤه خارج الـ Provider
export const useData = () => {
  const context = useContext(DataContext);
  return context || {
    halaqas: [],
    students: [],
    teachers: [],
    loadingData: false,
    refreshHalaqas: () => {},
    refreshStudents: () => {},
    refreshTeachers: () => {},
    refreshAllData: () => {}
  };
};
