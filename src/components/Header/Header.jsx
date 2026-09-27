// src/components/Header/Header.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Coins, Maximize, Minimize, CheckCircle2, AlertCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { getMenuSections } from '@/constants/sidebarMenu';
import { useNotifications } from '@/hooks/useNotifications';

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
  const navigate = useNavigate();
  const currentLanguage = i18n.language || 'ar';
  const isAr = currentLanguage.startsWith('ar');
  const activeRtl = isRtl !== undefined ? isRtl : isAr;

  const { academy, currentAcademy } = useAcademy();
  const activeAcademy = academy || currentAcademy;
  const academyId = activeAcademy?.id || null;

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // حالة التنبيه المخصص (Toast)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // بيانات المستخدم المسجل
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserPhone, setCurrentUserPhone] = useState('');
  const [currentUserGender, setCurrentUserGender] = useState('');

  // استدعاء هوك الإشعارات الموحد
  const { 
    notifications: rawNotifications, 
    unreadCount, 
    loading: loadingNotifs, 
    markAsRead, 
    markAllAsRead, 
    formatText 
  } = useNotifications(currentUserId, academyId);

  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return (
      activeAcademy?.currency || 
      localStorage.getItem('app_currency') || 
      'EGP'
    );
  });

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

  // جلب معلومات المستخدم المسجل حالياً من Supabase Auth
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!supabase?.auth) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone, gender')
            .eq('id', user.id)
            .maybeSingle();

          let extractedName = '';
          if (profile?.full_name) {
            if (typeof profile.full_name === 'object') {
              extractedName = profile.full_name[currentLanguage] || profile.full_name.ar || profile.full_name.en || '';
            } else if (typeof profile.full_name === 'string') {
              try {
                const parsed = JSON.parse(profile.full_name);
                extractedName = parsed[currentLanguage] || parsed.ar || parsed.en || profile.full_name;
              } catch (e) {
                extractedName = profile.full_name;
              }
            }
          }

          if (!extractedName) {
            extractedName = user.user_metadata?.full_name || 
                            user.user_metadata?.name || 
                            user.email?.split('@')[0];
          }

          if (extractedName) {
            setCurrentUserName(extractedName);
          }
          if (user.email) {
            setCurrentUserEmail(user.email);
          }
          const userPhone = profile?.phone || user.user_metadata?.phone || '';
          setCurrentUserPhone(userPhone);

          const userGender = profile?.gender || user.user_metadata?.gender || '';
          setCurrentUserGender(userGender);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    fetchCurrentUser();
  }, [currentLanguage]);

  // تحديث البروفايل
  const handleSaveProfile = async ({ name, email, currentPassword, newPassword, phone, gender }) => {
    if (!supabase?.auth) throw new Error(t('profile.errors.noAuth', 'غير مصرح'));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error(t('profile.errors.userNotFound', 'المستخدم غير موجود'));

    const actualEmail = user.email || currentUserEmail;
    const isEmailChanged = email && email.trim().toLowerCase() !== actualEmail.trim().toLowerCase();
    const isPasswordChanged = Boolean(newPassword && newPassword.trim() !== '');

    if (isEmailChanged || isPasswordChanged) {
      if (!currentPassword || !currentPassword.trim()) {
        throw new Error(t('profile.errors.currentPasswordRequired', 'كلمة المرور الحالية مطلوبة لتأكيد التغيير'));
      }
    }

    if (isPasswordChanged) {
      const { error: pwdError } = await supabase.auth.updateUser({
        password: newPassword.trim(),
        current_password: currentPassword.trim()
      });

      if (pwdError) {
        let errorMsg = pwdError.message;
        if (pwdError.message.includes('Password should be')) {
          errorMsg = t('profile.errors.passwordLength', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        } else if (
          pwdError.message.includes('Current password') ||
          pwdError.message.includes('invalid') ||
          pwdError.message.includes('incorrect')
        ) {
          errorMsg = t('profile.errors.invalidCurrentPassword', 'كلمة المرور الحالية غير صحيحة');
        }
        throw new Error(errorMsg);
      }
    }

    if (isEmailChanged) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email.trim()
      });

      if (emailError) {
        let errorMsg = emailError.message;
        if (emailError.message.includes('already registered') || emailError.message.includes('already exists')) {
          errorMsg = t('profile.errors.emailAlreadyExists', 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر');
        }
        throw new Error(errorMsg);
      }
    }

    if (name || phone !== undefined || gender !== undefined) {
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          ...(name && { full_name: name, name: name }),
          ...(phone !== undefined && { phone: phone }),
          ...(gender !== undefined && { gender: gender })
        }
      });
      if (metaError) {
        console.error('Meta update error:', metaError);
      }
    }

    const profileUpdateData = {
      updated_at: new Date().toISOString()
    };
    
    if (name) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      let currentFullNameObj = {};
      if (existingProfile?.full_name) {
        if (typeof existingProfile.full_name === 'object') {
          currentFullNameObj = { ...existingProfile.full_name };
        } else if (typeof existingProfile.full_name === 'string') {
          try {
            currentFullNameObj = JSON.parse(existingProfile.full_name);
          } catch (e) {
            currentFullNameObj = { ar: existingProfile.full_name };
          }
        }
      }

      const langKey = currentLanguage.startsWith('ar') ? 'ar' : currentLanguage;
      currentFullNameObj[langKey] = name.trim();
      profileUpdateData.full_name = currentFullNameObj;
    }

    if (phone !== undefined) profileUpdateData.phone = phone;
    if (gender !== undefined) profileUpdateData.gender = gender;
    if (isEmailChanged) profileUpdateData.email = email.trim();

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profiles table:', profileError);
      throw new Error(t('profile.errors.generalSaveError', 'حدث خطأ أثناء حفظ التغييرات في قاعدة البيانات'));
    }

    if (name) setCurrentUserName(name);
    if (isEmailChanged) setCurrentUserEmail(email);
    if (phone !== undefined) setCurrentUserPhone(phone);
    if (gender !== undefined) setCurrentUserGender(gender);

    const successMsg = isEmailChanged
      ? t('profile.successEmailPending', 'تم تحديث البيانات، وتم إرسال رابط تأكيد للبريد الجديد')
      : t('profile.successUpdate', 'تم تحديث البيانات بنجاح');

    showToastMessage(successMsg, 'success');
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
    return t(`nav.${activeKey}`, activeKey);
  }, [menuSections, activeKey, t]);

  const formattedNotifications = useMemo(() => {
    return rawNotifications.map((item) => ({
      ...item,
      title: formatText(item.title),
      message: formatText(item.message),
      category: item.notification_type || 'info'
    }));
  }, [rawNotifications, formatText]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    
    if (notif.action_url) {
      navigate(notif.action_url);
    }
    setShowNotifMenu(false);
  };

  const handleClearAll = async () => {
    await markAllAsRead();
    setShowNotifMenu(false);
  };

  const formatTime = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(currentLanguage, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [currentLanguage]);

  const handleToggleSidebar = () => {
    setShowNotifMenu(false);
    setShowProfileMenu(false);
    if (setSidebarOpen) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 min-h-[56px] px-3.5 py-2.5 bg-[var(--surface-card)] border-b border-[var(--border-card)] flex items-center justify-between gap-3 shadow-xl w-full transition-all" 
      dir={activeRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={handleToggleSidebar}
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
            notifications={formattedNotifications}
            loadingNotifs={loadingNotifs}
            unreadCount={unreadCount}
            showMenu={showNotifMenu}
            onToggle={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            onNotificationClick={handleNotificationClick}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={handleClearAll}
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
          phone: currentUserPhone || '',
          gender: currentUserGender || ''
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
