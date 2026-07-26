import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaCheckDouble, FaTrashAlt, FaExternalLinkAlt } from 'react-icons/fa';

export default function NotificationMenu({ isRtl, isMobile, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // بيانات إشعارات تجريبية (يمكن ربطها مستقبلاً بـ Supabase أو Context)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: isRtl ? 'حلقة جديدة تم إنشاؤها' : 'New Halaqa Created',
      time: isRtl ? 'منذ 10 دقائق' : '10m ago',
      read: false,
      tab: 'halaqas'
    },
    {
      id: 2,
      title: isRtl ? 'تم تسجيل طالب جديد' : 'New Student Registered',
      time: isRtl ? 'منذ ساعة' : '1h ago',
      read: false,
      tab: 'students'
    },
    {
      id: 3,
      title: isRtl ? 'تنبيه تجديد الاشتراك' : 'Subscription Renewal Alert',
      time: isRtl ? 'منذ يومين' : '2d ago',
      read: true,
      tab: 'subscription'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (tab) => {
    if (tab && setActiveTab) {
      setActiveTab(tab);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* زر التنبيهات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all duration-200 focus:outline-none"
        aria-label="Notifications"
      >
        <FaBell className="text-base" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-72 md:w-80 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden text-xs ${
            isRtl ? 'left-0' : 'right-0'
          }`}
        >
          {/* الهيدر الخاص بالقائمة */}
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                {isRtl ? 'التنبيهات' : 'Notifications'}
              </span>
              {unreadCount > 0 && (
                <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded-full text-[10px]">
                  {unreadCount} {isRtl ? 'جديد' : 'new'}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  onClick={markAllAsRead}
                  title={isRtl ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                  className="hover:text-sky-400 transition-colors p-1"
                >
                  <FaCheckDouble />
                </button>
                <button
                  onClick={clearAll}
                  title={isRtl ? 'مسح الكل' : 'Clear all'}
                  className="hover:text-rose-400 transition-colors p-1"
                >
                  <FaTrashAlt />
                </button>
              </div>
            )}
          </div>

          {/* قائمة الإشعارات */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                {isRtl ? 'لا توجد تنبيهات جديدة' : 'No notifications'}
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item.tab)}
                  className={`p-3 flex items-start justify-between gap-2 cursor-pointer hover:bg-slate-800/40 transition-colors ${
                    !item.read ? 'bg-sky-500/5' : ''
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className={`text-slate-200 ${!item.read ? 'font-semibold text-sky-300' : ''}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-500">{item.time}</span>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0 mt-1"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
