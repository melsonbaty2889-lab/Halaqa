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
    <div className="relative">
      {/* زر فتح قائمة التنبيهات */}
      <button 
        type="button"
        onClick={onToggle}
        className="p-2 bg-[var(--surface-input)] hover:bg-[var(--border-hover)] border border-[var(--border-input)] rounded-xl text-[var(--text-sub)] hover:text-[var(--text-main)] transition-all relative flex items-center justify-center active:scale-95 shadow-sm"
        title={t('notifications.title', 'التنبيهات')}
      >
        <Bell size={16} className="text-[var(--primary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_var(--primary-glow)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة للتنبيهات */}
      {showMenu && (
        <div 
          className={`absolute top-full mt-2 w-80 sm:w-88 border border-[var(--border-input)] rounded-2xl shadow-2xl z-50 p-4 text-xs ${activeRtl ? 'left-0' : 'right-0'}`}
          style={{ backgroundColor: 'var(--surface-card)', opacity: 1 }}
        >
          {/* هيدر القائمة */}
          <div className="flex justify-between items-center pb-3 mb-2 border-b border-[var(--border-card)]">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[var(--text-main)] text-sm">
                {t('notifications.title', 'التنبيهات')}
              </span>
              {unreadCount > 0 && (
                <span className="bg-[var(--emerald-bg)] text-[var(--emerald-text)] border border-[var(--emerald-border)] text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                  {unreadCount} {t('notifications.new', 'جديد')}
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={onMarkAllAsRead} 
                  title={t('notifications.markAllRead', 'تحديد الكل كمقروء')}
                  className="text-[var(--emerald-text)] hover:opacity-80 transition-opacity p-1 rounded-lg bg-[var(--emerald-bg)] border border-[var(--emerald-border)]"
                >
                  <CheckCheck size={14} />
                </button>
                <button 
                  type="button"
                  onClick={onClearAll} 
                  title={t('notifications.clearAll', 'حذف الكل')}
                  className="text-[var(--error)] hover:opacity-80 transition-opacity p-1 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* تبويب التصفية (الكل / غير مقروء) */}
          <div className="flex items-center gap-2 mb-3 bg-[var(--surface-input)] p-1 rounded-xl border border-[var(--border-input)]">
            <button
              type="button"
              onClick={() => setNotifFilter('all')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                notifFilter === 'all' 
                  ? 'bg-[var(--surface-card)] text-[var(--text-main)] shadow-sm' 
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              {t('notifications.all', 'الكل')} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setNotifFilter('unread')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                notifFilter === 'unread' 
                  ? 'bg-[var(--surface-card)] text-[var(--primary)] shadow-sm' 
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              {t('notifications.unread', 'غير مقروء')} ({unreadCount})
            </button>
          </div>

          {/* عناصر الإشعارات */}
          {loadingNotifs ? (
            <div className="py-8 text-[var(--text-sub)] text-center font-medium">
              {t('common.loading', 'جاري التحميل...')}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-8 text-[var(--text-sub)] text-center font-medium">
              {t('notifications.empty', 'لا توجد إشعارات جديدة')}
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredNotifications.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onNotificationClick(item)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                    !item.is_read 
                      ? 'bg-[var(--surface-input)] border-[var(--primary)]/40 text-[var(--text-main)] shadow-sm' 
                      : 'bg-[var(--surface-input)]/50 border-[var(--border-input)] text-[var(--text-sub)] hover:bg-[var(--surface-input)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className={`text-[12px] leading-snug ${!item.is_read ? 'font-bold text-[var(--text-main)]' : 'font-medium'}`}>
                      {item.title}
                    </span>
                    {item.message && (
                      <span className="text-[11px] text-[var(--text-sub)] line-clamp-2 leading-relaxed">
                        {item.message}
                      </span>
                    )}
                    <span className="text-[9px] text-[var(--text-sub)] opacity-75 font-mono">
                      {formatTime(item.created_at)}
                    </span>
                  </div>
                  
                  {!item.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1 shadow-[0_0_6px_var(--primary-glow)]" />
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
