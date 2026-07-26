import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBars, FaBell, FaGlobe, FaUserCheck, FaCoins, FaCheck } from 'react-icons/fa';

// 🌐 استيراد ملفات الترجمة
import arTranslation from '../../locales/ar.json';
import enTranslation from '../../locales/en.json';

export default function Header({ 
  activeTab, 
  setActiveTab,
  sidebarOpen, 
  setSidebarOpen, 
  isRtl, 
  currentCurrency = 'USD',
  onCurrencyChange
}) {
  const { t, i18n } = useTranslation();

  // 1. حالات القوائم المنسدلة (Dropdown States)
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // قائمة العملات المتاحة
  const currencies = [
    { code: 'USD', symbol: '$', name: 'USD' },
    { code: 'EGP', symbol: 'ج.م', name: 'EGP' },
    { code: 'SAR', symbol: 'ر.س', name: 'SAR' },
    { code: 'EUR', symbol: '€', name: 'EUR' },
    { code: 'AED', symbol: 'د.إ', name: 'AED' },
  ];

  // تحديد اللغة والملف المقابل
  const currentLanguage = i18n.language || 'ar';
  const currentTranslations = currentLanguage === 'ar' ? arTranslation : enTranslation;

  // مسار الصفحة
  let pathname = '';
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (e) {
    pathname = '';
  }

  const activeKey = (activeTab || pathname.replace('/', '') || 'dashboard').trim();
  const pageTitle = currentTranslations?.nav?.[activeKey] || t(`nav.${activeKey}`) || activeKey;

  // دالة تبديل اللغة
  const toggleLanguage = () => {
    const nextLng = currentLanguage === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLng);
  };

  // تغيير العملة
  const handleSelectCurrency = (code) => {
    if (onCurrencyChange) onCurrencyChange(code);
    setShowCurrencyMenu(false);
  };

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
      {/* 1️⃣ الجزء الأيسر/الأيمن: زر القائمة + العنوان (مقاوم للتداخل) */}
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
          title="القائمة"
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
          maxWidth: '130px'
        }}>
          {pageTitle}
        </h1>
      </div>

      {/* 2️⃣ أدوات التحكم والعملات والأزرار */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        
        {/* 🪙 زر تغير العملة والقائمة المنسدلة */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowCurrencyMenu(!showCurrencyMenu);
              setShowNotifMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 8px',
              background: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              color: '#fbbf24',
              fontSize: '0.7rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <FaCoins style={{ fontSize: '0.8rem' }} />
            <span>{currentCurrency}</span>
          </button>

          {/* قائمة العملات */}
          {showCurrencyMenu && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: isRtl ? 'auto' : '0',
              right: isRtl ? '0' : 'auto',
              backgroundColor: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '6px 0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 110,
              minWidth: '100px'
            }}>
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleSelectCurrency(curr.code)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: currentCurrency === curr.code ? '#10b981' : '#cbd5e1',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'start'
                  }}
                >
                  <span>{curr.name}</span>
                  {currentCurrency === curr.code && <FaCheck style={{ fontSize: '0.65rem' }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🌐 زر اللغة */}
        <button
          onClick={toggleLanguage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 8px',
            background: '#131f37',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            color: '#cbd5e1',
            fontSize: '0.7rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <FaGlobe style={{ color: '#38bdf8', fontSize: '0.8rem' }} />
          <span>{currentLanguage === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* 🔔 زر الإشعارات وقائمة التنبيهات */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowCurrencyMenu(false);
            }}
            style={{ 
              background: '#131f37', 
              border: '1px solid #1e293b', 
              color: '#cbd5e1', 
              padding: '7px 9px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <FaBell style={{ fontSize: '0.85rem', color: '#fbbf24' }} />
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

          {/* نافذة الإشعارات المنسدلة */}
          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: isRtl ? '0' : 'auto',
              right: isRtl ? 'auto' : '0',
              backgroundColor: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 110,
              width: '220px',
              color: '#cbd5e1',
              fontSize: '0.75rem'
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', borderBottom: '1px solid #1e293b', pb: '4px' }}>
                {currentLanguage === 'ar' ? 'التنبيهات الإدارية' : 'Notifications'}
              </div>
              <div style={{ padding: '6px 0', color: '#94a3b8' }}>
                {currentLanguage === 'ar' ? 'لا توجد إشعارات جديدة حالياً.' : 'No new notifications.'}
              </div>
            </div>
          )}
        </div>

        {/* 👤 أيقونة المستخدم */}
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
