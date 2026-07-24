/* src/components/Sidebar.jsx */
import React, { useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import { 
  FaSearch, FaTimes, FaChevronDown, FaChartBar, 
  FaUserGrad, FaChalkboardTeacher, FaCheckCircle, 
  FaBookOpen, FaAward, FaCreditCard, FaSlidersH, 
  FaCloud, FaSignOutAlt, FaBolt 
} from "react-icons/fa";

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
  trialDaysLeft,
  isTrial,
  accountActivated,
  setShowEarlyUpgrade,
  numberFormatter,
  timezone,
  academyTime
}) {
  const [academiesList, setAcademiesList] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // جلب قائمة الأكاديميات المتاحة للمستخدم عند فتح السايدبار
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
          const list = staffData
            .map(s => s.academies)
            .filter(Boolean);
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

  // 1️⃣ توحيد اتساق شارة الحالة الموحدة اللغوية
  const getStatusBadgeText = () => {
    if (isTrial) {
      return isRtl ? 'مجاني (معلق)' : 'FREE (Pending)';
    }
    return accountActivated 
      ? (isRtl ? 'نشط' : 'Active') 
      : (isRtl ? 'غير مدفوع' : 'Unpaid');
  };

  // قائمة عناصر التنقل الرئيسية
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
        { id: 'students', label: isRtl ? 'إدارة الدارسين' : 'Learner Directory', icon: FaUserGrad },
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

  // تنسيقات الهيكل العام للسايدبار
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
      {/* خلفية معتمة عند الفتح على الموبايل */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 999
          }}
        />
      )}

      <aside style={sidebarStyles} dir={isRtl ? 'rtl' : 'ltr'}>
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          
          {/* 🔴 رأس القائمة الجانبية ومبدل الأكاديميات */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 'bold' }}>
                {isRtl ? 'الأكاديمية الحالية' : 'Current Academy'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  background: 'rgba(217, 119, 6, 0.2)',
                  color: '#f59e0b',
                  border: '1px solid rgba(217, 119, 6, 0.4)'
                }}>
                  {getStatusBadgeText()}
                </span>
                {isMobile && (
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* قائمة الاختيار المنسدلة للأكاديمية */}
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
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                {/* 5️⃣ إضافة dir="auto" للأسماء الديناميكية */}
                <span dir="auto" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentAcademyName}
                </span>
                <FaChevronDown style={{ fontSize: '0.75rem', color: '#94a3b8', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>

              {/* 3️⃣ نافذة اختيار الأكاديميات المنبثقة (Bottom Sheet على الموبايل) */}
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

          {/* 🕒 توقيت المؤسسة */}
          {academyTime && (
            <div style={{
              background: '#131f37',
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#38bdf8'
            }}>
              <span>{isRtl ? 'ساعة الأكاديمية:' : 'Academy Clock:'}</span>
              <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{academyTime}</span>
            </div>
          )}

          {/* 🔍 شريط البحث الذكي بدون Ctrl K على الجوال */}
          <div style={{
            position: 'relative',
            marginBottom: '16px',
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
            {/* 2️⃣ إخفاء شارة Ctrl K على الموبايل */}
            {!isMobile && (
              <span style={{
                background: '#1e293b',
                color: '#94a3b8',
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #334155'
              }}>
                Ctrl K
              </span>
            )}
          </div>

          {/* ⚡ 4️⃣ شريط الصلاحية وإعادة الاشتراك */}
          <div style={{
            padding: '10px 12px',
            background: '#131f37',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {isRtl ? 'صلاحية النظام:' : 'Validity:'}
            </span>
            {trialDaysLeft <= 0 ? (
              <button
                onClick={() => setShowEarlyUpgrade && setShowEarlyUpgrade(true)}
                style={{
                  padding: '6px 12px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <FaBolt />
                <span>{isRtl ? 'تجديد الاشتراك ⚡' : 'Confirm Payment ⚡'}</span>
              </button>
            ) : (
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: trialDaysLeft < 5 ? '#ef4444' : '#10b981' }}>
                {trialDaysLeft} {isRtl ? 'أيام متبقية' : 'Days left'}
              </span>
            )}
          </div>

          {/* 📑 قائمة التبويبات والأقسام */}
          <nav>
            {menuSections.map((section, idx) => (
              <div key={idx} style={{ marginBottom: '18px' }}>
                {/* 6️⃣ رفع تباين عناوين الأقسام الفرعية */}
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

        {/* 🔒 أسفل السايدبار - حالة المزامنة وتسجيل الخروج */}
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
