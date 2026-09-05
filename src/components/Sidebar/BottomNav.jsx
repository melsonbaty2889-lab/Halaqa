import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Sparkles, 
  Menu 
} from 'lucide-react';
import { colors as C } from '@/theme/colors';

const BottomNav = ({ userPlan }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // التحقق مما إذا كان الحساب في الفترة التجريبية فقط
  const isTrial = userPlan === 'trial' || userPlan === 'تجريبي';

  // قائمة أزرار الشريط السفلي بمفاتيح الترجمة
  const navItems = [
    { 
      id: 'home',
      label: t('bottomNav.home', 'الرئيسية'), 
      icon: LayoutDashboard, 
      path: '/dashboard' 
    },
    { 
      id: 'students',
      label: t('bottomNav.students', 'الطلاب'), 
      icon: Users, 
      path: '/students' 
    },
    { 
      id: 'halaqat',
      label: t('bottomNav.halaqat', 'الحلقات'), 
      icon: BookOpen, 
      path: '/halaqat' 
    },
    ...(isTrial ? [{ 
      id: 'upgrade',
      label: t('bottomNav.upgrade', 'الترقية'), 
      icon: Sparkles, 
      path: '/upgrade' 
    }] : []),
    { 
      id: 'more',
      label: t('bottomNav.more', 'المزيد'), 
      icon: Menu, 
      path: '/more' 
    },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 py-2 backdrop-blur-md transition-colors duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: C.dark?.card,
        borderColor: C.dark?.cardBorder,
        borderTopWidth: '1px',
        borderTopStyle: 'solid'
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className="flex flex-col items-center justify-center w-full py-1 text-xs transition-colors duration-200"
              style={({ isActive }) => ({
                color: isActive ? (C.emerald?.light || C.amber?.main) : C.text?.muted,
                fontWeight: isActive ? '700' : '500'
              })}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
