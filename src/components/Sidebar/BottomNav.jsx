// src/components/Sidebar/BottomNav.jsx
import React from 'react';
import { LayoutDashboard, Users, BookOpen, Sparkles, Menu } from 'lucide-react';
import { colors as C } from '@/theme/colors';
import useIsMobile from '@/hooks/useIsMobile';

export default function BottomNav({
  activeTab,
  setActiveTab,
  setSidebarOpen,
  isRtl = true
}) {
  const isMobile = useIsMobile(1024);

  if (!isMobile) return null;

  const navItems = [
    { id: 'dashboard', label: isRtl ? 'الرئيسية' : 'Home', icon: LayoutDashboard },
    { id: 'students', label: isRtl ? 'الطلاب' : 'Students', icon: Users },
    { id: 'halaqas', label: isRtl ? 'الحلقات' : 'Halaqas', icon: BookOpen },
    { id: 'upgrade', label: isRtl ? 'الترقية' : 'Upgrade', icon: Sparkles, isHighlight: true },
  ];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: C.dark?.surfaceCard || '#0f172a',
        borderTop: `1px solid ${C.dark?.border || 'rgba(255,255,255,0.1)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 990,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              padding: '6px 8px',
              color: isActive
                ? (item.isHighlight ? '#f59e0b' : (C.primary?.DEFAULT || '#E07A00'))
                : (C.text?.muted || '#94A3B8'),
              cursor: 'pointer',
              flex: 1
            }}
          >
            <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? '700' : '500' }}>
              {item.label}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          padding: '6px 8px',
          color: C.text?.muted || '#94A3B8',
          cursor: 'pointer',
          flex: 1
        }}
      >
        <Menu size={19} />
        <span style={{ fontSize: '0.65rem', fontWeight: '500' }}>
          {isRtl ? 'المزيد' : 'More'}
        </span>
      </button>
    </div>
  );
}
