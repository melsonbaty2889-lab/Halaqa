import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // تعديل المسار ليتناسب مع المجلدات الفرعية
import { useTranslation } from 'react-i18next';

function MainApp({ session, userRole, trialDaysLeft }) {
  const { t, i18n } = useTranslation();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // دالة بسيطة لتبديل اللغة بشكل سريع وسلس
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
    document.body.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div style={{ background: '#090F17', color: '#F3F4F6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* شريط علوي بسيط للتحكم بالمنصة وتبديل اللغة */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FBBF24', fontSize: '1.5rem', margin: 0 }}>
            {t('welcome', { defaultValue: 'مرحباً بك في المنصة الذكية' })}
          </h1>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>
            الدور الحالي: {userRole || 'طالب'} | الأيام المتبقية للتجربة: {trialDaysLeft}
          </span>
        </div>
        
        <button 
          onClick={toggleLanguage}
          style={{ background: '#1E293B', color: '#FBBF24', border: '1px solid #334155', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
        >
          {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>
      </header>

      {/* محتوى لوحة التحكم الأساسية */}
      <main style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
        <h3 style={{ color: '#F3F4F6', marginBottom: '10px' }}>لوحة التحكم الرئيسية جاهزة</h3>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>تم تفعيل الحماية والربط العالمي مع نظام الترجمة بنجاح.</p>
        
        <button 
          onClick={() => supabase.auth.signOut()}
          style={{ marginTop: '20px', background: '#EF4444', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          تسجيل الخروج الآمن
        </button>
      </main>
    </div>
  );
}

// التصدير الافتراضي الصريح الذي تبحث عنه الواجهة الأساسية لحل خطأ الـ Build
export default MainApp;
