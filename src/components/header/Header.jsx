import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBars, FaUserCheck } from 'react-icons/fa';

// 📂 استيراد المكونات الفرعية الجاهزة في نفس المجلد
import CurrencySelector from './CurrencySelector';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationMenu from './NotificationMenu';

// 🌐 استيراد الترجمات
import arTranslation from '../../locales/ar.json';
import enTranslation from '../../locales/en.json';

export default function Header({ 
  activeTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isRtl, 
  userRole, 
  profile,
  currentCurrency,
  onCurrencyChange
}) {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n.language || 'ar';
  const currentTranslations = currentLanguage === 'ar' ? arTranslation : enTranslation;

  // معرفة المسار والتبويب الحالي
  let pathname = '';
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (e) {
    pathname = '';
  }

  const activeKey = (activeTab || pathname.replace('/', '') || 'dashboard').trim();
  const pageTitle = currentTranslations?.nav?.[activeKey] || t(`nav.${activeKey}`) || activeKey;

  return (
    <header style={{
      height: '60px',
      backgroundColor: '#0b1329',
      borderBottom: '1px solid #1e293b',
      padding: '0 12px',
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
      {/* 1️⃣ زر فتح القائمة + العنوان المترجم الديناميكي */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
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
            fontSize: '1rem',
            flexShrink: 0
          }}
          title="فتح القائمة"
        >
          <FaBars />
        </button>

        <h1 style={{
          margin: 0,
          fontSize: '0.85rem',
          fontWeight: '700',
          color: '#ffffff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '120px'
        }}>
          {pageTitle}
        </h1>
      </div>

      {/* 2️⃣ استدعاء المكونات الفرعية المخصصة بدون تداخل */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        
        {/* مكون اختيار العملة */}
        <CurrencySelector 
          currentCurrency={currentCurrency} 
          onCurrencyChange={onCurrencyChange} 
        />

        {/* مكون تبديل اللغة */}
        <LanguageSwitcher />

        {/* مكون الإشعارات التفاعلي */}
        <NotificationMenu />

        {/* بروفايل المستخدم */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#131f37', 
          padding: '4px 6px', 
          borderRadius: '8px', 
          border: '1px solid #1e293b' 
        }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '50%', 
            background: 'rgba(16, 185, 129, 0.2)', 
            color: '#34d399', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '0.75rem'
          }}>
            <FaUserCheck />
          </div>
        </div>

      </div>
    </header>
  );
}
