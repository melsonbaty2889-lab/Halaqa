import { createContext, useContext, useState, useEffect } from 'react';

const AcademyContext = createContext();

export const AcademyProvider = ({ children }) => {
  const [academyId, setAcademyId] = useState(localStorage.getItem('current_academy_id') || null);

  // تحديث الـ local storage عند تغيير الأكاديمية
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
