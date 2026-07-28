import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaBars, 
  FaBell, 
  FaGlobe, 
  FaUserCheck, 
  FaCoins, 
  FaCheck, 
  FaCheckDouble, 
  FaTrashAlt
} from 'react-icons/fa';

import { supabase } from '../../lib/supabase';

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
  const currentLanguage = i18n.language || 'ar';
  const isAr = currentLanguage === 'ar';

  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('app_currency') || currentCurrency || 'USD';
  });

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  const currencyRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('public_notifications_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) setShowCurrencyMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifMenu(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
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

  let pathname = '';
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (e) {
    pathname = '';
  }

  const activeKey = (activeTab || pathname.replace('/', '') || 'dashboard').trim();

  // 🌐 جدول عناوين الصفحات المترجم بالكامل للغتين
  const pageTitlesMap = {
    'dashboard': { ar: 'لوحة التحكم والتحليلات', en: 'Dashboard & Analytics' },
    'realtime-audit': { ar: 'السجل الحي للأنشطة', en: 'Realtime Audit Trail' },
    'communication-hub': { ar: 'مركز التواصل والمراسلات', en: 'Communication & Broadcast Hub' },
    'reports': { ar: 'التقارير والتحليلات', en: 'Reports & Analytics' },
    'students': { ar: 'شؤون الطلاب', en: 'Students Directory' },
    'teachers': { ar: 'الكادر التعليمي', en: 'Faculty & Reciters' },
    'halaqas': { ar: 'الحلقات القرآنية', en: 'Quranic Halaqas' },
    'attendance': { ar: 'متابعة الحضور', en: 'Attendance Tracking' },
    'exams': { ar: 'الاختبارات والتعديل', en: 'Exams & Assessment' },
    'payments': { ar: 'المالية والاشتراكات', en: 'Payments & Treasury' },
    'settings': { ar: 'إعدادات الأكاديمية', en: 'Academy Settings' },
  };

  // 🎯 تحديد عنوان الصفحة حسب اللغة الحالية بشكل مضمون
  const currentTranslations = isAr ? arTranslation : enTranslation;
  const jsonTitle = currentTranslations?.nav?.[activeKey];
  const pageTitle = jsonTitle || pageTitlesMap[activeKey]?.[isAr ? 'ar' : 'en'] || activeKey;

  const toggleLanguage = () => {
    const nextLng = isAr ? 'en' : 'ar';
    i18n.changeLanguage(nextLng);
    localStorage.setItem('i18nextLng', nextLng);
  };

  const handleSelectCurrency = (code) => {
    setSelectedCurrency(code);
    localStorage.setItem('app_currency', code);
    if (onCurrencyChange) onCurrencyChange(code);
    setShowCurrencyMenu(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const dropdownPositionStyle = (isRtl !== undefined ? isRtl : isAr)
    ? { left: 0, right: 'auto' }
    : { right: 0, left: 'auto' };

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
      direction: (isRtl !== undefined ? isRtl : isAr) ? 'rtl' : 'ltr',
      gap: '8px',
      flexWrap: 'nowrap'
    }}>
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
          title={isAr ? "القائمة" : "Menu"}
        >
          <FaBars />
        </button>

        <h1 style={{
          margin: 0,
          fontSize: '0.85rem',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
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
              gap: '4px',
              padding: '6px 8px',
              background: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#fbbf24',
              fontSize: '0.72rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <FaCoins style={{ fontSize: '0.75rem' }} />
            <span>{selectedCurrency}</span>
          </button>

          {showCurrencyMenu && (
            <div style={{
              position: 'absolute',
              top: '40px',
              ...dropdownPositionStyle,
              backgroundColor: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '6px 0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
              zIndex: 150,
              minWidth: '100px',
              maxWidth: 'calc(100vw - 24px)'
            }}>
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleSelectCurrency(curr.code)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: selectedCurrency === curr.code ? '#10b981' : '#cbd5e1',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textAlign: isAr ? 'right' : 'left'
                  }}
                >
                  <span>{curr.name}</span>
                  {selectedCurrency === curr.code && <FaCheck style={{ fontSize: '0.65rem' }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleLanguage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 8px',
            background: '#131f37',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            color: '#cbd5e1',
            fontSize: '0.72rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <FaGlobe style={{ color: '#38bdf8', fontSize: '0.75rem' }} />
          <span>{isAr ? 'EN' : 'عربي'}</span>
        </button>

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
              padding: '7px 9px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <FaBell style={{ fontSize: '0.85rem', color: '#fbbf24' }} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '4px', 
                right: '4px', 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                backgroundColor: '#10b981' 
              }}></span>
            )}
          </button>

          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              top: '40px',
              ...dropdownPositionStyle,
              backgroundColor: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
              zIndex: 150,
              width: '250px',
              maxWidth: 'calc(100vw - 24px)',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              textAlign: isAr ? 'right' : 'left'
            }}>
              <div style={{ 
                display: 'flex', 
                justify: 'space-between', 
                alignItems: 'center', 
                marginBottom: '10px', 
                borderBottom: '1px solid #1e293b', 
                paddingBottom: '6px' 
              }}>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>
                  {isAr ? 'التنبيهات' : 'Notifications'}
                </span>
                {notifications.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={markAllAsRead} 
                      title={isAr ? 'تحديد الكل كمقروء' : 'Mark all read'} 
                      style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <FaCheckDouble />
                    </button>
                    <button 
                      onClick={clearAll} 
                      title={isAr ? 'مسح القائمة' : 'Clear list'} 
                      style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                )}
              </div>

              {loadingNotifs ? (
                <div style={{ padding: '12px 0', color: '#94a3b8', textAlign: 'center' }}>
                  {isAr ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '12px 0', color: '#94a3b8', textAlign: 'center' }}>
                  {isAr ? 'لا توجد إشعارات جديدة.' : 'No new notifications.'}
                </div>
              ) : (
                notifications.map((item) => (
                  <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #1e293b55' }}>
                    <div 
                      dir="auto" 
                      style={{ 
                        color: item.is_read ? '#94a3b8' : '#ffffff', 
                        fontWeight: item.is_read ? 'normal' : '600', 
                        lineHeight: '1.3',
                        textAlign: 'start'
                      }}
                    >
                      {item.title}
                    </div>

                    {item.message && (
                      <div 
                        dir="auto" 
                        style={{ color: '#cbd5e1', fontSize: '0.7rem', marginTop: '3px', textAlign: 'start' }}
                      >
                        {item.message}
                      </div>
                    )}

                    <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: '4px' }}>
                      {formatTime(item.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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
              padding: '5px', 
              borderRadius: '6px', 
              border: '1px solid #1e293b',
              cursor: 'pointer'
            }}
            title={isAr ? "الملف الشخصي" : "Profile"}
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
              fontSize: '0.75rem'
            }}>
              <FaUserCheck />
            </div>
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '40px',
              ...dropdownPositionStyle,
              backgroundColor: '#131f37',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
              zIndex: 150,
              width: '170px',
              maxWidth: 'calc(100vw - 24px)',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              textAlign: isAr ? 'right' : 'left'
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.82rem' }}>
                {isAr ? 'صاحب الأكاديمية' : 'Academy Owner'}
              </div>

              <div style={{ 
                color: '#10b981', 
                fontSize: '0.68rem', 
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                <span>{isAr ? 'الجلسة نشطة' : 'Active Session'}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
