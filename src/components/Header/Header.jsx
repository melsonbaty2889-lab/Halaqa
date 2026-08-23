// src/components/Header.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  Bell, 
  Globe, 
  UserCheck, 
  Coins, 
  CheckCheck, 
  Trash2,
  ExternalLink
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';

export default function Header({ 
  activeTab, 
  setActiveTab,
  sidebarOpen, 
  setSidebarOpen, 
  isRtl
}) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'ar';
  const isAr = currentLanguage.startsWith('ar');

  const { academy, currentAcademy } = useAcademy();
  const activeAcademy = academy || currentAcademy;

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  useEffect(() => {
    if (activeAcademy?.currency) {
      setSelectedCurrency(activeAcademy.currency);
      localStorage.setItem('app_currency', activeAcademy.currency);
    }
  }, [activeAcademy?.currency]);

  // جلب الإشعارات من Supabase
  const fetchNotifications = useCallback(async () => {
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

  // الاستماع للإشعارات اللحظية (Realtime)
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('header_realtime_notifications')
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
  const pageTitle = t(`nav.${activeKey}`, t(`nav.dashboard`, 'Smart Halaqa'));

  const toggleLanguage = () => {
    const nextLng = isAr ? 'en' : 'ar';
    i18n.changeLanguage(nextLng);
    localStorage.setItem('i18nextLng', nextLng);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // تعليم إشعار فردي كمقروء والانتقال للتبويب
  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
    }
    
    // إذا كان الإشعار يحتوي على tab ينقل المستخدم إليها مباشرة
    if (notif.tab_target && setActiveTab) {
      setActiveTab(notif.tab_target);
    }
    setShowNotifMenu(false);
  };

  // تعليم الكل كمقروء
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

  // حذف جميع الإشعارات
  const clearAll = async () => {
    setNotifications([]);
    try {
      await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
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

  return (
    <header 
      className="sticky top-0 z-50 min-h-[56px] px-3 py-2 bg-[var(--surface-card)] backdrop-blur-md border-b border-[var(--border-card)] flex items-center justify-between gap-2 shadow-lg text-slate-100 w-full" 
      dir={activeRtl ? 'rtl' : 'ltr'}
    >
      {/* القسم الأيمن - زر القائمة والعنوان */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-400 transition-all shrink-0 active:scale-95"
          title={isAr ? "القائمة" : "Menu"}
        >
          <Menu size={18} />
        </button>

        <h1 className="m-0 text-xs sm:text-sm font-extrabold text-slate-100 truncate leading-none select-none">
          {pageTitle}
        </h1>
      </div>

      {/* الأدوات والأيقونات */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* العملة */}
        <div 
          title={isAr ? "العملة المعتمدة" : "Currency"}
          className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-xl text-[11px] font-medium select-none"
        >
          <Coins size={13} className="text-amber-400 shrink-0" />
          <span className="font-bold text-slate-200">{selectedCurrency}</span>
        </div>

        {/* زر التبديل بين اللغات */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white text-[11px] font-bold transition-all active:scale-95"
        >
          <Globe size={13} className="text-emerald-400 shrink-0" />
          <span>{isAr ? 'EN' : 'عربي'}</span>
        </button>

        {/* التنبيهات الحقيقية */}
        <div className="relative" ref={notifRef}>
          <button 
            type="button"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all relative flex items-center justify-center active:scale-95"
            title={t('notifications.title', isAr ? 'التنبيهات' : 'Notifications')}
          >
            <Bell size={15} className="text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_#D97706] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className={`absolute top-full mt-2 w-72 sm:w-80 bg-[var(--surface-card)] backdrop-blur-xl border border-[var(--border-card)] rounded-2xl shadow-2xl z-50 p-3 text-xs text-slate-300 ${activeRtl ? 'left-0' : 'right-0'}`}>
              
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-100">
                    {t('notifications.title', isAr ? 'التنبيهات' : 'Notifications')}
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {unreadCount} {isAr ? 'جديد' : 'new'}
                    </span>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={markAllAsRead} 
                      title={isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
                    >
                      <CheckCheck size={15} />
                    </button>
                    <button 
                      type="button"
                      onClick={clearAll} 
                      title={isAr ? "حذف الكل" : "Clear all"}
                      className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {loadingNotifs ? (
                <div className="py-6 text-slate-400 text-center">
                  {t('common.loading', isAr ? 'جاري التحميل...' : 'Loading...')}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-6 text-slate-400 text-center font-medium">
                  {isAr ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-1.5 custom-scrollbar">
                  {notifications.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleNotificationClick(item)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        !item.is_read 
                          ? 'bg-amber-500/10 border-amber-500/20 text-slate-100' 
                          : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className={`text-[12px] ${!item.is_read ? 'font-extrabold text-amber-300' : 'font-medium'}`}>
                          {item.title}
                        </span>
                        {item.message && (
                          <span className="text-slate-400 text-[11px] line-clamp-2">
                            {item.message}
                          </span>
                        )}
                        <span className="text-slate-500 text-[9px] mt-1 font-mono">
                          {formatTime(item.created_at)}
                        </span>
                      </div>
                      
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1 shadow-[0_0_6px_#D97706]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* البروفايل */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            className="p-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center active:scale-95"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <UserCheck size={14} />
            </div>
          </button>

          {showProfileMenu && (
            <div className={`absolute top-full mt-2 w-48 bg-[var(--surface-card)] backdrop-blur-xl border border-[var(--border-card)] rounded-2xl shadow-2xl z-50 p-3 text-xs text-slate-300 ${activeRtl ? 'left-0' : 'right-0'}`}>
              <div className="font-bold text-slate-100 text-[12px]">
                {t('header.admin', isAr ? 'صاحب الأكاديمية' : 'Academy Owner')}
              </div>
              <div className="text-emerald-400 text-[10px] mt-2 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_#10B981]" />
                <span>{isAr ? 'الجلسة نشطة' : 'Active Session'}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
