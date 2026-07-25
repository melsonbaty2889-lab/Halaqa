/* src/components/Sidebar.jsx */
import React, { useState, useEffect } from "react";
import { formatHijriDate, formatGregorianDate } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';
import { 
  FaSearch, FaTimes, FaChevronDown, FaChartBar, 
  FaUserGraduate, FaChalkboardTeacher, FaCheckCircle, 
  FaBookOpen, FaAward, FaCreditCard, FaSlidersH, 
  FaCloud, FaSignOutAlt, FaBolt, FaCalendarAlt, FaClock
} from "react-icons/fa";

// 🌟 شعار عالمي وفائق الاحترافية لمنظومة الحلقة الذكية
const SmartHalaqaProLogo = () => (
  <div style={{
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
    border: '1px solid rgba(45, 212, 191, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 8px 24px -4px rgba(15, 118, 110, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
    flexShrink: 0
  }}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* تدرج الذهب الملكي */}
        <linearGradient id="goldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* تدرج التكنولوجيا والذكاء */}
        <linearGradient id="cyanGrad" x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        {/* تدرج الزمرد القرآني */}
        <linearGradient id="emeraldGrad" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* فلتر التوهج المضيء */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. هالة الربط السحابي والذكاء */}
      <circle cx="16" cy="16" r="13" stroke="url(#cyanGrad)" strokeWidth="0.9" strokeDasharray="4 2.5" opacity="0.45" />

      {/* 2. حلقة العلم والترابط الذهبية */}
      <circle cx="16" cy="16" r="11" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="46 14" />

      {/* 3. المصحف الهندسي العائم */}
      <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" 
            fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" strokeLinejoin="round" />
      
      <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" 
            fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" strokeLinejoin="round" />

      {/* عمود المصحف المضيء */}
      <line x1="16" y1="12" x2="16" y2="21.5" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" />

      {/* 4. نجمة الذكاء والابتكار التكنولوجي (Smart Sparkle) */}
      <path d="M16 3.2 L16.8 5 L18.6 5.8 L16.8 6.6 L16 8.4 L15.2 6.6 L13.4 5.8 L15.2 5 Z" 
            fill="#38bdf8" filter="url(#glow)" />
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

  // ✅ البديل المباشر المربوط بـ dateUtils.js
const currentLocale = isRtl ? 'ar' : 'en';
const gregorian = formatGregorianDate(new Date(), currentLocale);
const hijri = formatHijriDate(new Date(), currentLocale);

  // جلب الأكاديميات
  useEffect(() => {
    async function loadAcademies() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: staffData } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name)')
          .eq('user_id', user.id);

        if (staffData && staffData.length > 0) {
          const list = staffData.map(s => s.academies).filter(Boolean);
          setAcademiesList(list);
        }
      } catch (err) {
        console.error("Error loading user academies:", err);
      }
    }
    loadAcademies();
  }, []);

  const currentAcademy = academiesList.find(a => a.id === currentAcademyId);
  const currentAcademyName = currentAcademy?.name || (isRtl ? 'الأكاديمية الرئيسية' : 'Primary Academy');

  // نص وتنسيق الحالة الاحترافي
  const getStatusBadge = () => {
    if (isTrial) {
      return {
        text: isRtl ? 'فترة تجريبية' : 'Free Trial',
        style: { background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }
      };
    }
    if (accountActivated) {
      return {
        text: isRtl ? 'اشتراك نشط' : 'Active Plan',
        style: { background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }
      };
    }
    return {
      text: isRtl ? 'قيد التفعيل' : 'Pending',
      style: { background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
    };
  };

  const statusBadge = getStatusBadge();

  const menuSections = [
    {
      title: isRtl ? '1. مركز القيادة والعمليات' : '1. Operations Hub',
      items: [
        { id: 'dashboard', label: isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Performance', icon: FaChartBar },
        { id: 'reports', label: isRtl ? 'التقارير والتحليلات' : 'Reports & Analytics', icon: FaChartBar }
      ]
    },
    {
      title: isRtl ? '2. الشؤون القرآنية والأكاديمية' : '2. Academic Core',
      items: [
        { id: 'students', label: isRtl ? 'إدارة الدارسين' : 'Learner Directory', icon: FaUserGraduate },
        { id: 'halaqas', label: isRtl ? 'المقارئ والحلقات' : 'Halaqas & Sanad', icon: FaChalkboardTeacher },
        { id: 'attendance', label: isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation', icon: FaCheckCircle },
        { id: 'teachers', label: isRtl ? 'الكادر والمقرئين' : 'Faculty & Reciters', icon: FaBookOpen },
        { id: 'exams', label: isRtl ? 'الاختبارات والتقييم' : 'Exams & Diplomas', icon: FaAward }
      ]
    },
    {
      title: isRtl ? '3. الحوكمة والمالية' : '3. Governance & Treasury',
      items: [
        { id: 'payments', label: isRtl ? 'الاشتراكات والتحصيل' : 'Billing & Payments', icon: FaCreditCard },
        { id: 'settings', label: isRtl ? 'إعدادات المنظومة' : 'Platform Governance', icon: FaSlidersH }
      ]
    }
  ];

  const sidebarStyles = {
    position: isMobile ? 'fixed' : 'relative',
    top: 0,
    bottom: 0,
    [isRtl ? 'right' : 'left']: 0,
    width: '300px',
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
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          
          {/* 🌟 1️⃣ اللوجو الفاخر + رأس المنظومة */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '18px', 
            paddingBottom: '14px', 
            borderBottom: '1px solid #1e293b' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SmartHalaqaProLogo />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#fff', letterSpacing: '0.2px' }}>
                  {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
                </h2>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500' }}>
                  {isRtl ? 'إدارة المقارئ والأكاديميات' : 'Quranic Academy Platform'}
                </span>
              </div>
            </div>

            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            )}
          </div>

  
                    {/* 🔴 2️⃣ الأكاديمية الحالية وشارة الحالة الاحترافية */}
<div style={{ marginBottom: '16px' }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
    <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '600' }}>
      {isRtl ? 'الأكاديمية الحالية' : 'Current Academy'}
    </span>
    <span style={{
      padding: '3px 9px',
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: '700',
      letterSpacing: '0.2px',
      ...statusBadge.style
    }}>
      {statusBadge.text}
    </span>
  </div>

  {/* القائمة المنسدلة للأكاديميات */}
  <div style={{ position: 'relative' }}>
    <button
      onClick={() => setDropdownOpen(!dropdownOpen)}
      style={{
        width: '100%',
        padding: '10px 14px',
        background: '#131f37',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        fontSize: '0.88rem',
        fontWeight: '600'
      }}
    >
      <span dir="auto" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {currentAcademyName}
      </span>
      <FaChevronDown style={{ fontSize: '0.75rem', color: '#94a3b8', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
    </button>

    {dropdownOpen && (
      isMobile ? (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setDropdownOpen(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#1e293b',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '20px',
              borderTop: '1px solid #334155',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc', fontWeight: 'bold' }}>
                {isRtl ? 'اختر الأكاديمية' : 'Select Academy'}
              </h3>
              <button 
                onClick={() => setDropdownOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh', overflowY: 'auto' }}>
              {academiesList.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => {
                    if (onSwitchAcademy) onSwitchAcademy(acc.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: acc.id === currentAcademyId ? '1px solid #3b82f6' : '1px solid #334155',
                    background: acc.id === currentAcademyId ? 'rgba(59, 130, 246, 0.15)' : '#0f172a',
                    color: acc.id === currentAcademyId ? '#60a5fa' : '#e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <span dir="auto" style={{ fontWeight: acc.id === currentAcademyId ? 'bold' : 'normal' }}>
                    {acc.name}
                  </span>
                  <input type="radio" checked={acc.id === currentAcademyId} readOnly style={{ accentColor: '#3b82f6' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
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
                padding: '10px 14px',
                border: 'none',
                background: acc.id === currentAcademyId ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: acc.id === currentAcademyId ? '#60a5fa' : '#e2e8f0',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <span dir="auto">{acc.name}</span>
              <input type="radio" checked={acc.id === currentAcademyId} readOnly style={{ accentColor: '#3b82f6' }} />
            </button>
          ))}
        </div>
      )
    )}
  </div>
</div>

{/* 📅 3️⃣ الساعة والتواريخ المنسقة بوضوح (مرتبطة بـ dateUtils.js) */}
<div style={{
  background: '#131f37',
  padding: '10px 12px',
  borderRadius: '8px',
  marginBottom: '14px',
  border: '1px solid #1e293b',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
}}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#38bdf8' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <FaClock style={{ fontSize: '0.8rem' }} />
      <span>{isRtl ? 'ساعة الأكاديمية:' : 'Academy Clock:'}</span>
    </div>
    <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{academyTime || '06:33 PM'}</span>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <FaCalendarAlt style={{ color: '#f59e0b', fontSize: '0.75rem' }} />
      <span>{gregorian}</span>
    </div>
    <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{hijri}</span>
  </div>
</div>

          {/* 🔍 4️⃣ شريط البحث */}
          <div style={{
            position: 'relative',
            marginBottom: '14px',
            background: '#131f37',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px'
          }}>
            <FaSearch style={{ color: '#64748b', fontSize: '0.85rem' }} />
            <input 
              type="text"
              placeholder={isRtl ? 'ابحث عن طلاب، حلقات...' : 'Search students, halaqas...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.8rem'
              }}
            />
          </div>

          {/* ⚡ 5️⃣ صلاحية النظام وترقية الاشتراك */}
          <div style={{
            padding: '12px',
            background: 'linear-gradient(180deg, #131f37 0%, #0f172a 100%)',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {isRtl ? 'صلاحية النظام:' : 'Validity:'}
              </span>
              <span style={{ 
                fontSize: '0.82rem', 
                fontWeight: 'bold', 
                color: Number(trialDaysLeft) <= 3 ? '#ef4444' : '#10b981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {`${trialDaysLeft ?? 0} ${isRtl ? 'أيام متبقية' : 'Days left'}`}
              </span>
            </div>

            <button
              onClick={() => setShowEarlyUpgrade && setShowEarlyUpgrade(true)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.2)'
              }}
            >
              <FaBolt />
              <span>{isRtl ? 'ترقية / تجديد الاشتراك ⚡' : 'Upgrade Account ⚡'}</span>
            </button>
          </div>

          {/* 📑 6️⃣ القوائم والتبويبات */}
          <nav>
            {menuSections.map((section, idx) => (
              <div key={idx} style={{ marginBottom: '18px' }}>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  letterSpacing: '0.03em',
                  marginBottom: '8px',
                  paddingLeft: isRtl ? 0 : '6px',
                  paddingRight: isRtl ? '6px' : 0
                }}>
                  {section.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isActive ? '#f59e0b' : 'transparent',
                          color: isActive ? '#000' : '#d1d5db',
                          fontWeight: isActive ? 'bold' : 'normal',
                          cursor: 'pointer',
                          textAlign: isRtl ? 'right' : 'left',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <Icon style={{ fontSize: '1rem', color: isActive ? '#000' : '#9ca3af' }} />
                        <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* 🔒 7️⃣ تسجيل الخروج */}
        <div style={{ padding: '16px', borderTop: '1px solid #1e293b', background: '#090f20' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.78rem', color: '#94a3b8' }}>
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
              gap: '8px',
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontWeight: 'bold',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <FaSignOutAlt />
            <span>{isRtl ? 'إنهاء الجلسة وتسجيل الخروج' : 'End Session & Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
