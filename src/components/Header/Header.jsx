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
  Trash2
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';

export default function Header({ 
  activeTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isRtl
}) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'ar';
  const isAr = currentLanguage.startsWith('ar');

  // جلب بيانات الأكاديمية الحالية من Context
  const { academy, currentAcademy } = useAcademy();
  const activeAcademy = academy || currentAcademy;

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // تحديد العملة المعروضة وفق الأولويات: Context -> localStorage -> EGP
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

  // المزامنة الفورية عند تحميل بيانات الأكاديمية أو عند الـ Refresh
  useEffect(() => {
    if (activeAcademy?.currency) {
      setSelectedCurrency(activeAcademy.currency);
      localStorage.setItem('app_currency', activeAcademy.currency);
    }
  }, [activeAcademy?.currency]);

  // الاستماع المباشر لحدث حفظ العملة من صفحة الإعدادات (Settings)
  useEffect(() => {
    const handleCurrencyUpdate = (event) => {
      if (event.detail) {
        setSelectedCurrency(event.detail);
        localStorage.setItem('app_currency', event.detail);
      }
    };

    window.addEventListener('currencyUpdated', handleCurrencyUpdate);
    return () => {
      window.removeEventListener('currencyUpdated', handleCurrencyUpdate);
    };
  }, []);

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

  // إغلاق القوائم المنسدلة عند الضغط خارج المكون
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

  return (
    <header 
      className="sticky top-0 z-50 min-h-[60px] px-3 py-2 bg-[#0b132b]/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between gap-2 shadow-lg text-slate-100" 
      dir={activeRtl ? 'rtl' : 'ltr'}
    >
      {/* القسم الأيسر/الأيمن - العنوان وزر القائمة */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-emerald-400 transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95"
          title={isAr ? "القائمة" : "Menu"}
        >
          <Menu size={18} />
        </button>

        <h1 className="m-0 text-sm font-bold text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis leading-tight select-none">
          {pageTitle}
        </h1>
      </div>

      {/* القسم الأيمن/الأيسر - الأدوات والقوائم */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        
        {/* 🟢 شارة عرض العملة المعتمدة للأكاديمية */}
        <div 
          title={isAr ? "العملة المعتمدة للمنظومة" : "Official System Currency"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs font-medium select-none"
        >
          <Coins size={14} className="text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-200">{selectedCurrency}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] shrink-0" />
        </div>

        {/* تغيير اللغة */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Globe size={14} className="text-emerald-400" />
          <span>{isAr ? 'EN' : 'عربي'}</span>
        </button>

        {/* التنبيهات */}
        <div className="relative" ref={notifRef}>
          <button 
            type="button"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white transition-all duration-200 cursor-pointer relative flex items-center justify-center active:scale-95"
            title={t('notifications.title', isAr ? 'التنبيهات' : 'Notifications')}
          >
            <Bell size={16} className="text-emerald-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            )}
          </button>

          {showNotifMenu && (
            <div className={`absolute top-full mt-2 w-72 bg-[#0f172a] border border-slate-800/90 rounded-2xl shadow-2xl z-50 p-3 text-xs text-slate-300 ${activeRtl ? 'left-0' : 'right-0'}`}>
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-100">
                  {t('notifications.title', isAr ? 'التنبيهات' : 'Notifications')}
                </span>
                {notifications.length > 0 && (
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={markAllAsRead} 
                      title={isAr ? 'تحديد الكل كمقروء' : 'Mark all read'} 
                      className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      <CheckCheck size={15} />
                    </button>
                    <button 
                      type="button"
                      onClick={clearAll} 
                      title={isAr ? 'مسح القائمة' : 'Clear list'} 
                      className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {loadingNotifs ? (
                <div className="py-4 text-slate-500 text-center">
                  {t('common.loading', isAr ? 'جاري التحميل...' : 'Loading...')}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-4 text-slate-500 text-center">
                  {isAr ? 'لا توجد إشعارات جديدة.' : 'No new notifications.'}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin">
                  {notifications.map((item) => (
                    <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div 
                        dir="auto" 
                        className={`text-start ${item.is_read ? 'text-slate-400 font-normal' : 'text-slate-100 font-semibold'}`}
                      >
                        {item.title}
                      </div>

                      {item.message && (
                        <div dir="auto" className="text-slate-400 text-[11px] mt-0.5 text-start">
                          {item.message}
                        </div>
                      )}

                      <div className="text-slate-500 text-[10px] mt-1">
                        {formatTime(item.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* الملف الشخصي */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            className="p-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95"
            title={t('nav.profile', isAr ? "الملف الشخصي" : "Profile")}
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <UserCheck size={14} />
            </div>
          </button>

          {showProfileMenu && (
            <div className={`absolute top-full mt-2 w-48 bg-[#0f172a] border border-slate-800/90 rounded-2xl shadow-2xl z-50 p-3 text-xs text-slate-300 ${activeRtl ? 'left-0' : 'right-0'}`}>
              <div className="font-bold text-slate-100 text-xs">
                {t('header.admin', isAr ? 'صاحب الأكاديمية' : 'Academy Owner')}
              </div>

              <div className="text-emerald-400 text-[11px] mt-2 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] inline-block" />
                <span>{isAr ? 'الجلسة نشطة' : 'Active Session'}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
