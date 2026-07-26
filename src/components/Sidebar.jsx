/* src/components/Sidebar.jsx */
import React, { useState, useEffect } from "react";
import { formatHijriDate, formatGregorianDate } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';
import { 
  FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaChartBar, 
  FaUserGraduate, FaChalkboardTeacher, FaCheckCircle, 
  FaBookOpen, FaAward, FaCreditCard, FaSlidersH, 
  FaCloud, FaSignOutAlt, FaBolt, FaCalendarAlt, FaClock, FaInfinity,
  FaHistory, FaBell, FaHome, FaTrophy, FaFolder
} from "react-icons/fa";

// 🌟 شعار عالمي وفائق الاحترافية لمنظومة الحلقة الذكية
const SmartHalaqaProLogo = () => (
  <div style={{
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
    border: '1px solid rgba(45, 212, 191, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 4px 16px -2px rgba(15, 118, 110, 0.4)',
    flexShrink: 0
  }}>
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="cyanGrad" x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        <linearGradient id="emeraldGrad" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <circle cx="16" cy="16" r="13" stroke="url(#cyanGrad)" strokeWidth="0.9" strokeDasharray="4 2.5" opacity="0.45" />
      <circle cx="16" cy="16" r="11" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="46 14" />
      <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" 
            fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" 
            fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" strokeLinejoin="round" />
      <line x1="16" y1="12" x2="16" y2="21.5" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" />
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

  // 🔽 حالة الأكورديون (تحديد أي قسم مفتوح)
  const [openSections, setOpenSections] = useState({});

  // 🔄 تفعيل القسم الذي يحتوي التبويب النشط تلقائياً
  useEffect(() => {
    const activeSection = menuSections.find(sec => sec.items.some(item => item.id === activeTab));
    if (activeSection) {
      setOpenSections(prev => ({ ...prev, [activeSection.id]: true }));
    } else {
      setOpenSections({ ops: true, academic: true });
    }
  }, [activeTab]);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const currentLocale = isRtl ? 'ar' : 'en';
  const gregorian = formatGregorianDate(new Date(), currentLocale);
  const hijri = formatHijriDate(new Date(), currentLocale);

  // 🔄 جلب الأكاديميات
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
          style: { background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
        };
      }
      if (effectiveDaysLeft === Infinity) {
        return {
          text: isRtl ? 'حساب دائم ∞' : 'Lifetime ∞',
          style: { background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }
        };
      }
      if (effectiveDaysLeft > 14) {
        return {
          text: isRtl ? 'اشتراك نشط' : 'Active Plan',
          style: { background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }
        };
      }
      if (effectiveDaysLeft > 0) {
        return {
          text: isRtl ? 'فترة تجريبية' : 'Free Trial',
          style: { background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }
        };
      }
      return {
        text: isRtl ? 'منتهي الصلاحية' : 'Expired',
        style: { background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
      };
    }
    return {
      text: isRtl ? 'اشتراك نشط' : 'Active Plan',
      style: { background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }
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
    width: '290px',
    backgroundColor: '#0b1329',
    borderLeft: isRtl && !isMobile ? '1px solid #1e293b' : 'none',
    borderRight: !isRtl && !isMobile ? '1px solid #1e293b' : 'none',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: isMobile && !sidebarOpen 
      ? (isRtl ? 'translateX(100%)' : 'translateX(-100%)') 
      : 'translateX(0)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isMobile && sidebarOpen ? '0 0 30px rgba(0,0,0,0.8)' : 'none',
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
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 999
          }}
        />
      )}

      <aside style={sidebarStyles} dir={isRtl ? 'rtl' : 'ltr'}>
        <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
          
          {/* 🌟 1️⃣ اللوجو (مضغوط وعصري) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '12px', 
            paddingBottom: '10px', 
            borderBottom: '1px solid #1e293b' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SmartHalaqaProLogo />
              <div>
                <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: '#fff' }}>
                  {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
                </h2>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '500' }}>
                  {isRtl ? 'إدارة المقارئ والأكاديميات' : 'Quranic Academy Platform'}
                </span>
              </div>
            </div>

            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* 🔴 2️⃣ الأكاديمية الحالية + زر الترقية المضغوط */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.73rem', color: '#cbd5e1', fontWeight: '600' }}>
                {isRtl ? 'الأكاديمية' : 'Academy'}
              </span>
              <span style={{
                padding: '2px 7px',
                borderRadius: '5px',
                fontSize: '0.65rem',
                fontWeight: '700',
                ...statusBadge.style
              }}>
                {statusBadge.text}
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#131f37',
                  border: '1px solid #1e293b',
                  borderRadius: '7px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}
              >
                <span dir="auto" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentAcademyName}
                </span>
                <FaChevronDown style={{ fontSize: '0.7rem', color: '#94a3b8', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: '#131f37',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  zIndex: 50,
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
                        padding: '9px 12px',
                        border: 'none',
                        background: acc.id === currentAcademyId ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        color: acc.id === currentAcademyId ? '#60a5fa' : '#e2e8f0',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <span dir="auto">{acc.name}</span>
                      <input type="radio" checked={acc.id === currentAcademyId} readOnly style={{ accentColor: '#3b82f6' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 📅 3️⃣ الشريط الزمني المضغوط + زر الترقية السريع */}
          <div style={{
            background: '#131f37',
            padding: '8px 10px',
            borderRadius: '7px',
            marginBottom: '10px',
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#38bdf8' }}>
              <FaClock style={{ fontSize: '0.75rem' }} />
              <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{academyTime || '01:50 AM'}</span>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ color: '#cbd5e1' }}>{hijri}</span>
            </div>

            <button
              onClick={() => setShowEarlyUpgrade && setShowEarlyUpgrade(true)}
              title={isRtl ? 'ترقية الاشتراك' : 'Upgrade'}
              style={{
                padding: '3px 8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                fontSize: '0.68rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <FaBolt />
              <span>{isRtl ? 'ترقية' : 'Upgrade'}</span>
            </button>
          </div>

          {/* 🔍 4️⃣ شريط البحث */}
          <div style={{
            position: 'relative',
            marginBottom: '12px',
            background: '#131f37',
            borderRadius: '7px',
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px'
          }}>
            <FaSearch style={{ color: '#64748b', fontSize: '0.75rem' }} />
            <input 
              type="text"
              placeholder={isRtl ? 'بحث سريع...' : 'Quick search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.78rem'
              }}
            />
          </div>

          {/* 📑 5️⃣ القوائم والتبويبات بنظام الأكورديون (Accordion) */}
          <nav>
            {filteredMenuSections.length > 0 ? (
              filteredMenuSections.map((section) => {
                const isExpanded = openSections[section.id] || searchQuery.trim().length > 0;

                return (
                  <div key={section.id} style={{ marginBottom: '8px' }}>
                    {/* رأس القسم القابل للطي */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '6px',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginBottom: '4px'
                      }}
                    >
                      <span>{section.title}</span>
                      {isExpanded ? (
                        <FaChevronUp style={{ fontSize: '0.65rem' }} />
                      ) : (
                        <FaChevronDown style={{ fontSize: '0.65rem' }} />
                      )}
                    </button>

                    {/* عناصر القسم */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: isRtl ? '4px' : 0, paddingLeft: !isRtl ? '4px' : 0 }}>
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
                                gap: '10px',
                                padding: '8px 12px',
                                borderRadius: '7px',
                                border: 'none',
                                background: isActive ? '#f59e0b' : 'transparent',
                                color: isActive ? '#000' : '#d1d5db',
                                fontWeight: isActive ? 'bold' : 'normal',
                                cursor: 'pointer',
                                textAlign: isRtl ? 'right' : 'left',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Icon style={{ fontSize: '0.9rem', color: isActive ? '#000' : '#9ca3af' }} />
                              <span style={{ fontSize: '0.82rem' }}>{item.label}</span>
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
                padding: '16px 10px',
                color: '#64748b',
                fontSize: '0.78rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '6px',
                border: '1px solid #1e293b'
              }}>
                {isRtl ? 'لا توجد نتائج تطابق بحثك' : 'No matching results'}
              </div>
            )}
          </nav>
        </div>

        {/* 🔒 6️⃣ تسجيل الخروج */}
        <div style={{ padding: '12px', borderTop: '1px solid #1e293b', background: '#090f20' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.72rem', color: '#94a3b8' }}>
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
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '7px',
              color: '#f87171',
              fontWeight: 'bold',
              fontSize: '0.78rem',
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
