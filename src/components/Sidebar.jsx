/* src/components/Sidebar.jsx */
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { 
  FaThLarge, 
  FaUserGraduate, 
  FaClipboardCheck, 
  FaGraduationCap, 
  FaMoneyBillWave, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt, 
  FaClock, 
  FaCrown,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaExchangeAlt,
  FaChevronDown
} from 'react-icons/fa';

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  isRtl,
  t,
  userRole,
  trialDaysLeft,
  isTrial,
  accountActivated,
  setShowEarlyUpgrade,
  numberFormatter,
  timezone,
  academyTime
}) {
  // 🌟 حالات داخلية مستقلة لحماية كود المكون الأب من الانهيار
  const [isSlim, setIsSlim] = useState(() => localStorage.getItem('smart_halaqa_slim') === 'true');
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeBranch, setActiveBranch] = useState(isRtl ? "الأكاديمية الرئيسية (الفرع العام)" : "Main Academy (General Branch)");

  // حفظ تفضيلات المستخدم للوضع المصغر تلقائياً لراحة الاستخدام
  useEffect(() => {
    localStorage.setItem('smart_halaqa_slim', isSlim);
  }, [isSlim]);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';

  // 🛡️ درع الحماية السحابي لمنع توقف الأزرار عند تحديث سيرفر Vercel
  const handleTabChange = async (tabId) => {
    try {
      setActiveTab(tabId);
      if (isMobile) setSidebarOpen(false);
    } catch (error) {
      console.error("🚨 Chunk rendering exception captured. Hard refreshing pipeline...", error);
      window.location.reload();
    }
  };

  // ⌨️ نظام اختصارات الكيبورد العالمي للمحترفين والمدراء (Alt + Number)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && !isMobile) {
        const targetTabs = ['dashboard', 'students', 'attendance', 'exams', 'reports', 'payments', 'settings'];
        const index = parseInt(e.key) - 1;
        if (index >= 0 && index < targetTabs.length) {
          if (isPlatformAdmin && targetTabs[index] !== 'dashboard' && targetTabs[index] !== 'settings') return;
          handleTabChange(targetTabs[index]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, userRole]);

  // 💎 مصفوفة العناصر المحدثة بالمسميات القرآنية والتربوية الفاخرة المعتمدة
  const menuItems = [
    { id: 'dashboard', label: t('dashboard', isRtl ? 'لوحة المتابعة' : 'Overview'), icon: <FaThLarge /> },
    { id: 'students', label: t('students', isRtl ? 'الطلاب والمحفظون' : 'Students & Instructors'), icon: <FaUserGraduate /> },
    { id: 'attendance', label: t('attendance', isRtl ? 'الحلقات والتسميع' : 'Halaqat & Recitation'), icon: <FaClipboardCheck /> },
    { 
      id: 'exams', 
      label: t('exams', isRtl ? 'الإختبارات والشهادات' : 'Assessments & Degrees'), 
      icon: <FaGraduationCap />,
      badge: isRtl ? "نشط" : "Live",
      badgeColor: '#10B981'
    },
    { id: 'reports', label: t('reports', isRtl ? 'حصاد الأداء' : 'Performance Analytics'), icon: <FaChartBar /> },
    { 
      id: 'payments', 
      label: t('payments', isRtl ? 'المالية والاشتراكات' : 'Financial Suite'), 
      icon: <FaMoneyBillWave />,
      badge: "⚡",
      badgeColor: '#FBBF24'
    },
    { id: 'settings', label: t('settings', isRtl ? 'إعدادات الأكاديمية' : 'Academy Settings'), icon: <FaCog /> },
  ];

  const filteredItems = isPlatformAdmin 
    ? menuItems.filter(item => item.id === 'dashboard' || item.id === 'settings')
    : menuItems;

  // فروع الأكاديميات الذكية والمبنية للتوسعات المستقبلية (Enterprise Feature)
  const mockBranches = isRtl 
    ? ["الأكاديمية الرئيسية (الفرع العام)", "حلقات البنين والمتميزين", "حلقات البنات والبراعم"]
    : ["Main Academy (General Branch)", "Boys & Premium Halaqas", "Girls & Kids Sections"];

  // تحديد عرض القائمة ديناميكياً بناءً على وضعية الانكماش الحالي
  const sidebarWidth = isMobile ? '280px' : (isSlim ? '78px' : '285px');

  return (
    <aside style={{
      width: sidebarWidth,
      backgroundColor: '#111827',
      borderLeft: isRtl ? '1px solid #1f2937' : 'none',
      borderRight: !isRtl ? '1px solid #1f2937' : 'none',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: isMobile ? 'fixed' : 'relative',
      top: 0,
      bottom: 0,
      left: isMobile ? (isRtl ? 'auto' : 0) : 'auto',
      right: isMobile ? (isRtl ? 0 : 'auto') : 'auto',
      zIndex: 1000,
      transform: isMobile ? (sidebarOpen ? 'translateX(0)' : `translateX(${isRtl ? '100%' : '-100%'})`) : 'none',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box',
      padding: isSlim && !isMobile ? '24px 10px' : '24px 16px',
      overflowX: 'visible'
    }}>
      
      {/* 🔄 زر التبديل والطيّ السريع للوضع المصغر (Slim Toggle Button) */}
      {!isMobile && (
        <button 
          onClick={() => setIsSlim(!isSlim)}
          style={{
            position: 'absolute',
            top: '32px',
            left: isRtl ? '-14px' : 'auto',
            right: !isRtl ? '-14px' : 'auto',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: '#1f2937',
            border: '1px solid #334155',
            color: '#FBBF24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1010,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isSlim ? (isRtl ? <FaChevronLeft size={11} /> : <FaChevronRight size={11} />) : (isRtl ? <FaChevronRight size={11} /> : <FaChevronLeft size={11} />)}
        </button>
      )}

      {/* 🏢 الجزء العلوي: مبدل فروع الأكاديميات الذكي والمستقل (Workspace Switcher) */}
      <div style={{ position: 'relative', marginBottom: '18px' }}>
        <div 
          onClick={() => !isSlim && setShowWorkspaceDropdown(!showWorkspaceDropdown)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '6px',
            borderRadius: '8px',
            cursor: isSlim ? 'default' : 'pointer',
            backgroundColor: showWorkspaceDropdown ? 'rgba(255,255,255,0.03)' : 'transparent',
            transition: 'background 0.2s'
          }}
        >
          <div style={{ 
            width: '42px', 
            height: '42px', 
            background: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
            flexShrink: 0
          }}>
            <span style={{ color: '#000', fontWeight: '900', fontSize: '1.25rem' }}>ح</span>
          </div>
          
          {!isSlim && (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ minWidth: 0, width: '90%' }}>
                <h1 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
                </h1>
                <span style={{ fontSize: '0.72rem', color: '#9CA3AF', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isPlatformAdmin ? 'Platform Admin' : activeBranch}
                </span>
              </div>
              {!isPlatformAdmin && <FaChevronDown size={10} style={{ color: '#6B7280', transition: 'transform 0.2s', transform: showWorkspaceDropdown ? 'rotate(180deg)' : 'none' }} />}
            </div>
          )}
        </div>

        {/* قائمة فروع الأكاديمية المنسدلة الاحترافية */}
        {showWorkspaceDropdown && !isSlim && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#1f2937',
            border: '1px solid #334155',
            borderRadius: '10px',
            marginTop: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 1050,
            padding: '6px',
            direction: isRtl ? 'rtl' : 'ltr'
          }}>
            <span style={{ display: 'block', padding: '6px 10px', fontSize: '0.68rem', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {isRtl ? 'تبديل فرع الأكاديمية' : 'Switch Workspace Branch'}
            </span>
            {mockBranches.map((branch, i) => (
              <div 
                key={i}
                onClick={() => {
                  setActiveBranch(branch);
                  setShowWorkspaceDropdown(false);
                }}
                style={{
                  padding: '10px',
                  fontSize: '0.82rem',
                  color: activeBranch === branch ? '#FBBF24' : '#E2E8F0',
                  backgroundColor: activeBranch === branch ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: activeBranch === branch ? 'bold' : 'normal'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeBranch === branch ? 'rgba(251, 191, 36, 0.08)' : 'transparent'}
              >
                <FaExchangeAlt size={10} style={{ opacity: activeBranch === branch ? 1 : 0.3 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{branch}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🕒 ويدجيت توقيت الأكاديمية الجغرافي والمنطقة الزمنية */}
      {!isSlim && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px', marginBottom: '20px', opacity: 0.85 }}>
          <span style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontFamily: 'monospace' }}>
            {timezone?.split('/')[1] || 'UTC'} : {academyTime || '--:--'}
          </span>
        </div>
      )}

      {/* 🔍 مشغل لوحة الأوامر السريعة الاحترافي (Command Palette Trigger Input) */}
      <div style={{ marginBottom: '22px', padding: '0 4px' }}>
        <div 
          onClick={() => console.log("⌨️ Command Palette Triggered via Ctrl+K Simulator")}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSlim ? 'center' : 'space-between',
            padding: '10px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#9CA3AF',
            transition: 'border 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4b5563'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaSearch size={13} style={{ color: '#6B7280' }} />
            {!isSlim && <span style={{ fontSize: '0.8rem' }}>{isRtl ? 'بحث سريع...' : 'Quick Command...'}</span>}
          </div>
          {!isSlim && (
            <kbd style={{
              background: '#0f172a',
              border: '1px solid #475569',
              borderRadius: '4px',
              padding: '1px 5px',
              fontSize: '0.65rem',
              color: '#64748b',
              fontFamily: 'monospace'
            }}>Ctrl K</kbd>
          )}
        </div>
      </div>

      {/* 🎫 كارت الاشتراك والترقية الذكي المستوحى من [Screenshot_20260701-131736.png] */}
      {!isPlatformAdmin && (isTrial || !accountActivated) && (
        <div 
          onClick={() => setShowEarlyUpgrade(true)}
          style={{
            background: 'linear-gradient(145deg, rgba(217, 119, 6, 0.12) 0%, rgba(17, 24, 39, 0.95) 100%)',
            border: '1px solid rgba(217, 119, 6, 0.45)',
            borderRadius: '12px',
            padding: isSlim ? '10px 6px' : '14px',
            marginBottom: '24px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isSlim ? 'center' : 'stretch',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#FBBF24';
            e.currentTarget.style.boxShadow = '0 6px 22px rgba(251, 191, 36, 0.18)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(217, 119, 6, 0.45)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isSlim ? 'center' : 'space-between',
            width: '100%',
            flexDirection: isRtl ? 'row' : 'row-reverse'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isSlim ? '0' : '10px' }}>
              <FaClock style={{ color: '#FBBF24', fontSize: '1.05rem' }} />
              {!isSlim && (
                <span style={{ fontSize: '0.88rem', color: '#FBBF24', fontWeight: '700' }}>
                  {isTrial 
                    ? (isRtl ? `متبقى ${numberFormatter.format(trialDaysLeft || 10)} أيام تجريبية` : `${numberFormatter.format(trialDaysLeft || 10)} Trial Days Left`)
                    : (isRtl ? 'تفعيل الأكاديمية' : 'Activate System')}
                </span>
              )}
            </div>
            {!isSlim && <FaCrown style={{ color: 'rgba(251, 191, 36, 0.55)', fontSize: '0.9rem' }} />}
          </div>

          {/* خط التقدم البصري التفاعلي وفحصه للأيام المتبقية */}
          {isTrial && !isSlim && (
            <div style={{ width: '100%', height: '4px', backgroundColor: '#1f2937', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, ((trialDaysLeft || 10) / 14) * 100)}%`, 
                height: '100%', 
                backgroundColor: '#FBBF24'
              }}></div>
            </div>
          )}
        </div>
      )}

      {/* 🔘 أزرار التنقل السلسة بالاتجاهين مع دعم الـ Badges والـ Tooltips للوضع المصغر */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
        {filteredItems.map((item, index) => {
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ position: 'relative' }}
            >
              <button
                onClick={() => handleTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSlim && !isMobile ? 'center' : 'flex-start',
                  gap: isSlim && !isMobile ? '0' : '14px',
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: isActive ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                  color: isActive ? '#FBBF24' : '#9CA3AF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? '700' : '500',
                  textAlign: isRtl ? 'right' : 'left',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? (isRtl ? 'inset -4px 0px 0px #FBBF24' : 'inset 4px 0px 0px #FBBF24') : 'none',
                  flexDirection: isRtl ? 'row' : 'row-reverse'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#FFF';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#9CA3AF';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {/* الأيقونة */}
                <span style={{ 
                  fontSize: '1.15rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: isActive ? '#FBBF24' : '#6B7280',
                  transition: 'color 0.2s'
                }}>
                  {item.icon}
                </span>

                {/* النص البرمجي التفاعلي */}
                {(!isSlim || isMobile) && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {item.label}
                  </span>
                )}

                {/* العداد الذكي / الكبسولة التفاعلية (Dynamic Badge) */}
                {item.badge && (!isSlim || isMobile) && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    backgroundColor: item.badgeColor,
                    color: '#000',
                    fontWeight: 'bold',
                    lineHeight: '1'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>

              {/* 💡 نظام التلميحات الفاخر الفوري للوضع المصغر (Micro UI Hover Floating Tooltip) */}
              {isSlim && !isMobile && hoveredItem === index && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: isRtl ? 'auto' : '85px',
                  right: isRtl ? '85px' : 'auto',
                  backgroundColor: '#1f2937',
                  color: '#FFF',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  border: '1px solid #334155',
                  zIndex: 2000,
                  pointerEvents: 'none',
                  animation: 'fadeIn 0.15s ease'
                }}>
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 🔴 الجزء السفلي: زر تسجيل الخروج المحمي تزامناً مع أبعاد الأيقونات والوضع المصغر */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1f2937' }}>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSlim && !isMobile ? 'center' : 'flex-start',
            gap: isSlim && !isMobile ? '0' : '14px',
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: '#EF4444',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.92rem',
            fontWeight: '600',
            textAlign: isRtl ? 'right' : 'left',
            transition: 'all 0.2s',
            flexDirection: isRtl ? 'row' : 'row-reverse'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FaSignOutAlt style={{ fontSize: '1.15rem' }} />
          {(!isSlim || isMobile) && <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>}
        </button>
      </div>

    </aside>
  );
}
