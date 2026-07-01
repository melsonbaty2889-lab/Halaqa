/* src/components/Sidebar.jsx */
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  userRole,
  trialDaysLeft,
  isTrial,
  accountActivated,
  setShowEarlyUpgrade,
  numberFormatter,
  timezone,
  academyTime,
  onSearchClick // دالة اختيارية يمكن تمريرها من المكون الأب لتشغيل البحث مباشرة
}) {
  const [isSlim, setIsSlim] = useState(() => localStorage.getItem('smart_halaqa_slim') === 'true');
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // 🌐 إصلاح اللغة: استخدام مفتاح تعريفي بدلاً من نص ثابت لضمان الترجمة الفورية عند قلب اللغة
  const [activeBranchKey, setActiveBranchKey] = useState('main');

  useEffect(() => {
    localStorage.setItem('smart_halaqa_slim', isSlim);
  }, [isSlim]);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';

  const handleTabChange = async (tabId) => {
    try {
      setActiveTab(tabId);
      if (isMobile) setSidebarOpen(false);
    } catch (error) {
      console.error("🚨 Chunk rendering exception captured. Hard refreshing pipeline...", error);
      window.location.reload();
    }
  };

  // نظام اختصارات الكيبورد (Ctrl + K أو الأرقام السريعة)
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

  // 🔍 إصلاح البحث: تشغيل دائم على الموبايل والكمبيوتر بحدث قياسي آمن وعالمي
  const handleSearchTrigger = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      // إرسال حدث مخصص يلتقطه مودال البحث في أي مكان بالتطبيق بسهولة
      const toggleEvent = new CustomEvent('toggle-command-palette');
      window.dispatchEvent(toggleEvent);
    }
  };

  const getSafeHijriDate = () => {
    try {
      if (isRtl) {
        return new Date().toLocaleDateString('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        day: 'numeric', month: 'numeric', year: 'numeric'
      }).formatToParts(new Date());
      const day = parts.find(p => p.type === 'day')?.value || '';
      const monthNum = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
      const year = parts.find(p => p.type === 'year')?.value || '';
      const hijriMonthsEn = [
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
        "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
        "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
      ];
      return `${hijriMonthsEn[monthNum - 1] || 'Muharram'} ${day}, ${year} AH`;
    } catch (e) {
      return isRtl ? "١٦ محرم ١٤٤٨ هـ" : "16 Muharram 1448 AH";
    }
  };

  const menuItems = [
    { id: 'dashboard', labelAr: 'لوحة المتابعة', labelEn: 'Overview', icon: <FaThLarge /> },
    { id: 'students', labelAr: 'الطلاب والمحفظون', labelEn: 'Students & Instructors', icon: <FaUserGraduate /> },
    { id: 'attendance', labelAr: 'الحلقات والتسميع', labelEn: 'Halaqat & Recitation', icon: <FaClipboardCheck /> },
    { 
      id: 'exams', 
      labelAr: 'الاختبارات والشهادات', 
      labelEn: 'Assessments & Degrees', 
      icon: <FaGraduationCap />,
      badge: isRtl ? "نشط" : "Live",
      badgeColor: '#10B981'
    },
    { id: 'reports', labelAr: 'حصاد الأداء', labelEn: 'Performance Analytics', icon: <FaChartBar /> },
    { 
      id: 'payments', 
      labelAr: 'المالية والاشتراكات', 
      labelEn: 'Financial Suite', 
      icon: <FaMoneyBillWave />,
      badge: "⚡",
      badgeColor: '#FBBF24'
    },
    { id: 'settings', labelAr: 'إعدادات الأكاديمية', labelEn: 'Academy Settings', icon: <FaCog /> },
  ];

  const filteredItems = isPlatformAdmin 
    ? menuItems.filter(item => item.id === 'dashboard' || item.id === 'settings')
    : menuItems;

  // 🗺️ قاموس ترجمة الفروع الديناميكي لحل مشكلة ثبات اللغة العربية
  const branchDictionary = {
    main: { ar: "الأكاديمية الرئيسية (الفرع العام)", en: "Main Academy (General Branch)" },
    boys: { ar: "حلقات البنين والمتميزين", en: "Boys & Premium Halaqas" },
    girls: { ar: "حلقات البنات والبراعم", en: "Girls & Kids Sections" }
  };

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
      top: 0, bottom: 0,
      left: isMobile ? (isRtl ? 'auto' : 0) : 'auto',
      right: isMobile ? (isRtl ? 0 : 'auto') : 'auto',
      zIndex: 1000,
      transform: isMobile ? (sidebarOpen ? 'translateX(0)' : `translateX(${isRtl ? '100%' : '-100%'})`) : 'none',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box',
      padding: isSlim && !isMobile ? '24px 10px' : '24px 16px',
      overflowX: 'visible',
      direction: isRtl ? 'rtl' : 'ltr'
    }}>
      
      {/* زر الطيّ السريع المطور */}
      {!isMobile && (
        <button 
          onClick={() => setIsSlim(!isSlim)}
          style={{
            position: 'absolute',
            top: '32px',
            left: isRtl ? '-13px' : 'auto',
            right: !isRtl ? '-13px' : 'auto',
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

      {/* الجزء العلوي: الهوية وشعار المصحف والحلقة التقني الفاخر الجديد */}
      <div style={{ position: 'relative', marginBottom: '20px', flexShrink: 0 }}>
        <div 
          onClick={() => !isPlatformAdmin && setShowWorkspaceDropdown(!showWorkspaceDropdown)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '8px',
            borderRadius: '12px',
            cursor: isPlatformAdmin ? 'default' : 'pointer',
            backgroundColor: showWorkspaceDropdown ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
            border: '1px solid',
            borderColor: showWorkspaceDropdown ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {/* حاوية الشعار الاحترافية الجديدة كلياً (قرآن كريم + حلقة دائرية مذهبة) */}
          <div style={{ 
            width: '42px', 
            height: '42px', 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            flexShrink: 0,
            position: 'relative'
          }}>
            {/* SVG شعار الهوية الإسلامية التقنية الواضح والفاخر */}
            <svg 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '85%', height: '85%' }}
            >
              <defs>
                <linearGradient id="quranGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE5A3" />
                  <stop offset="50%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* 1. الحلقة الخارجية (ترمز للحلقات والمتابعة الذكية) */}
              <circle cx="50" cy="50" r="40" stroke="url(#quranGold)" strokeWidth="3" strokeDasharray="4 3" opacity="0.4" />
              <circle cx="50" cy="50" r="34" stroke="url(#quranGold)" strokeWidth="1.5" opacity="0.2" />

              {/* 2. رسمة المصحف الشريف المفتوح / حامل السورة (واضحة وتعبر عن الهوية فورا) */}
              {/* الجانب الأيسر من المصحف */}
              <path 
                d="M50 68C40 64 26 65 18 69V35C26 31 40 30 50 35" 
                stroke="url(#quranGold)" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* الجانب الأيمن من المصحف */}
              <path 
                d="M50 68C60 64 74 65 82 69V35C74 31 60 30 50 35" 
                stroke="url(#quranGold)" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              
              {/* قاعدة حامل المصحف (الكرسي / المرفوع) */}
              <path 
                d="M32 67L45 77M68 67L55 77M50 35V68" 
                stroke="url(#quranGold)" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />

              {/* 3. النجم المضيء العلوي (يرمز للذكاء والريادة والهدوء) */}
              <path 
                d="M50 14L52 20L58 22L52 24L50 30L48 24L42 22L48 20Z" 
                fill="#FFF" 
                filter="url(#glowEffect)" 
              />
            </svg>

            <span style={{
              position: 'absolute', bottom: '-1px', right: isRtl ? '-1px' : 'auto', left: !isRtl ? '-1px' : 'auto',
              width: '9px', height: '9px', backgroundColor: '#10B981', borderRadius: '50%', border: '2px solid #111827'
            }}></span>
          </div>
          
          {!isSlim && (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h1 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
                </h1>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                  {isPlatformAdmin ? 'Platform Admin' : (isRtl ? branchDictionary[activeBranchKey].ar : branchDictionary[activeBranchKey].en)}
                </span>
              </div>
              {!isPlatformAdmin && (
                <FaChevronDown 
                  size={12} 
                  style={{ 
                    color: showWorkspaceDropdown ? '#FBBF24' : '#6B7280', 
                    transition: 'transform 0.25s ease', 
                    transform: showWorkspaceDropdown ? 'rotate(180deg)' : 'none' 
                  }} 
                />
              )}
            </div>
          )}
        </div>

        {/* منسدلة تبديل فروع الأكاديمية */}
        {showWorkspaceDropdown && (
          <div style={{
            position: 'absolute',
            top: isSlim && !isMobile ? '0' : '100%',
            left: isSlim && !isMobile ? (isRtl ? 'auto' : '82px') : '0',
            right: isSlim && !isMobile ? (isRtl ? '82px' : 'auto') : '0',
            width: isSlim && !isMobile ? '240px' : '100%',
            backgroundColor: '#1f2937',
            border: '1px solid #334155',
            borderRadius: '12px',
            marginTop: isSlim && !isMobile ? '0' : '8px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            zIndex: 1050, padding: '8px', backdropFilter: 'blur(8px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 10px 10px', borderBottom: '1px solid #334155', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 'bold' }}>
                {isRtl ? 'تبديل فرع الأكاديمية' : 'Academy Workspaces'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Object.keys(branchDictionary).map((key) => {
                const isSelected = activeBranchKey === key;
                return (
                  <div 
                    key={key}
                    onClick={() => {
                      setActiveBranchKey(key);
                      setShowWorkspaceDropdown(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                      color: isSelected ? '#FBBF24' : '#E2E8F0',
                      backgroundColor: isSelected ? 'rgba(251, 191, 36, 0.06)' : 'transparent',
                      borderLeft: !isRtl && isSelected ? '3px solid #FBBF24' : 'none',
                      borderRight: isRtl && isSelected ? '3px solid #FBBF24' : 'none',
                      borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                      fontWeight: isSelected ? '700' : '500', transition: 'all 0.15s ease'
                    }}
                  >
                    <FaExchangeAlt size={11} style={{ color: isSelected ? '#FBBF24' : '#6B7280', opacity: isSelected ? 1 : 0.4 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isRtl ? branchDictionary[key].ar : branchDictionary[key].en}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showWorkspaceDropdown && (
          <div onClick={() => setShowWorkspaceDropdown(false)} style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 1040 }} />
        )}
      </div>

      {/* حاوية المحتوى القابل للتمرير */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {/* التوقيت والمناطق الزمنية المباشرة */}
        {!isSlim && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 8px', marginBottom: '20px', opacity: 0.85 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' }}></span>
              <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontFamily: 'monospace' }}>
                {timezone?.split('/')[1] || 'UTC'} : {academyTime || '--:--'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF', paddingRight: isRtl ? '12px' : '0', paddingLeft: !isRtl ? '12px' : '0' }}>
              <span>📅 </span>
              {new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#FBBF24', fontWeight: '500', paddingRight: isRtl ? '12px' : '0', paddingLeft: !isRtl ? '12px' : '0' }}>
              <span>🌙 </span>
              {getSafeHijriDate()}
            </div>
          </div>
        )}

        {/* 🔍 تم الإصلاح: مشغل لوحة البحث السريع ليعمل بلمسة واحدة على الجوال والكمبيوتر دون كيبورد */}
        <div style={{ marginBottom: '22px', padding: '0 4px', flexShrink: 0 }}>
          <div 
            onClick={handleSearchTrigger}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <FaSearch size={13} style={{ color: '#FBBF24', flexShrink: 0 }} />
              {!isSlim && <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isRtl ? 'بحث سريع...' : 'Quick Command...'}</span>}
            </div>
            {!isSlim && (
              <kbd style={{
                background: '#0f172a', border: '1px solid #475569', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace'
              }}>{isMobile ? "Tap" : "Ctrl K"}</kbd>
            )}
          </div>
        </div>

        {/* كارت الفترة التجريبية */}
        {!isPlatformAdmin && (isTrial || !accountActivated) && (
          <div 
            onClick={() => setShowEarlyUpgrade(true)}
            style={{
              background: 'linear-gradient(145deg, rgba(217, 119, 6, 0.12) 0%, rgba(17, 24, 39, 0.95) 100%)',
              border: '1px solid rgba(217, 119, 6, 0.45)', borderRadius: '12px', padding: isSlim ? '10px 6px' : '14px', marginBottom: '24px',
              cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              display: 'flex', flexDirection: 'column', alignItems: isSlim ? 'center' : 'stretch', justifyContent: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyItems: isSlim ? 'center' : 'space-between', width: '100%', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isSlim ? '0' : '10px', minWidth: 0 }}>
                <FaClock style={{ color: '#FBBF24', fontSize: '1.05rem', flexShrink: 0 }} />
                {!isSlim && (
                  <span style={{ fontSize: '0.85rem', color: '#FBBF24', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isTrial 
                      ? (isRtl ? `متبقى ${numberFormatter.format(trialDaysLeft || 10)} أيام تجريبية` : `${numberFormatter.format(trialDaysLeft || 10)} Trial Days Left`)
                      : (isRtl ? 'تفعيل الأكاديمية' : 'Activate System')}
                  </span>
                )}
              </div>
            </div>
            {isTrial && !isSlim && (
              <div style={{ width: '100%', height: '4px', backgroundColor: '#1f2937', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, ((trialDaysLeft || 10) / 14) * 100)}%`, height: '100%', backgroundColor: '#FBBF24' }}></div>
              </div>
            )}
          </div>
        )}

        {/* أزرار التنقل الرئيسية */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {filteredItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const displayLabel = isRtl ? item.labelAr : item.labelEn;

            return (
              <div key={item.id} onMouseEnter={() => setHoveredItem(index)} onMouseLeave={() => setHoveredItem(null)} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleTabChange(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: isSlim && !isMobile ? 'center' : 'flex-start',
                    gap: isSlim && !isMobile ? '0' : '14px', width: '100%', padding: '12px 16px',
                    backgroundColor: isActive ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                    color: isActive ? '#FBBF24' : '#9CA3AF', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '0.92rem', fontWeight: isActive ? '700' : '500', transition: 'all 0.2s',
                    boxShadow: isActive ? (isRtl ? 'inset -4px 0px 0px #FBBF24' : 'inset 4px 0px 0px #FBBF24') : 'none'
                  }}
                >
                  <span style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', color: isActive ? '#FBBF24' : '#6B7280', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {(!isSlim || isMobile) && <span style={{ flex: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', textAlign: isRtl ? 'right' : 'left' }}>{displayLabel}</span>}
                  {item.badge && (!isSlim || isMobile) && (
                    <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '10px', backgroundColor: item.badgeColor, color: '#000', fontWeight: 'bold', flexShrink: 0 }}>
                      {item.badge}
                    </span>
                  )}
                </button>

                {isSlim && !isMobile && hoveredItem === index && (
                  <div style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    left: isRtl ? 'auto' : '85px', right: isRtl ? '85px' : 'auto',
                    backgroundColor: '#1f2937', color: '#FFF', padding: '6px 12px', borderRadius: '6px',
                    fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap', border: '1px solid #334155', zIndex: 2000
                  }}>
                    {displayLabel}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* تسجيل الخروج */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1f2937', flexShrink: 0 }}>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: isSlim && !isMobile ? 'center' : 'flex-start',
            gap: isSlim && !isMobile ? '0' : '14px', width: '100%', padding: '12px 16px',
            backgroundColor: 'transparent', color: '#EF4444', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.92rem', fontWeight: '600', transition: 'all 0.2s'
          }}
        >
          <FaSignOutAlt style={{ fontSize: '1.15rem', flexShrink: 0 }} />
          {(!isSlim || isMobile) && <span style={{ flex: 1, textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>}
        </button>
      </div>

    </aside>
  );
}
