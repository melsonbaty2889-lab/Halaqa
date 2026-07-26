import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBars, FaBell, FaGlobe, FaUserCheck, FaCoins, FaCheck, FaCheckDouble, FaTrashAlt } from 'react-icons/fa';

import arTranslation from '../../locales/ar.json';
import enTranslation from '../../locales/en.json';

export default function Header({ 
  activeTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isRtl, 
  currentCurrency = 'USD',
  onCurrencyChange
}) {
  const { t, i18n } = useTranslation();
  
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false); // 👤 حالة قائمة البروفايل

  // 🔔 بيانات إشعارات تفاعلية
  const [notifications, setNotifications] = useState([
    { id: 1, titleAr: 'تم إنشاء الحلقة بنجاح', titleEn: 'Halaqa Created', time: currentLanguage === 'ar' ? 'منذ 10 دقائق' : '10m ago', read: false },
    { id: 2, titleAr: 'تم تسجيل طالب جديد بالنظام', titleEn: 'New Student Registered', time: currentLanguage === 'ar' ? 'منذ ساعة' : '1h ago', read: false }
  ]);

  // إغلاق القوائم عند النقر خارجها
  const currencyRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrencyMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies = [
    { code: 'USD', name: 'USD' },
    { code: 'EGP', name: 'EGP' },
    { code: 'SAR', name: 'SAR' },
    { code: 'EUR', name: 'EUR' },
    { code: 'AED', name: 'AED' },
  ];

  const currentLanguage = i18n.language || 'ar';
  const currentTranslations = currentLanguage === 'ar' ? arTranslation : enTranslation;

  let pathname = '';
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (e) {
    pathname = '';
  }

  const activeKey = (activeTab || pathname.replace('/', '') || 'dashboard').trim();
  const pageTitle = currentTranslations?.nav?.[activeKey] || t(`nav.${activeKey}`) || activeKey;

  // 🌐 تفعيل تغيير اللغة بشكل فوري ومباشر
  const toggleLanguage = () => {
    const nextLng = currentLanguage === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLng);
    localStorage.setItem('i18nextLng', nextLng);
  };

  // 💰 تفعيل تغيير العملة وحفظها
  const handleSelectCurrency = (code) => {
    if (onCurrencyChange) onCurrencyChange(code);
    localStorage.setItem('app_currency', code);
    setShowCurrencyMenu(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <header style={{
      minHeight: '60px',
      backgroundColor: '#0b1329',
      borderBottom: '1px solid #1e293b',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      color: '#fff',
      direction: isRtl ? 'rtl' : 'ltr',
      gap: '8px',
      flexWrap: 'nowrap'
    }}>
      {/* 1️⃣ زر القائمة وعنوان الصفحة */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
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
            fontSize: '0.95rem',
            flexShrink: 0
          }}
          title="القائمة"
        >
          <FaBars />
        </button>

        <h1 style={{
          margin: 0,
          fontSize: '0.78rem',
          fontWeight: '700',
          color: '#ffffff',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.2'
        }}>
          {pageTitle}
        </h1>
      </div>

      {/* 2️⃣ أدوات التحكم (العملة، اللغة، الإشعارات، البروفايل) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
        
        {/* زر العملة والقائمة */}
        <div style={{ position: 'relative' }} ref={currencyRef}>
          <button
            onClick={() => {
              setShowCurrencyMenu(!showCurrencyMenu);
              setShowNotifMenu(false);
              setShowProfileMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '5px 6px',
              background: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#fbbf24',
              fontSize: '0.68rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <FaCoins style={{ fontSize: '0.75rem' }} />
            <span>{currentCurrency}</span>
          </button>

          {showCurrencyMenu && (
            <div style={{
              position: 'absolute',
              top: '36px',
              right: isRtl ? '0' : 'auto',
              left: isRtl ? 'auto' : '0',
              backgroundColor: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '6px 0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              zIndex: 150,
              minWidth: '90px'
            }}>
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleSelectCurrency(curr.code)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: currentCurrency === curr.code ? '#10b981' : '#cbd5e1',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    textAlign: isRtl ? 'right' : 'left'
                  }}
                >
                  <span>{curr.name}</span>
                  {currentCurrency === curr.code && <FaCheck style={{ fontSize: '0.6rem' }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* زر تغيير اللغة المباشر */}
        <button
          onClick={toggleLanguage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '5px 6px',
            background: '#131f37',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            color: '#cbd5e1',
            fontSize: '0.68rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <FaGlobe style={{ color: '#38bdf8', fontSize: '0.75rem' }} />
          <span>{currentLanguage === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* زر الإشعارات والقائمة المنسدلة (تم تفعيلها بالكامل) */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowCurrencyMenu(false);
              setShowProfileMenu(false);
            }}
            style={{ 
              background: '#131f37', 
              border: '1px solid #1e293b', 
              color: '#cbd5e1', 
              padding: '6px 8px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <FaBell style={{ fontSize: '0.8rem', color: '#fbbf24' }} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '3px', 
                right: '3px', 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: '#10b981' 
              }}></span>
            )}
          </button>

          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              top: '36px',
              right: isRtl ? '0' : 'auto',
              left: isRtl ? 'auto' : '0',
              backgroundColor: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              zIndex: 150,
              width: '220px',
              color: '#cbd5e1',
              fontSize: '0.72rem',
              textAlign: isRtl ? 'right' : 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>
                  {currentLanguage === 'ar' ? 'التنبيهات' : 'Notifications'}
                </span>
                {notifications.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={markAllAsRead} title={currentLanguage === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.7rem' }}>
                      <FaCheckDouble />
                    </button>
                    <button onClick={clearAll} title={currentLanguage === 'ar' ? 'مسح الكل' : 'Clear all'} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.7rem' }}>
                      <FaTrashAlt />
                    </button>
                  </div>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '8px 0', color: '#94a3b8', textAlign: 'center' }}>
                  {currentLanguage === 'ar' ? 'لا توجد إشعارات جديدة.' : 'No new notifications.'}
                </div>
              ) : (
                notifications.map((item) => (
                  <div key={item.id} style={{ padding: '6px 0', borderBottom: '1px solid #1e293b55' }}>
                    <div style={{ color: item.read ? '#94a3b8' : '#fff', fontWeight: item.read ? 'normal' : 'bold' }}>
                      {currentLanguage === 'ar' ? item.titleAr : item.titleEn}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '2px' }}>{item.time}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 👤 البروفايل (تم تفعيله وإعطاؤه قائمة منسدلة تفاعلية) */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowCurrencyMenu(false);
              setShowNotifMenu(false);
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: '#131f37', 
              padding: '4px', 
              borderRadius: '6px', 
              border: '1px solid #1e293b',
              cursor: 'pointer'
            }}
            title="الملف الشخصي"
          >
            <div style={{ 
              width: '22px', 
              height: '22px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.2)', 
              color: '#34d399', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.7rem'
            }}>
              <FaUserCheck />
            </div>
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '36px',
              right: isRtl ? '0' : 'auto',
              left: isRtl ? 'auto' : '0',
              backgroundColor: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              zIndex: 150,
              width: '160px',
              color: '#cbd5e1',
              fontSize: '0.72rem',
              textAlign: isRtl ? 'right' : 'left'
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '6px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
                {currentLanguage === 'ar' ? 'حساب المعلم' : 'Teacher Account'}
              </div>
              <button 
                onClick={() => {
                  alert(currentLanguage === 'ar' ? 'تم تسجيل الخروج' : 'Logged out');
                  setShowProfileMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '5px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#f43f5e',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {currentLanguage === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
