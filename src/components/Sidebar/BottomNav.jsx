import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Sparkles, 
  Menu 
} from 'lucide-react';

const BottomNav = ({ userPlan }) => {
  // التحقق مما إذا كان الحساب في الفترة التجريبية فقط
  const isTrial = userPlan === 'trial' || userPlan === 'تجريبي';

  // قائمة أزرار الشريط السفلي
  const navItems = [
    { 
      id: 'home',
      label: 'الرئيسية', 
      icon: LayoutDashboard, 
      path: '/dashboard' 
    },
    { 
      id: 'students',
      label: 'الطلاب', 
      icon: Users, 
      path: '/students' 
    },
    { 
      id: 'halaqat',
      label: 'الحلقات', 
      icon: BookOpen, 
      path: '/halaqat' 
    },
    // يظهر زر الترقية فقط إذا كان الحساب في الفترة التجريبية
    ...(isTrial ? [{ 
      id: 'upgrade',
      label: 'الترقية', 
      icon: Sparkles, 
      path: '/upgrade' 
    }] : []),
    { 
      id: 'more',
      label: 'المزيد', 
      icon: Menu, 
      path: '/more' 
    },
  ];

  return (
    // مخفي في الشاشات الكبيرة (md:hidden) لمنع التداخل مع القائمة الجانبية
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a] border-t border-slate-800 px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full py-1 text-xs transition-colors duration-200 ${
                  isActive
                    ? 'text-amber-500 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
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
