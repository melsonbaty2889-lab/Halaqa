// src/components/Sidebar/BottomNav.jsx
import React, { useCallback } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Sparkles, 
  Menu 
} from 'lucide-react';
import { colors as C } from '@/theme/colors';

const BottomNav = ({ userPlan, setActiveTab, setSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const isRtl = i18n.dir ? i18n.dir() === 'rtl' : true;

  // دالة الترجمة الآمنة المتوافقة مع دليل التعديلات
  const safeT = useCallback((key, fallback) => {
    if (typeof t === 'function') {
      return t(key, { defaultValue: fallback || key });
    }
    return fallback || key;
  }, [t]);

  // التحقق مما إذا كان الحساب في الفترة التجريبية
  const isTrial = userPlan === 'trial' || userPlan === 'تجريبي';

  // صياغة المسار بناءً على وجود slug الأكاديمية
  const getPath = (tabId) => {
    if (slug) {
      return `/${slug}/${tabId}`;
    }
    return `/${tabId}`;
  };

  // قائمة أزرار الشريط السفلي متطابقة مع المعرفات المسجلة في Sidebar
  const navItems = [
    { 
      id: 'dashboard',
      label: safeT('bottomNav.home', 'الرئيسية'), 
      icon: LayoutDashboard, 
      path: getPath('dashboard') 
    },
    { 
      id: 'students',
      label: safeT('bottomNav.students', 'الطلاب'), 
      icon: Users, 
      path: getPath('students') 
    },
    { 
      id: 'halaqat',
      label: safeT('bottomNav.halaqat', 'الحلقات'), 
      icon: BookOpen, 
      path: getPath('halaqat') 
    },
    ...(isTrial ? [{ 
      id: 'upgrade',
      label: safeT('bottomNav.upgrade', 'الترقية'), 
      icon: Sparkles, 
      path: getPath('upgrade') 
    }] : []),
    { 
      id: 'more',
      label: safeT('bottomNav.more', 'المزيد'), 
      icon: Menu, 
      path: 'more' // زر فتح القائمة الجانبية
    },
  ];

  const handleItemClick = (e, item) => {
    if (item.id === 'more') {
      e.preventDefault();
      if (typeof setSidebarOpen === 'function') {
        setSidebarOpen(true);
      }
      return;
    }

    if (typeof setActiveTab === 'function') {
      setActiveTab(item.id);
    }
  };

  return (
    <nav 
      aria-label={safeT('bottomNav.accessibilityLabel', 'شريط التنقل السفلي')}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 py-1 backdrop-blur-md transition-colors duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: C.dark?.card || '#0f172a',
        borderColor: C.dark?.cardBorder || 'rgba(255, 255, 255, 0.1)',
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        paddingBottom: 'calc(4px + env(safe-area-inset-bottom, 0px))'
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.id === 'more') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleItemClick(e, item)}
                aria-label={item.label}
                className="flex flex-col items-center justify-center w-full py-1.5 text-xs transition-colors duration-200 border-0 bg-transparent cursor-pointer"
                style={{
                  minHeight: '44px',
                  color: C.text?.muted || '#94a3b8'
                }}
              >
                <Icon className="w-5 h-5 mb-1 shrink-0" />
                <span className="text-[11px] leading-tight truncate">{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={(e) => handleItemClick(e, item)}
              aria-label={item.label}
              className="flex flex-col items-center justify-center w-full py-1.5 text-xs transition-colors duration-200"
              style={({ isActive }) => ({
                minHeight: '44px',
                color: isActive ? (C.emerald?.light || C.amber?.DEFAULT || '#10b981') : (C.text?.muted || '#94a3b8'),
                fontWeight: isActive ? '700' : '500'
              })}
            >
              <Icon className="w-5 h-5 mb-1 shrink-0" />
              <span className="text-[11px] leading-tight truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
