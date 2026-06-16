import React from 'react';
import { useTranslation } from 'react-i18next';
import { C } from '../constants/colors';
import { FaUserGraduate, FaUserClock, FaUserCheck, FaGlobe } from "react-icons/fa";

export default function Dashboard({ session, setActiveTab, preloadedDashboardData }) {
  const { t, i18n } = useTranslation();
  
  // استخدام البيانات الممررة مسبقاً والمجلوبة مركزياً أثناء ظهور الـ Splash الفخم
  // في حال لم تتوفر لأي سبب، نضع قيماً افتراضية كحماية للشيفرة البرمجية
  const data = preloadedDashboardData || { academyName: '', stats: { students: 0, pending: 0 } };

  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang === 'ar';

  const translateText = (key, arText, enText) => {
    if (i18n.exists(key)) return t(key);
    return isRtl ? arText : enText;
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      padding: '10px 5px',
      fontFamily: 'sans-serif',
      direction: isRtl ? 'rtl' : 'ltr' 
    }}>
      
      <header style={{ 
        marginBottom: '35px', 
        borderBottom: '1px solid #1e293b', 
        paddingBottom: '20px',
        paddingTop: '45px', 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 'bold', margin: 0 }}>
            {translateText('welcome_back', 'مرحباً بك مجدداً 👋', 'Welcome Back 👋')}
          </h1>
          <p style={{ color: C.gold, fontSize: '1.05rem', margin: '5px 0 0 0', fontWeight: '500' }}>
            {data.academyName || translateText('loading_academy', 'جاري جلب الأكاديمية...', 'Fetching academy...')}
          </p>
        </div>

        <button 
          onClick={toggleLanguage}
          style={{
            background: C.surface || '#111C2A', 
            border: '1px solid #334155',
            color: C.gold,
            padding: '8px 14px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            marginTop: '5px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = C.gold}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
        >
          <FaGlobe />
          <span>{currentLang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '15px', 
        marginBottom: '35px' 
      }}>
        <button 
          onClick={() => setActiveTab('attendance')} 
          className="dashboard-btn"
          style={{ 
            background: '#2563eb', 
            border: 'none', 
            borderRadius: '12px', 
            padding: '16px', 
            color: '#fff', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'transform 0.2s, background-color 0.2s',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}
        >
          <FaUserCheck size={20} />
          {translateText('scan_attendance', 'فحص الحضور والغياب', 'Scan Attendance')}
        </button>
        
        <button 
          onClick={() => setActiveTab('students')} 
          className="dashboard-btn"
          style={{ 
            background: '#059669', 
            border: 'none', 
            borderRadius: '12px', 
            padding: '16px', 
            color: '#fff', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'transform 0.2s, background-color 0.2s',
            boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
          }}
        >
          <FaUserGraduate size={20} />
          {translateText('register_student', 'تسجيل طالب جديد', 'Register Student')}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        <div style={{ 
          background: C.surface, 
          padding: '20px 25px', 
          borderRadius: '16px', 
          borderRight: isRtl ? `5px solid ${C.gold}` : 'none', 
          borderLeft: !isRtl ? `5px solid ${C.gold}` : 'none', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <p style={{ color: '#94a3b8', margin: '0 0 5px 0', fontSize: '13px', fontWeight: '500' }}>
              {translateText('total_students', 'إجمالي الطلاب بالحلقة', 'Total Students')}
            </p>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{data.stats.students}</h2>
          </div>
          <div style={{ fontSize: '26px', color: C.gold, opacity: 0.9 }}><FaUserGraduate /></div>
        </div>

        <div style={{ 
          background: C.surface, 
          padding: '20px 25px', 
          borderRadius: '16px', 
          borderRight: isRtl ? `5px solid #ef4444` : 'none', 
          borderLeft: !isRtl ? `5px solid #ef4444` : 'none', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <p style={{ color: '#94a3b8', margin: '0 0 5px 0', fontSize: '13px', fontWeight: '500' }}>
              {translateText('pending_payments', 'المستحقات المالية المعلقة', 'Pending Payments')}
            </p>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{data.stats.pending}</h2>
          </div>
          <div style={{ fontSize: '26px', color: '#ef4444', opacity: 0.9 }}><FaUserClock /></div>
        </div>
      </div>

      <style>{`
        .dashboard-btn:hover {
          transform: translateY(-2px);
          opacity: 0.95;
        }
        .dashboard-btn:active {
          transform: translateY(0);
        }
      `}</style>

    </div>
  );
}
