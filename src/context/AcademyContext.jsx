import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AcademyContext = createContext();

export const AcademyProvider = ({ children }) => {
  const [academyId, setAcademyId] = useState(localStorage.getItem('current_academy_id') || null);

  useEffect(() => {
    // إذا لم تكن القيمة موجودة، نحاول جلبها من قاعدة البيانات
    const fetchAcademy = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('staff')
        .select('academy_id')
        .eq('user_id', user.id)
        .single();

      if (data && data.academy_id) {
        setAcademyId(data.academy_id);
      }
    };

    if (!academyId) {
      fetchAcademy();
    }
  }, [academyId]);

  useEffect(() => {
    if (academyId) {
      localStorage.setItem('current_academy_id', academyId);
    }
  }, [academyId]);

  return (
    <AcademyContext.Provider value={{ academyId, setAcademyId }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => useContext(AcademyContext);
