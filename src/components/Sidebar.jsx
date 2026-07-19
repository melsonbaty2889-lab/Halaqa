/* src/components/Sidebar.jsx */
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FaThLarge, 
  FaUserGraduate, 
  FaClipboardCheck, 
  FaGraduationCap, 
  FaMoneyBillWave, 
  FaCog, 
  FaSignOutAlt, 
  FaClock, 
  FaSearch, 
  FaExchangeAlt, 
  FaChevronDown, 
  FaChalkboardTeacher, 
  FaUsers, 
  FaWifi 
} from 'react-icons/fa';

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  isRtl,
  userRole,
  trialDaysLeft,
  isTrial,
  accountActivated,
  setShowEarlyUpgrade,
  numberFormatter,
  timezone,
  academyTime,
  onSearchClick 
}) {
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [activeBranchKey, setActiveBranchKey] = useState('main');
  
  // مراقبة حالة الإنترنت
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';

  const handleTabChange = async (tabId) => {
    try {
      setActiveTab(tabId);
      if (isMobile) setSidebarOpen(false);
    } catch (error) {
      console.error("🚨 Captured rendering exception. Refreshing pipeline...", error);
      window.location.reload();
    }
  };

  const handleSearchTrigger = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // منع التداخل مع أحداث سحب القائمة في الموبايل
    }
    
    console.log("🔍 [Sidebar] Search trigger fired successfully.");

    if (typeof onSearchClick === 'function') {
      console.log("➡️ Executing onSearchClick prop function.");
      onSearchClick();
      return;
    }

    console.log("➡️ Broadcasting global search events to window pipeline...");
    window.dispatchEvent(new CustomEvent('toggle-command-palette'));
    window.dispatchEvent(new CustomEvent('toggle-search'));
    window.dispatchEvent(new CustomEvent('open-search'));
  };

  const getSafeHijriDate = () => {
    try {
      if (isRtl) {
        return new Date().toLocaleDateString('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(new Date());
      const day = parts.find(p => p.type === 'day')?.value || '';
      const monthNum = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
      const year = parts.find(p => p.type === 'year')?.value || '';
      const hijriMonthsEn = ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];
      return `${hijriMonthsEn[monthNum - 1] || 'Muharram'} ${day}, ${year} AH`;
    } catch (e) {
      return new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
    }
  };

  const menuItems = [
    { id: 'dashboard', labelAr: 'الرئيسية والتحليلات', labelEn: 'Home & Analytics', icon: <FaThLarge /> },
    { id: 'students', labelAr: 'شؤون الطلاب', labelEn: 'Students Suite', icon: <FaUserGraduate /> },
    { id: 'teachers', labelAr: 'الكادر التعليمي', labelEn: 'Faculty & Staff', icon: <FaChalkboardTeacher /> },
    { id: 'halaqas', labelAr: 'الحلقات والمجموعات', labelEn: 'Halaqas & Groups', icon: <FaUsers /> }, 
    { id: 'attendance', labelAr: 'التحضير والتسميع', labelEn: 'Attendance & Progress', icon: <FaClipboardCheck /> },
    { 
      id: 'exams', 
      labelAr: 'الاختبارات والشهادات', 
      labelEn: 'Exams & Degrees', 
      icon: <FaGraduationCap />,
      badge: isRtl ? "نشط" : "Live",
      badgeColor: '#10B981'
    },
    { 
      id: 'payments', 
      labelAr: 'المالية والاشتراكات', 
      labelEn: 'Finance & Billing', 
      icon: <FaMoneyBillWave />,
      badge: "👑", 
      badgeColor: '#FBBF24'
    },
    { id: 'settings', labelAr: 'إعدادات المنصة', labelEn: 'System Settings', icon: <FaCog /> },
  ];

  const branchDictionary = {
    main: { ar: "الأكاديمية الرئيسية", en: "Main Academy" },
    boys: { ar: "حلقات البنين", en: "Boys Section" },
    girls: { ar: "حلقات البنات", en: "Girls Section" }
  };

  const sidebarWidth = isMobile ? '280px' : '275px';

  return (
    <aside style={{
      width: sidebarWidth,
      backgroundColor: '#0F172A',
      borderLeft: isRtl ? '1px solid rgba(30, 41, 59, 0.7)' : 'none',
      borderRight: !isRtl ? '1px solid rgba(30, 41, 59, 0.7)' : 'none',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: isMobile ? 'fixed' : 'relative',
      top: 0, bottom: 0,
      left: isMobile ? (isRtl ? 'auto' : 0) : 'auto',
      right: isMobile ? (isRtl ? 0 : 'auto') : 'auto',
      zIndex: 1000,
      transform: isMobile ? (sidebarOpen ? 'translateX(0)' : `translateX(${isRtl ? '100%' : '-100%'})`) : 'none',
      transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box',
      padding: '20px 12px',
      overflowX: 'visible',
      direction: isRtl ? 'rtl' : 'ltr'
    }}>
      
      <style>{`
        aside::-webkit-scrollbar { display: none !important; }
        aside *::-webkit-scrollbar { display: none !important; }
      `}</style>

      {/* هوية الأكاديمية واختيار الفروع */}
      <div style={{ position: 'relative', marginBottom: '16px', flexShrink: 0 }}>
        <div 
          onClick={() => !isPlatformAdmin && setShowWorkspaceDropdown(!showWorkspaceDropdown)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '12px',
            cursor: isPlatformAdmin ? 'default' : 'pointer',
            backgroundColor: showWorkspaceDropdown ? 'rgba(30, 41, 59, 0.8)' : 'transparent',
            border: '1px solid', borderColor: showWorkspaceDropdown ? 'rgba(251, 191, 36, 0.25)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ 
            width: '40px', height: '40px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', 
            border: '1px solid rgba(251, 191, 36, 0.2)', flexShrink: 0, position: 'relative'
          }}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '85%', height: '85%', margin: 'auto' }}>
              <circle cx="50" cy="50" r="40" stroke="#FBBF24" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.4" />
              <path d="M50 68C40 64 26 65 18 69V35C26 31 40 30 50 35M50 68C60 64 74 65 82 69V35C74 31 60 30 50 35M32 67L45 77M68 67L55 77M50 35V68" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
            <span style={{
              position: 'absolute', bottom: '-1px', right: isRtl ? '-1px' : 'auto', left: !isRtl ? '-1px' : 'auto',
              width: '8px', height: '8px', backgroundColor: isOnline ? '#10B981' : '#6B7280', borderRadius: '50%', border: '2px solid #0F172A'
            }}></span>
          </div>
          
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
              </h1>
              <span style={{ fontSize: '0.7rem', color: '#9CA3AF', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                {isPlatformAdmin ? 'Platform Admin' : (isRtl ? branchDictionary[activeBranchKey].ar : branchDictionary[activeBranchKey].en)}
              </span>
            </div>
            {!isPlatformAdmin && <FaChevronDown size={10} style={{ color: '#6B7280', transform: showWorkspaceDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
          </div>
        </div>

        {showWorkspaceDropdown && (
          <div style={{
            position: 'absolute', top: '100%', left: '0', right: '0',
            width: '100%', backgroundColor: '#1E293B', border: '1px solid #334155',
            borderRadius: '10px', marginTop: '6px', boxShadow: '0 12px 20px rgba(0,0,0,0.5)', zIndex: 1050, padding: '6px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {Object.keys(branchDictionary).map((key) => {
                const isSelected = activeBranchKey === key;
                return (
                  <div 
                    key={key}
                    onClick={() => { setActiveBranchKey(key); setShowWorkspaceDropdown(false); }}
                    style={{
                      padding: '8px 10px', fontSize: '0.8rem', color: isSelected ? '#FBBF24' : '#E2E8F0',
                      backgroundColor: isSelected ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                      borderRight: isRtl && isSelected ? '3px solid #FBBF24' : 'none',
                      borderLeft: !isRtl && isSelected ? '3px solid #FBBF24' : 'none',
                      borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: isSelected ? '700' : '500'
                    }}
                  >
                    <FaExchangeAlt size={10} style={{ opacity: isSelected ? 1 : 0.4 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isRtl ? branchDictionary[key].ar : branchDictionary[key].en}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {/* قطاع التوقيت والتواريخ الهجرية والميلادية */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '0 6px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', direction: 'ltr', justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
            <span style={{ width: '5px', height: '5px', backgroundColor: '#10B981', borderRadius: '50%' }}></span>
            <span style={{ fontSize: '0.75rem', color: '#CBD5E1', fontFamily: 'monospace', fontWeight: '600' }}>
              {timezone?.split('/')[1] || 'Cairo'} : {academyTime || '--:--'}
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: '500' }}>
            <span>📅 </span>{new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#FBBF24', fontWeight: '600' }}>
            <span>🌙 </span>{getSafeHijriDate()}
          </div>
        </div>

        {/* زر البحث السريع المتطور والمحمي من أعطال اللمس */}
        <div style={{ marginBottom: '16px', padding: '0 2px', flexShrink: 0, position: 'relative', zIndex: 50 }}>
          <button 
            type="button"
            onClick={handleSearchTrigger}
            onTouchStart={(e) => handleSearchTrigger(e)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', backgroundColor: 'rgba(30, 41, 59, 0.4)', border: '1px solid #1E293B',
              borderRadius: '8px', cursor: 'pointer', color: '#9CA3AF', transition: 'all 0.2s',
              width: '100%', outline: 'none', fontFamily: 'inherit', fontStyle: 'inherit',
              position: 'relative', pointerEvents: 'auto', zIndex: 60
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, pointerEvents: 'none' }}>
              <FaSearch size={11} style={{ color: '#FBBF24', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{isRtl ? 'بحث سريع...' : 'Quick Search...'}</span>
            </div>
            <kbd style={{
              background: '#0F172A', border: '1px solid #334155', borderRadius: '4px', padding: '1px 4px', fontSize: '0.6rem', color: '#9CA3AF', fontFamily: 'monospace', pointerEvents: 'none'
            }}>{isMobile ? "Tap" : "Ctrl K"}</kbd>
          </button>
        </div>

        {/* مؤشر الفترة التجريبية وتفعيل النظام */}
        {!isPlatformAdmin && (isTrial || !accountActivated) && (
          <div 
            onClick={() => setShowEarlyUpgrade(true)}
            style={{
              background: 'linear-gradient(145deg, rgba(217, 119, 6, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'stretch'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <FaClock style={{ color: '#FBBF24', fontSize: '0.95rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '700' }}>
                {isTrial ? (isRtl ? `متبقي ${numberFormatter.format(trialDaysLeft || 10)} أيام تجريبية` : `${numberFormatter.format(trialDaysLeft || 10)} Days Left`) : (isRtl ? 'تفعيل الحساب الكامل' : 'Activate System')}
              </span>
            </div>
          </div>
        )}

        {/* أزرار التنقل والقائمة الرئيسية */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const displayLabel = isRtl ? item.labelAr : item.labelEn;

            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleTabChange(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                    gap: '12px', width: '100%', padding: '10px 12px',
                    backgroundColor: isActive ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                    color: isActive ? '#FBBF24' : '#9CA3AF', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: isActive ? '700' : '500', transition: 'all 0.15s ease',
                    boxShadow: isActive ? (isRtl ? 'inset -3px 0px 0px #FBBF24' : 'inset 3px 0px 0px #FBBF24') : 'none'
                  }}
                >
                  <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: isActive ? '#FBBF24' : '#475569', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', textAlign: isRtl ? 'right' : 'left' }}>{displayLabel}</span>
                  {item.badge && (
                    <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '6px', backgroundColor: item.badgeColor, color: '#000', fontWeight: 'bold' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* التذييل مؤشر اتصال السحابة وتسجيل الخروج */}
      <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(30, 41, 59, 0.6)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px',
          backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          border: '1px solid', borderColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          fontSize: '0.68rem', color: isOnline ? '#10B981' : '#EF4444'
        }}>
          <FaWifi size={10} />
          <span>{isOnline ? (isRtl ? "اتصال سحابي آمن مفعّل" : "Secure Cloud Active") : (isRtl ? "وضع الحفظ المحلي مؤقتاً" : "Offline Sync Mode")}</span>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            gap: '12px', width: '100%', padding: '10px 12px',
            backgroundColor: 'transparent', color: '#F87171', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.15s'
          }}
        >
          <FaSignOutAlt style={{ fontSize: '1rem', flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
        </button>
      </div>

    </aside>
  );
}
