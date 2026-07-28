/* src/components/Sidebar.jsx */
import React, { useState, useEffect } from "react";
import { formatHijriDate, formatGregorianDate } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';
import { 
  FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaChartBar, 
  FaUserGraduate, FaChalkboardTeacher, FaCheckCircle, 
  FaBookOpen, FaAward, FaCreditCard, FaSlidersH, 
  FaCloud, FaSignOutAlt, FaBolt, FaClock,
  FaHistory, FaBell, FaHome, FaTrophy, FaFolder
} from "react-icons/fa";

// 🌟 شعار المنظومة الاحترافي
const SmartHalaqaProLogo = () => (
  <div style={{
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
    border: '1px solid rgba(45, 212, 191, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
    flexShrink: 0
  }}>
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="12" stroke="url(#goldGrad)" strokeWidth="1.8" strokeDasharray="40 12" />
      <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
      <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
    </svg>
  </div>
);

export default function Sidebar({
  currentAcademyId,
  onSwitchAcademy,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  isRtl,
  t,
  userRole,
  trialDaysLeft = 0,
  isTrial = false,
  accountActivated = false,
  setShowEarlyUpgrade,
  numberFormatter,
  timezone,
  academyTime
}) {
  const [academiesList, setAcademiesList] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const menuSections = [
    {
      id: 'ops',
      title: isRtl ? '1. مركز القيادة والعمليات' : '1. Operations Hub',
      items: [
        { id: 'dashboard', label: isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Performance', icon: FaChartBar },
        { id: 'realtime-audit', label: isRtl ? 'السجل الحي للأنشطة' : 'Realtime Audit Trail', icon: FaHistory },
        { id: 'omnichannel-hub', label: isRtl ? 'مركز التنبيهات الموحد' : 'Omnichannel Hub', icon: FaBell },
        { id: 'reports', label: isRtl ? 'التقارير والتحليلات' : 'Reports & Analytics', icon: FaChartBar }
      ]
    },
    {
      id: 'academic',
      title: isRtl ? '2. الشؤون القرآنية والأكاديمية' : '2. Academic Core',
      items: [
        { id: 'students', label: isRtl ? 'إدارة الدارسين' : 'Learner Directory', icon: FaUserGraduate },
        { id: 'teachers', label: isRtl ? 'الكادر والمقرئين' : 'Faculty & Reciters', icon: FaChalkboardTeacher },
        { id: 'halaqas', label: isRtl ? 'المقارئ والحلقات' : 'Halaqas & Sanad', icon: FaBookOpen },
        { id: 'attendance', label: isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation', icon: FaCheckCircle },
        { id: 'exams', label: isRtl ? 'الاختبارات والتقييم' : 'Exams & Diplomas', icon: FaAward }
      ]
    },
    {
      id: 'community',
      title: isRtl ? '3. تفاعل الدارسين والأسر' : '3. Engagement & Community',
      items: [
        { id: 'guardian-portal', label: isRtl ? 'شبكة أسر الدارسين' : 'Guardian Portal', icon: FaHome },
        { id: 'gamification-streaks', label: isRtl ? 'الإنجاز والحوافز' : 'Gamification & Streaks', icon: FaTrophy }
      ]
    },
    {
      id: 'governance',
      title: isRtl ? '4. الحوكمة والمالية' : '4. Governance & Treasury',
      items: [
        { id: 'payments', label: isRtl ? 'الاشتراكات والتحصيل' : 'Billing & Payments', icon: FaCreditCard },
        { id: 'asset-management', label: isRtl ? 'المستندات والأصول' : 'Asset Management', icon: FaFolder },
        { id: 'referrals', label: isRtl ? 'برنامج الإحالة والأرباح' : 'Affiliate & Rewards', icon: FaBolt },
        { id: 'settings', label: isRtl ? 'إعدادات المنظومة' : 'Platform Governance', icon: FaSlidersH }
      ]
    }
  ];

  // 🎯 الأكورديون الأحادي: يسمح بقسم واحد مفتوح فقط في نفس الوقت
  const [openSectionId, setOpenSectionId] = useState(null);

  // 🔄 فتح القسم المتعلق بالتبويب النشط تلقائياً
  useEffect(() => {
    const activeSection = menuSections.find(sec => sec.items.some(item => item.id === activeTab));
    if (activeSection) {
      setOpenSectionId(activeSection.id);
    } else {
      setOpenSectionId('ops');
    }
  }, [activeTab]);

  const toggleSection = (sectionId) => {
    setOpenSectionId(prev => (prev === sectionId ? null : sectionId));
  };

  const currentLocale = isRtl ? 'ar' : 'en';
  const hijri = formatHijriDate(new Date(), currentLocale);

  const loadAcademies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffData } = await supabase
        .from('staff')
        .select('academy_id, academies(id, name, trial_ends_at, is_active)')
        .eq('user_id', user.id);

      if (staffData && staffData.length > 0) {
        const list = staffData.map(s => s.academies).filter(Boolean);
        setAcademiesList(list);
      }
    } catch (err) {
      console.error("Error loading user academies:", err);
    }
  };

  useEffect(() => {
    loadAcademies();

    const channel = supabase
      .channel('sidebar-academy-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'academies' }, () => {
        loadAcademies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentAcademyId]);

  const currentAcademy = academiesList.find(a => a.id === currentAcademyId) || academiesList[0];
  const currentAcademyName = currentAcademy?.name || (isRtl ? 'الأكاديمية الرئيسية' : 'Primary Academy');

  const calculateEffectiveDaysLeft = () => {
    if (!currentAcademy) return trialDaysLeft ?? 0;
    if (currentAcademy.is_active && !currentAcademy.trial_ends_at) return Infinity;

    if (currentAcademy.trial_ends_at) {
      const endDate = new Date(currentAcademy.trial_ends_at);
      if (isNaN(endDate.getTime())) return trialDaysLeft ?? 0;

      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 3650) return Infinity;
      return diffDays > 0 ? diffDays : 0;
    }

    return trialDaysLeft ?? 0;
  };

  const effectiveDaysLeft = calculateEffectiveDaysLeft();

  const getStatusBadge = () => {
    if (currentAcademy) {
      if (currentAcademy.is_active === false) {
        return {
          text: isRtl ? 'قيد التفعيل' : 'Pending',
          style: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
        };
      }
      if (effectiveDaysLeft === Infinity) {
        return {
          text: isRtl ? 'حساب دائم ∞' : 'Lifetime ∞',
          style: { background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.35)' }
        };
      }
      if (effectiveDaysLeft > 14) {
        return {
          text: isRtl ? 'اشتراك نشط' : 'Active Plan',
          style: { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }
        };
      }
      if (effectiveDaysLeft > 0) {
        return {
          text: isRtl ? 'فترة تجريبية' : 'Free Trial',
          style: { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }
        };
      }
      return {
        text: isRtl ? 'منتهي الصلاحية' : 'Expired',
        style: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
      };
    }
    return {
      text: isRtl ? 'اشتراك نشط' : 'Active Plan',
      style: { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }
    };
  };

  const statusBadge = getStatusBadge();

  const normalizeArabic = (text) => {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  };

  const filteredMenuSections = menuSections.map(section => {
    const filteredItems = section.items.filter(item =>
      normalizeArabic(item.label).includes(normalizeArabic(searchQuery.trim()))
    );
    return { ...section, items: filteredItems };
  }).filter(section => section.items.length > 0);

  const sidebarStyles = {
    position: isMobile ? 'fixed' : 'relative',
    top: 0,
    bottom: 0,
    [isRtl ? 'right' : 'left']: 0,
    width: isMobile ? 'min(300px, 84vw)' : '280px',
    backgroundColor: '#0b1329',
    borderLeft: isRtl && !isMobile ? '1px solid #1e293b' : 'none',
    borderRight: !isRtl && !isMobile ? '1px solid #1e293b' : 'none',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: isMobile && !sidebarOpen 
      ? (isRtl ? 'translateX(100%)' : 'translateX(-100%)') 
      : 'translateX(0)',
    transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isMobile && sidebarOpen ? '0 0 35px rgba(0,0,0,0.85)' : 'none',
    boxSizing: 'border-box',
    userSelect: 'none'
  };

  return (
    <>
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      <aside style={sidebarStyles} dir={isRtl ? 'rtl' : 'ltr'}>
        <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          
          {/* 🌟 1️⃣ اللوجو مع اسم المنظومة */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '10px', 
            paddingBottom: '8px', 
            borderBottom: '1px solid #1e293b' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SmartHalaqaProLogo />
              <div>
                <h2 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#fff', lineHeight: '1.2' }}>
                  {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
                </h2>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '500' }}>
                  {isRtl ? 'إدارة المقارئ والأكاديميات' : 'Quranic Academy Platform'}
                </span>
              </div>
            </div>

            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1rem', cursor: 'pointer', padding: '4px' }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* 🔴 2️⃣ اختيار الأكاديمية مع شارة الحساب */}
          <div style={{ marginBottom: '8px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: '600' }}>
                {isRtl ? 'الأكاديمية' : 'Academy'}
              </span>
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.62rem',
                fontWeight: '700',
                ...statusBadge.style
              }}>
                {statusBadge.text}
              </span>
            </div>

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '100%',
                padding: '7px 10px',
                background: '#131f37',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}
            >
              <span dir="auto" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentAcademyName}
              </span>
              <FaChevronDown style={{ fontSize: '0.65rem', color: '#94a3b8', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {/* القائمة المنسدلة بظلال وحدود واضحة لحل مشكلة التداخل */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: '#0f172a',
                borderRadius: '7px',
                border: '1px solid #334155',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.75)',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                {academiesList.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      if (onSwitchAcademy) onSwitchAcademy(acc.id);
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      border: 'none',
                      background: acc.id === currentAcademyId ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      color: acc.id === currentAcademyId ? '#60a5fa' : '#e2e8f0',
                      cursor: 'pointer',
                      fontSize: '0.78rem'
                    }}
                  >
                    <span dir="auto">{acc.name}</span>
                    <input type="radio" checked={acc.id === currentAcademyId} readOnly style={{ accentColor: '#3b82f6' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 📅 3️⃣ الوقت والتقويم والترقية */}
          <div style={{
            background: '#131f37',
            padding: '7px 10px',
            borderRadius: '6px',
            marginBottom: '10px',
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px'
          }}>
            {/* 1️⃣ جهة البداية: أيقونة الساعة + الوقت */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              flexShrink: 0
            }}>
              <FaClock style={{ fontSize: '0.8rem', color: '#38bdf8' }} />
              <span>{academyTime || '12:24 PM'}</span>
            </div>

            {/* 2️⃣ المنتصف: التاريخ الميلادي والتاريخ الهجري أسفل بعضهما مباشرة */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              minWidth: 0
            }}>
              {/* التاريخ الميلادي */}
              <span style={{
                fontSize: '0.64rem',
                color: '#38bdf8',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                lineHeight: '1.2'
              }}>
                {new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>

              {/* التاريخ الهجري */}
              <span style={{
                fontSize: '0.62rem',
                color: '#38bdf8',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                lineHeight: '1.2'
              }}>
                {hijri}
              </span>
            </div>

            {/* 3️⃣ جهة النهاية: زر الترقية */}
            <button
              onClick={() => setShowEarlyUpgrade && setShowEarlyUpgrade(true)}
              style={{
                padding: '5px 8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                fontSize: '0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(245, 158, 11, 0.15)'
              }}
            >
              <FaBolt style={{ fontSize: '0.65rem' }} />
              <span>{isRtl ? 'ترقية' : 'Upgrade'}</span>
            </button>
          </div>
          
          {/* 🔍 4️⃣ شريط البحث */}
          <div style={{
            position: 'relative',
            marginBottom: '10px',
            background: '#131f37',
            borderRadius: '6px',
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px'
          }}>
            <FaSearch style={{ color: '#64748b', fontSize: '0.7rem' }} />
            <input 
              type="text"
              placeholder={isRtl ? 'بحث سريع...' : 'Quick search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 6px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.75rem'
              }}
            />
          </div>

          {/* 📑 5️⃣ القوائم بنظام الأكورديون الأحادي (Single Accordion) */}
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flex: 1
          }}>
            {filteredMenuSections.length > 0 ? (
              filteredMenuSections.map((section) => {
                const isExpanded = searchQuery.trim().length > 0 || openSectionId === section.id;

                return (
                  <div key={section.id} style={{ marginBottom: '6px' }}>
                    {/* رأس القسم القابل للطي */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        background: isExpanded ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '5px',
                        border: 'none',
                        color: isExpanded ? '#38bdf8' : '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: '0.15s ease'
                      }}
                    >
                      <span>{section.title}</span>
                      {isExpanded ? (
                        <FaChevronUp style={{ fontSize: '0.6rem' }} />
                      ) : (
                        <FaChevronDown style={{ fontSize: '0.6rem' }} />
                      )}
                    </button>

                    {/* عناصر القسم */}
                    {isExpanded && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        marginTop: '3px',
                        paddingRight: isRtl ? '6px' : 0,
                        paddingLeft: !isRtl ? '6px' : 0
                      }}>
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                if (isMobile) setSidebarOpen(false);
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '7px 10px',
                                borderRadius: '5px',
                                border: 'none',
                                background: isActive 
                                  ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.08) 100%)' 
                                  : 'transparent',
                                borderRight: isActive && isRtl ? '3px solid #f59e0b' : 'none',
                                borderLeft: isActive && !isRtl ? '3px solid #f59e0b' : 'none',
                                color: isActive ? '#fbbf24' : '#cbd5e1',
                                fontWeight: isActive ? '700' : 'normal',
                                cursor: 'pointer',
                                textAlign: isRtl ? 'right' : 'left',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Icon style={{ fontSize: '0.82rem', color: isActive ? '#f59e0b' : '#64748b' }} />
                              <span style={{ fontSize: '0.78rem' }}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '12px 8px',
                color: '#64748b',
                fontSize: '0.75rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '5px',
                border: '1px solid #1e293b'
              }}>
                {isRtl ? 'لا توجد نتائج تطابق بحثك' : 'No matching results'}
              </div>
            )}
          </nav>
        </div>

        {/* 🔒 6️⃣ إنهاء الجلسة وتأكيد الخروج */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #1e293b', background: '#080d1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', fontSize: '0.68rem', color: '#64748b' }}>
            <FaCloud style={{ color: '#10b981' }} />
            <span>{isRtl ? 'ربط سحابي متزامن' : 'Cloud Synchronized'}</span>
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              color: '#f87171',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <FaSignOutAlt />
            <span>{isRtl ? 'إنهاء الجلسة وتأكيد الخروج' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
