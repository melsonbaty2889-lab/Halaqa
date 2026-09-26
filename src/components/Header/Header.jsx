// src/components/Header/Header.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Coins, Maximize, Minimize, CheckCircle2, AlertCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { getMenuSections } from '@/constants/sidebarMenu';

import NotificationMenu from './NotificationMenu';
import ProfileMenu from './ProfileMenu';
import EditProfileModal from './EditProfileModal';

export default function Header({ 
  activeTab, 
  setActiveTab,
  sidebarOpen, 
  setSidebarOpen, 
  isRtl,
  userRole = 'admin',
  onLogout
}) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'ar';
  const isAr = currentLanguage.startsWith('ar');
  const activeRtl = isRtl !== undefined ? isRtl : isAr;

  const { academy, currentAcademy } = useAcademy();
  const activeAcademy = academy || currentAcademy;

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // حالة التنبيه المخصص (Toast)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // state لحفظ بيانات المستخدم
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserPhone, setCurrentUserPhone] = useState('');

  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return (
      activeAcademy?.currency || 
      localStorage.getItem('app_currency') || 
      'EGP'
    );
  });

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const showToastMessage = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  }, []);

  const handleLogout = async () => {
    try {
      if (typeof onLogout === 'function') {
        await onLogout();
      }
      
      if (supabase?.auth) {
        await supabase.auth.signOut();
      }

      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      
      window.location.href = '/login';
    } catch (err) {
      console.error('Error logging out:', err);
      window.location.reload();
    }
  };

  // جلب معلومات الشخص المسجل حالياً من Supabase Auth
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!supabase?.auth) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fullName = user.user_metadata?.full_name || 
                           user.user_metadata?.name || 
                           user.email?.split('@')[0];
          if (fullName) {
            setCurrentUserName(fullName);
          }
          if (user.email) {
            setCurrentUserEmail(user.email);
          }
          const userPhone = user.user_metadata?.phone || '';
          setCurrentUserPhone(userPhone);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  // دالة تحديث بيانات البروفايل وكلمة المرور في Supabase مع التحقق السليم
  const handleSaveProfile = async ({ name, email, currentPassword, newPassword, phone }) => {
    if (!supabase?.auth) throw new Error(t('profile.errors.noAuth', 'غير مصرح'));

    const isEmailChanged = email && email.trim().toLowerCase() !== currentUserEmail.trim().toLowerCase();
    const isPasswordChanged = newPassword && newPassword.trim() !== '';

    if (isEmailChanged || isPasswordChanged) {
      if (!currentPassword) {
        throw new Error(t('profile.errors.currentPasswordRequired', 'كلمة المرور الحالية مطلوبة لتأكيد التغييرات'));
      }

      // التعديل هنا: جلب البريد الفعلي من الجلسة لتجنب فقدان الـ State، واستخدام trim() لكلمة المرور
      const { data: { user } } = await supabase.auth.getUser();
      const actualEmail = user?.email || currentUserEmail;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: actualEmail,
        password: currentPassword.trim() 
      });

      if (signInError) {
        throw new Error(t('profile.errors.invalidCurrentPassword', 'كلمة المرور الحالية غير صحيحة'));
      }
    }

    const updatePayload = {
      data: {}
    };

    if (name) {
      updatePayload.data.full_name = name;
      updatePayload.data.name = name;
    }

    if (phone !== undefined) {
      updatePayload.data.phone = phone;
    }

    if (isPasswordChanged) {
      updatePayload.password = newPassword.trim();
    }

    if (isEmailChanged) {
      updatePayload.email = email.trim();
    }

    const { error } = await supabase.auth.updateUser(updatePayload);

    if (error) {
      let errorMsg = error.message;

      if (
        error.message.includes('already registered') || 
        error.message.includes('already exists') ||
        error.message.includes('User already registered')
      ) {
        errorMsg = t('profile.errors.emailAlreadyExists', 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر');
      } else if (error.message.includes('Current password required')) {
        errorMsg = t('profile.errors.invalidCurrentPassword', 'كلمة المرور الحالية غير صحيحة');
      } else if (error.message.includes('Password should be')) {
        errorMsg = t('profile.errors.passwordLength', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      }

      throw new Error(errorMsg);
    }

    if (name) setCurrentUserName(name);
    if (email) setCurrentUserEmail(email);
    if (phone !== undefined) setCurrentUserPhone(phone);

    showToastMessage(t('profile.successUpdate', 'تم تحديث البيانات بنجاح'), 'success');
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    if (activeAcademy?.currency) {
      setSelectedCurrency(activeAcademy.currency);
      localStorage.setItem('app_currency', activeAcademy.currency);
    }
  }, [activeAcademy?.currency]);

  const fetchNotifications = useCallback(async () => {
    if (!supabase) return;
    setLoadingNotifs(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

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
    let channel = null;

    try {
      if (typeof supabase?.channel === 'function') {
        channel = supabase.channel('header_realtime_notifications');
        if (channel && typeof channel.on === 'function') {
          channel
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'notifications' },
              (payload) => {
                if (payload?.new) {
                  setNotifications((prev) => [payload.new, ...prev]);
                }
              }
            )
            .subscribe();
        }
      }
    } catch (err) {
      console.error('Error setting up notifications realtime channel:', err);
    }

    return () => {
      if (channel && supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifMenu(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let pathname = '';
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (e) {
    pathname = '';
  }

  const rawKey = activeTab || pathname.replace(/^\//, '') || 'dashboard';
  const activeKey = rawKey.split('/')[0].trim();

  const menuSections = useMemo(() => getMenuSections(activeRtl, userRole), [activeRtl, userRole]);

  const pageTitle = useMemo(() => {
    for (const section of menuSections) {
      const foundItem = section.items.find(item => item.id === activeKey);
      if (foundItem) {
        return foundItem.label;
      }
    }
    return t(`nav.${activeKey}`, t('nav.dashboard', 'الحلقة الذكية'));
  }, [menuSections, activeKey, t]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
    }
    
    if (notif.tab_target && setActiveTab) {
      setActiveTab(notif.tab_target);
    }
    setShowNotifMenu(false);
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    try {
      await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const formatTime = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(currentLanguage, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [currentLanguage]);

  return (
    <header 
      className="sticky top-0 z-50 min-h-[56px] px-3.5 py-2.5 bg-[var(--surface-card)] border-b border-[var(--border-card)] flex items-center justify-between gap-3 shadow-xl w-full transition-all" 
      dir={activeRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-[var(--surface-input)] hover:bg-[var(--border-hover)] border border-[var(--border-input)] text-[var(--emerald-text)] transition-all shrink-0 active:scale-95 shadow-sm cursor-pointer"
          title={t('header.toggleSidebar', 'القائمة الجانبية')}
        >
          <Menu size={18} />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="m-0 text-sm sm:text-base font-extrabold text-[var(--text-main)] truncate leading-tight select-none">
            {pageTitle}
          </h1>
          <span className="text-[10px] text-[var(--text-sub)] font-medium flex items-center gap-1.5 hidden sm:flex">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[var(--emerald-text)] shadow-[0_0_6px_var(--emerald-text)]' : 'bg-[var(--error)]'}`} />
            {isOnline ? t('header.onlineSync', 'متصل بالمزامنة') : t('header.offline', 'غير متصل')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 bg-[var(--surface-input)] hover:bg-[var(--border-hover)] border border-[var(--border-input)] rounded-xl text-[var(--text-sub)] hover:text-[var(--text-main)] transition-all shrink-0 hidden md:flex items-center justify-center active:scale-95 cursor-pointer"
          title={t('header.fullscreen', 'وضع الشاشة الكاملة')}
        >
          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
        </button>

        <div 
          title={t('header.currency', 'العملة المعتمدة')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--surface-input)] border border-[var(--border-input)] rounded-xl text-[11px] font-bold select-none text-[var(--text-main)]"
        >
          <Coins size={14} className="text-[var(--primary)] shrink-0" />
          <span>{selectedCurrency}</span>
        </div>

        <LanguageSwitcher i18n={i18n} />

        <div ref={notifRef}>
          <NotificationMenu
            notifications={notifications}
            loadingNotifs={loadingNotifs}
            unreadCount={unreadCount}
            showMenu={showNotifMenu}
            onToggle={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            onNotificationClick={handleNotificationClick}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
            formatTime={formatTime}
            activeRtl={activeRtl}
          />
        </div>

        <div ref={profileRef}>
          <ProfileMenu
            showMenu={showProfileMenu}
            onToggle={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            userName={currentUserName || activeAcademy?.owner_name || activeAcademy?.name}
            userEmail={currentUserEmail}
            userRole={userRole}
            onLogout={handleLogout}
            onEditProfile={() => setShowEditProfileModal(true)}
            activeRtl={activeRtl}
          />
        </div>

      </div>

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        currentUser={{
          name: currentUserName || activeAcademy?.owner_name || activeAcademy?.name || '',
          email: currentUserEmail || '',
          phone: currentUserPhone || ''
        }}
        onSave={handleSaveProfile}
        activeRtl={activeRtl}
      />

      {toast.show && typeof window !== 'undefined' && createPortal(
        <div 
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-3 px-5 py-3 max-w-[92vw] sm:max-w-md rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border backdrop-blur-xl transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-[var(--surface-card)] border-[var(--error)] text-[var(--text-main)]'
              : 'bg-[var(--surface-card)] border-[var(--emerald-text)] text-[var(--text-main)]'
          }`}
          style={{ direction: activeRtl ? 'rtl' : 'ltr' }}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-[var(--error)] shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[var(--emerald-text)] shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold text-right leading-snug break-words flex-1">{toast.message}</span>
        </div>,
        document.body
      )}
    </header>
  );
}
