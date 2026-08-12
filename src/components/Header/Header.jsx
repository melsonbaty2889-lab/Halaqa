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

import { supabase } from '@/lib/supabase';
import { colors as C } from '@/constants/colors'; // استيراد الألوان الموحدة

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
  const isAr = currentLanguage.startsWith('ar');

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

  const rawKey = activeTab || pathname.replace(/^\//, '') || 'dashboard';
  const activeKey = rawKey.split('/')[0].trim();
  const pageTitle = t(`nav.${activeKey}`, t(`nav.dashboard`, 'Smart Halaqa'));

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

  const activeRtl = isRtl !== undefined ? isRtl : isAr;
  const dropdownPositionStyle = activeRtl
    ? { left: 0, right: 'auto' }
    : { right: 0, left: 'auto' };

  return (
    <header style={{
      minHeight: '60px',
      backgroundColor: C.dark.surface, // مطابقة لخلفية شاشة الدخول والقوائم
      borderBottom: `1px solid ${C.dark.border}`,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      color: C.text.title,
      direction: activeRtl ? 'rtl' : 'ltr',
      gap: '8px',
      flexWrap: 'nowrap'
    }}>
      {/* القسم الأيسر */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
        <button
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          style={{
            background: C.dark.buttonDark,
            border: `1px solid ${C.dark.border}`,
            color: C.primary.DEFAULT,
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
          fontSize: '0.88rem',
          fontWeight: '700',
          color: C.text.title,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.2'
        }}>
          {pageTitle}
        </h1>
      </div>

      {/* القسم الأيمن */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* العملات */}
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
              background: C.dark.buttonDark,
              border: `1px solid ${C.dark.border}`,
              borderRadius: '6px',
              color: C.primary.DEFAULT,
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
              backgroundColor: C.dark.card,
              border: `1px solid ${C.dark.border}`,
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
                    color: selectedCurrency === curr.code ? C.brandEmerald.DEFAULT : C.text.body,
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

        {/* اللغة */}
        <button
          onClick={toggleLanguage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 8px',
            background: C.dark.buttonDark,
            border: `1px solid ${C.dark.border}`,
            borderRadius: '6px',
            color: C.text.body,
            fontSize: '0.72rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <FaGlobe style={{ color: C.brandEmerald.light, fontSize: '0.75rem' }} />
          <span>{isAr ? 'EN' : 'عربي'}</span>
        </button>

        {/* الإشعارات */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowCurrencyMenu(false);
              setShowProfileMenu(false);
            }}
            style={{ 
              background: C.dark.buttonDark, 
              border: `1px solid ${C.dark.border}`, 
              color: C.text.body, 
              padding: '7px 9px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <FaBell style={{ fontSize: '0.85rem', color: C.primary.DEFAULT }} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '4px', 
                right: '4px', 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                backgroundColor: C.brandEmerald.DEFAULT 
              }}></span>
            )}
          </button>

          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              top: '40px',
              ...dropdownPositionStyle,
              backgroundColor: C.dark.card,
              border: `1px solid ${C.dark.border}`,
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
              zIndex: 150,
              width: '250px',
              maxWidth: 'calc(100vw - 24px)',
              color: C.text.body,
              fontSize: '0.75rem',
              textAlign: isAr ? 'right' : 'left'
            }}>
              <div style={{ 
                display: 'flex', 
                justify: 'space-between', 
                alignItems: 'center', 
                marginBottom: '10px', 
                borderBottom: `1px solid ${C.dark.border}`, 
                paddingBottom: '6px' 
              }}>
                <span style={{ fontWeight: 'bold', color: C.text.title }}>
                  {t('notifications.title', isAr ? 'التنبيهات' : 'Notifications')}
                </span>
                {notifications.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={markAllAsRead} 
                      title={isAr ? 'تحديد الكل كمقروء' : 'Mark all read'} 
                      style={{ background: 'none', border: 'none', color: C.brandEmerald.light, cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <FaCheckDouble />
                    </button>
                    <button 
                      onClick={clearAll} 
                      title={isAr ? 'مسح القائمة' : 'Clear list'} 
                      style={{ background: 'none', border: 'none', color: C.error.DEFAULT, cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                )}
              </div>

              {loadingNotifs ? (
                <div style={{ padding: '12px 0', color: C.text.muted, textAlign: 'center' }}>
                  {t('common.loading', isAr ? 'جاري التحميل...' : 'Loading...')}
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '12px 0', color: C.text.muted, textAlign: 'center' }}>
                  {isAr ? 'لا توجد إشعارات جديدة.' : 'No new notifications.'}
                </div>
              ) : (
                notifications.map((item) => (
                  <div key={item.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.dark.border}` }}>
                    <div 
                      dir="auto" 
                      style={{ 
                        color: item.is_read ? C.text.muted : C.text.title, 
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
                        style={{ color: C.text.body, fontSize: '0.7rem', marginTop: '3px', textAlign: 'start' }}
                      >
                        {item.message}
                      </div>
                    )}

                    <div style={{ color: C.text.placeholder, fontSize: '0.68rem', marginTop: '4px' }}>
                      {formatTime(item.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* الملف الشخصي */}
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
              background: C.dark.buttonDark, 
              padding: '5px', 
              borderRadius: '6px', 
              border: `1px solid ${C.dark.border}`,
              cursor: 'pointer'
            }}
            title={t('nav.profile', isAr ? "الملف الشخصي" : "Profile")}
          >
            <div style={{ 
              width: '22px', 
              height: '22px', 
              borderRadius: '50%', 
              background: C.brandEmerald.bgGlow, 
              color: C.brandEmerald.light, 
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
              backgroundColor: C.dark.card,
              border: `1px solid ${C.dark.border}`,
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
              zIndex: 150,
              width: '170px',
              maxWidth: 'calc(100vw - 24px)',
              color: C.text.body,
              fontSize: '0.75rem',
              textAlign: isAr ? 'right' : 'left'
            }}>
              <div style={{ fontWeight: 'bold', color: C.text.title, fontSize: '0.82rem' }}>
                {t('header.admin', isAr ? 'صاحب الأكاديمية' : 'Academy Owner')}
              </div>

              <div style={{ 
                color: C.brandEmerald.DEFAULT, 
                fontSize: '0.68rem', 
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.brandEmerald.DEFAULT, display: 'inline-block' }}></span>
                <span>{isAr ? 'الجلسة نشطة' : 'Active Session'}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
