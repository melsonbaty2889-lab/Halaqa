// src/components/Header/NotificationMenu.jsx
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Video, 
  BookOpen, 
  UserCheck, 
  Info, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

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

  // دالة اختيار الأيقونة واللون حسب نوع التنبيه
  const getNotifStyle = (category) => {
    switch (category) {
      case 'live_session':
      case 'session':
        return {
          icon: <Video size={13} className="text-[var(--primary)]" />,
          bg: 'bg-[var(--primary)]/10',
          border: 'border-[var(--primary)]/30'
        };
      case 'recitation':
      case 'quran':
        return {
          icon: <BookOpen size={13} className="text-[var(--emerald-text)]" />,
          bg: 'bg-[var(--emerald-bg)]',
          border: 'border-[var(--emerald-border)]'
        };
      case 'attendance':
        return {
          icon: <UserCheck size={13} className="text-sky-400" />,
          bg: 'bg-sky-500/10',
          border: 'border-sky-500/20'
        };
      default:
        return {
          icon: <Info size={13} className="text-[var(--text-sub)]" />,
          bg: 'bg-[var(--surface-input)]',
          border: 'border-[var(--border-input)]'
        };
    }
  };

  return (
    <div className="relative inline-block">
      {/* زر الجرس الرئيسي */}
      <button 
        type="button"
        onClick={onToggle}
        className="p-1.5 bg-[var(--surface-input)] hover:bg-[var(--border-hover)] border border-[var(--border-input)] rounded-xl text-[var(--text-sub)] hover:text-[var(--text-main)] transition-all relative flex items-center justify-center active:scale-95 shadow-sm cursor-pointer"
        title={t('notifications.title', { defaultValue: 'مركز التنبيهات' })}
      >
        <Bell size={16} className="text-[var(--primary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_var(--primary-glow)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة */}
      {showMenu && (
        <div 
          className={`absolute top-full mt-2 w-72 border border-[var(--border-card)] rounded-2xl shadow-2xl z-50 p-2.5 text-xs bg-[var(--surface-dropdown)] ${
            activeRtl ? 'left-0 text-right' : 'right-0 text-left'
          }`}
          style={{ maxWidth: 'calc(100vw - 24px)' }}
          dir={activeRtl ? 'rtl' : 'ltr'}
        >
          {/* الرأس */}
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-[var(--border-card)] w-full">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-extrabold text-[var(--text-main)] text-[12px] truncate">
                {t('notifications.title', { defaultValue: 'التنبيهات' })}
              </span>
              {unreadCount > 0 && (
                <span className="bg-[var(--emerald-bg)] text-[var(--emerald-text)] border border-[var(--emerald-border)] text-[9px] px-1.5 py-0.5 rounded-full font-extrabold shrink-0">
                  {unreadCount} {t('notifications.new', { defaultValue: 'جديد' })}
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  type="button"
                  onClick={onMarkAllAsRead} 
                  title={t('notifications.markAllRead', { defaultValue: 'تحديد الكل كمقروء' })}
                  className="text-[var(--emerald-text)] hover:opacity-80 transition-opacity p-1 rounded-lg bg-[var(--emerald-bg)] border border-[var(--emerald-border)] cursor-pointer"
                >
                  <CheckCheck size={12} />
                </button>
                <button 
                  type="button"
                  onClick={onClearAll} 
                  title={t('notifications.clearAll', { defaultValue: 'حذف الكل' })}
                  className="text-[var(--error)] hover:opacity-80 transition-opacity p-1 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* تصفية التنبيهات */}
          <div className="flex items-center gap-1 mb-2 bg-[var(--surface-input)] p-0.5 rounded-xl border border-[var(--border-input)] w-full">
            <button
              type="button"
              onClick={() => setNotifFilter('all')}
              className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                notifFilter === 'all' 
                  ? 'bg-[var(--surface-card)] text-[var(--text-main)] shadow-sm' 
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              {t('notifications.all', { defaultValue: 'الكل' })} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setNotifFilter('unread')}
              className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                notifFilter === 'unread' 
                  ? 'bg-[var(--surface-card)] text-[var(--primary)] shadow-sm' 
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              {t('notifications.unread', { defaultValue: 'غير مقروء' })} ({unreadCount})
            </button>
          </div>

          {/* القائمة والمحتوى */}
          {loadingNotifs ? (
            <div className="py-6 text-[var(--text-sub)] text-center font-medium text-[11px]">
              {t('common.loading', { defaultValue: 'جاري التحميل...' })}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-6 text-[var(--text-sub)] text-center font-medium text-[11px]">
              {t('notifications.empty', { defaultValue: 'لا توجد إشعارات جديدة' })}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1.5 custom-scrollbar">
              {filteredNotifications.map((item) => {
                const style = getNotifStyle(item.category || item.type);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => onNotificationClick(item)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2 group ${
                      !item.is_read 
                        ? 'bg-[var(--surface-input)] border-[var(--primary)]/40 text-[var(--text-main)] shadow-sm' 
                        : 'bg-[var(--surface-input)]/50 border-[var(--border-input)] text-[var(--text-sub)] hover:bg-[var(--surface-input)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {/* أيقونة الفئة */}
                    <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${style.bg} ${style.border}`}>
                      {style.icon}
                    </div>

                    {/* نص التنبيه والإجراء */}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10.5px] leading-snug truncate ${!item.is_read ? 'font-bold text-[var(--text-main)]' : 'font-medium'}`}>
                          {item.title}
                        </span>
                        {!item.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 shadow-[0_0_6px_var(--primary-glow)]" />
                        )}
                      </div>

                      {item.message && (
                        <span className="text-[9.5px] text-[var(--text-sub)] line-clamp-2 leading-relaxed">
                          {item.message}
                        </span>
                      )}

                      {/* زر الإجراء السريع الذكي */}
                      {item.action_text && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold text-[var(--primary)] group-hover:underline">
                            {item.action_text}
                            {activeRtl ? <ArrowLeft size={10} /> : <ArrowRight size={10} />}
                          </span>
                        </div>
                      )}

                      <span className="text-[8.5px] text-[var(--text-sub)] opacity-75 font-mono mt-0.5">
                        {formatTime(item.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
