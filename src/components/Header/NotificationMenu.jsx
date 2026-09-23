// src/components/Header/NotificationMenu.jsx
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationMenu({
  notifications = [],
  loadingNotifs = false,
  unreadCount = 0,
  showMenu = false,
  onToggle = () => {},
  onNotificationClick = () => {},
  onMarkAllAsRead = () => {},
  onClearAll = () => {},
  formatTime = () => '',
  activeRtl = true
}) {
  const { t } = useTranslation();
  const [notifFilter, setNotifFilter] = useState('all');

  const filteredNotifications = useMemo(() => {
    if (notifFilter === 'unread') {
      return notifications.filter((n) => !n.is_read);
    }
    return notifications;
  }, [notifications, notifFilter]);

  return (
    <div className="relative inline-block">
      <button 
        type="button"
        onClick={onToggle}
        className="p-1.5 bg-[var(--surface-input)] hover:bg-[var(--border-hover)] border border-[var(--border-input)] rounded-xl text-[var(--text-sub)] hover:text-[var(--text-main)] transition-all relative flex items-center justify-center active:scale-95 shadow-sm cursor-pointer"
        title={t('notifications.title', activeRtl ? 'مركز التنبيهات' : 'Notification Center')}
      >
        <Bell size={16} className="text-[var(--primary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_var(--primary-glow)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {showMenu && (
        <div 
          className={`absolute top-full mt-2 w-72 sm:w-80 border border-[var(--border-input)] rounded-2xl shadow-2xl z-50 p-2.5 text-xs backdrop-blur-md bg-[var(--surface-card)] ${
            activeRtl ? 'left-0 text-right' : 'right-0 text-left'
          }`}
          style={{ maxWidth: 'calc(100vw - 24px)' }}
          dir={activeRtl ? 'rtl' : 'ltr'}
        >
          {/* الرأس: العنوان والأزرار */}
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-[var(--border-card)]">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[var(--text-main)] text-[12px] sm:text-[13px]">
                {t('notifications.title', activeRtl ? 'التنبيهات القرآنيّة' : 'Quranic Notifications')}
              </span>
              {unreadCount > 0 && (
                <span className="bg-[var(--emerald-bg)] text-[var(--emerald-text)] border border-[var(--emerald-border)] text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {unreadCount} {t('notifications.new', activeRtl ? 'جديد' : 'New')}
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-1">
                <button 
                  type="button"
                  onClick={onMarkAllAsRead} 
                  title={t('notifications.markAllRead', activeRtl ? 'تحديد الكل كمقروء' : 'Mark all as read')}
                  className="text-[var(--emerald-text)] hover:opacity-80 transition-opacity p-1 rounded-lg bg-[var(--emerald-bg)] border border-[var(--emerald-border)] cursor-pointer"
                >
                  <CheckCheck size={12} />
                </button>
                <button 
                  type="button"
                  onClick={onClearAll} 
                  title={t('notifications.clearAll', activeRtl ? 'حذف الكل' : 'Clear all')}
                  className="text-[var(--error)] hover:opacity-80 transition-opacity p-1 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* تصفية التنبيهات */}
          <div className="flex items-center gap-1 mb-2 bg-[var(--surface-input)] p-0.5 rounded-xl border border-[var(--border-input)]">
            <button
              type="button"
              onClick={() => setNotifFilter('all')}
              className={`flex-1 py-1 text-[10px] sm:text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                notifFilter === 'all' 
                  ? 'bg-[var(--surface-card)] text-[var(--text-main)] shadow-sm' 
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              {t('notifications.all', activeRtl ? 'الكل' : 'All')} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setNotifFilter('unread')}
              className={`flex-1 py-1 text-[10px] sm:text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                notifFilter === 'unread' 
                  ? 'bg-[var(--surface-card)] text-[var(--primary)] shadow-sm' 
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              {t('notifications.unread', activeRtl ? 'غير مقروء' : 'Unread')} ({unreadCount})
            </button>
          </div>

          {/* القائمة أو الحالة الفارغة */}
          {loadingNotifs ? (
            <div className="py-5 text-[var(--text-sub)] text-center font-medium text-[11px]">
              {t('common.loading', activeRtl ? 'جاري التحميل...' : 'Loading...')}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-5 text-[var(--text-sub)] text-center font-medium text-[11px]">
              {t('notifications.empty', activeRtl ? 'لا توجد تنبيهات جديدة' : 'No new notifications')}
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {filteredNotifications.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onNotificationClick(item)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    !item.is_read 
                      ? 'bg-[var(--surface-input)] border-[var(--primary)]/40 text-[var(--text-main)] shadow-sm' 
                      : 'bg-[var(--surface-input)]/50 border-[var(--border-input)] text-[var(--text-sub)] hover:bg-[var(--surface-input)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className={`text-[10.5px] leading-snug ${!item.is_read ? 'font-bold text-[var(--text-main)]' : 'font-medium'}`}>
                      {item.title}
                    </span>
                    {item.message && (
                      <span className="text-[9.5px] text-[var(--text-sub)] line-clamp-2 leading-relaxed">
                        {item.message}
                      </span>
                    )}
                    <span className="text-[8.5px] text-[var(--text-sub)] opacity-75 font-mono mt-0.5">
                      {formatTime(item.created_at)}
                    </span>
                  </div>
                  
                  {!item.is_read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-1 shadow-[0_0_6px_var(--primary-glow)]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
