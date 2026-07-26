import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBars, FaBell, FaGlobe, FaUserCheck } from 'react-icons/fa';

// 🌐 استيراد ملفات الترجمة كاملة
import arTranslation from '../../locales/ar.json';
import enTranslation from '../../locales/en.json';

export default function Header({ 
  activeTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isRtl, 
  userRole, 
  profile 
}) {
  const { t, i18n } = useTranslation();
  
  // تحديد اللغة الحالية وملف الترجمة المقابل لها بالكامل
  const currentLanguage = i18n.language || 'ar';
  const currentTranslations = currentLanguage === 'ar' ? arTranslation : enTranslation;

  // الحصول على المسار الحالي للراوتر
  let pathname = '';
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (e) {
    pathname = activeTab ? `/${activeTab}` : '/dashboard';
  }

  // خريطة ربط المسارات بمفاتيح القائمة
  const pathToKey = {
    '/dashboard': 'dashboard',
    '/realtime-audit': 'realtime-audit',
    '/omnichannel-hub': 'omnichannel-hub',
    '/reports': 'reports',
    '/students': 'students',
    '/teachers': 'teachers',
    '/halaqas': 'halaqas',
    '/attendance': 'attendance',
    '/exams': 'exams',
    '/guardian-portal': 'guardian-portal',
    '/gamification-streaks': 'gamification-streaks',
    '/payments': 'payments',
    '/asset-management': 'asset-management',
    '/referrals': 'referrals',
    '/settings': 'settings',
  };

  const currentTabKey = pathToKey[pathname] || 'dashboard';

  // 🎯 جلب النص المترجم مباشرة من شجرة ملف الـ JSON المستورد
  const pageTitle = currentTranslations?.nav?.[currentTabKey] || t(`nav.${currentTabKey}`);

  // دالة تبديل اللغة
  const toggleLanguage = () => {
    const nextLng = currentLanguage === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLng);
  };

  return (
    <header style={{
      height: '60px',
      backgroundColor: '#0b1329',
      borderBottom: '1px solid #1e293b',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      color: '#fff',
      direction: isRtl ? 'rtl' : 'ltr'
    }}>
      {/* 1️⃣ زر القائمة للجوال والعنوان */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          style={{
            background: '#131f37',
            border: '1px solid #1e293b',
            color: '#fbbf24',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}
          title="فتح القائمة"
        >
          <FaBars />
        </button>

        <h1 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: '700',
          color: '#ffffff'
        }}>
          {pageTitle}
        </h1>
      </div>

      {/* 2️⃣ الأدوات وزر تبديل اللغة */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* زر تبديل اللغة */}
        <button
          onClick={toggleLanguage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            background: '#131f37',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <FaGlobe style={{ color: '#38bdf8', fontSize: '0.85rem' }} />
          <span>{currentLanguage === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* زر التنبيهات */}
        <button 
          style={{ 
            background: '#131f37', 
            border: '1px solid #1e293b', 
            color: '#cbd5e1', 
            padding: '8px', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            position: 'relative' 
          }}
        >
          <FaBell style={{ fontSize: '0.9rem', color: '#fbbf24' }} />
          <span style={{ 
            position: 'absolute', 
            top: '4px', 
            right: '4px', 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: '#10b981' 
          }}></span>
        </button>

        {/* بروفايل المستخدم */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#131f37', 
          padding: '4px 8px', 
          borderRadius: '8px', 
          border: '1px solid #1e293b' 
        }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '50%', 
            background: 'rgba(16, 185, 129, 0.2)', 
            color: '#34d399', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <FaUserCheck />
          </div>
        </div>
      </div>
    </header>
  );
}
