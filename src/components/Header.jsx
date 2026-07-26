import React, { useState, useEffect } from 'react';
import { 
  FaBars, 
  FaMoneyBillWave, 
  FaWhatsapp, 
  FaGlobe, 
  FaSearch, 
  FaBell, 
  FaChevronLeft, 
  FaChevronRight 
} from "react-icons/fa";

export default function Header({ 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile, 
  isRtl, 
  currency, 
  countryCode, 
  i18n,
  activeTab,
  onOpenSearchModal, // اختياري: لفتح نافذة البحث الشامل
  unreadNotificationsCount = 3 // عدد التنبيهات غير المقروءة
}) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isExtraSmall = windowWidth < 480;

  // 🎯 شجرة المسارات والعناوين المطابقة للأقسام الأربعة في القائمة الجانبية
  const menuHierarchy = {
    // 1️⃣ مركز القيادة والعمليات
    dashboard: { section: { ar: 'العمليات', en: 'Ops' }, title: { ar: 'لوحة التحكم والأداء', en: 'Dashboard & Performance' } },
    'realtime-audit': { section: { ar: 'العمليات', en: 'Ops' }, title: { ar: 'السجل الحي للأنشطة', en: 'Realtime Audit Trail' } },
    'omnichannel-hub': { section: { ar: 'العمليات', en: 'Ops' }, title: { ar: 'مركز التنبيهات الموحد', en: 'Omnichannel Hub' } },
    reports: { section: { ar: 'العمليات', en: 'Ops' }, title: { ar: 'التقارير والتحليلات', en: 'Reports & Analytics' } },

    // 2️⃣ الشؤون القرآنية والأكاديمية
    students: { section: { ar: 'الشؤون القرآنية', en: 'Academic' }, title: { ar: 'إدارة الدارسين', en: 'Learner Directory' } },
    teachers: { section: { ar: 'الشؤون القرآنية', en: 'Academic' }, title: { ar: 'الكادر والمقرئين', en: 'Faculty & Reciters' } },
    halaqas: { section: { ar: 'الشؤون القرآنية', en: 'Academic' }, title: { ar: 'المقارئ والحلقات', en: 'Halaqas & Sanad' } },
    attendance: { section: { ar: 'الشؤون القرآنية', en: 'Academic' }, title: { ar: 'التسميع والتحضير اليومي', en: 'Daily Recitation' } },
    exams: { section: { ar: 'الشؤون القرآنية', en: 'Academic' }, title: { ar: 'الاختبارات والتقييم', en: 'Exams & Diplomas' } },

    // 3️⃣ تفاعل الدارسين والأسر
    'guardian-portal': { section: { ar: 'تفاعل الدارسين', en: 'Community' }, title: { ar: 'شبكة أسر الدارسين', en: 'Guardian Portal' } },
    'gamification-streaks': { section: { ar: 'تفاعل الدارسين', en: 'Community' }, title: { ar: 'الإنجاز والحوافز', en: 'Gamification & Streaks' } },

    // 4️⃣ الحوكمة والمالية
    payments: { section: { ar: 'الحوكمة والمالية', en: 'Governance' }, title: { ar: 'الاشتراكات والتحصيل', en: 'Billing & Payments' } },
    'asset-management': { section: { ar: 'الحوكمة والمالية', en: 'Governance' }, title: { ar: 'المستندات والأصول', en: 'Asset Management' } },
    referrals: { section: { ar: 'الحوكمة والمالية', en: 'Governance' }, title: { ar: 'برنامج الإحالة والأرباح', en: 'Affiliate & Rewards' } },
    settings: { section: { ar: 'الحوكمة والمالية', en: 'Governance' }, title: { ar: 'إعدادات المنظومة', en: 'Platform Governance' } }
  };

  const currentRoute = menuHierarchy[activeTab] || { 
    section: { ar: 'الرئيسية', en: 'Main' }, 
    title: { ar: 'بوابة الإدارة', en: 'Management Portal' } 
  };

  return (
    <header 
      style={{
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        width: '100%',
        backgroundColor: '#0b1329',
        borderBottom: '1px solid #1e293b',
        padding: isMobile ? '0 10px' : '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        direction: isRtl ? 'rtl' : 'ltr',
        boxSizing: 'border-box',
        userSelect: 'none'
      }}
    >
      
      {/* 📑 1️⃣ الجانب الأيمن (أو الأيسر حسب اللغة): المسار الذكي والعنوان */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
        
        {/* زر Hamburger للموبايل */}
        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: '0.15s ease'
            }}
            aria-label="Toggle Sidebar"
          >
            <FaBars style={{ fontSize: '0.9rem' }} />
          </button>
        )}

        {/* المسار الهيكلي (Breadcrumbs) - مرن ومحمي من القواطع */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          minWidth: 0, 
          overflow: 'hidden' 
        }}>
          {/* اسم القسم الرئيسي (يختفي في الشاشات الصغيرة جداً لتوفير المساحة) */}
          {!isExtraSmall && (
            <>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', whiteSpace: 'nowrap' }}>
                {isRtl ? currentRoute.section.ar : currentRoute.section.en}
              </span>
              <span style={{ color: '#334155', display: 'flex', alignItems: 'center' }}>
                {isRtl ? <FaChevronLeft style={{ fontSize: '0.55rem' }} /> : <FaChevronRight style={{ fontSize: '0.55rem' }} />}
              </span>
            </>
          )}

          {/* اسم الصفحة الحالية - بارز وعالي التباين */}
          <span style={{ 
            color: '#38bdf8', 
            fontWeight: '700', 
            fontSize: isMobile ? '0.82rem' : '0.9rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {isRtl ? currentRoute.title.ar : currentRoute.title.en}
          </span>
        </div>
      </div>

      {/* 🔍 2️⃣ المنتصف: مشغل أمر البحث السريع (Ctrl + K) - للشاشات المتوسطة والكبيرة */}
      {!isMobile && (
        <button
          onClick={onOpenSearchModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#131f37',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '5px 12px',
            color: '#64748b',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: '0.15s ease',
            width: '200px',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaSearch style={{ fontSize: '0.7rem' }} />
            <span>{isRtl ? 'بحث سريع...' : 'Search...'}</span>
          </div>
          <kbd style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '3px',
            padding: '1px 5px',
            fontSize: '0.62rem',
            color: '#94a3b8',
            fontFamily: 'monospace'
          }}>
            Ctrl K
          </kbd>
        </button>
      )}

      {/* 🌐 3️⃣ الجانب الأيسر: الأدوات والبادجات الحية */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isExtraSmall ? '4px' : '8px', flexShrink: 0 }}>
        
        {/* جرس التنبيهات الحي */}
        <button 
          style={{
            position: 'relative',
            background: '#131f37',
            border: '1px solid #1e293b',
            color: '#94a3b8',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="Notifications"
        >
          <FaBell style={{ fontSize: '0.8rem', color: '#cbd5e1' }} />
          {unreadNotificationsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '6px',
              height: '6px',
              backgroundColor: '#ef4444',
              borderRadius: '50%'
            }} />
          )}
        </button>

        {/* زر تبديل اللغة */}
        <button 
          onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: '#131f37',
            border: '1px solid #1e293b',
            color: '#e2e8f0',
            height: '32px',
            padding: isExtraSmall ? '0 6px' : '0 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <FaGlobe style={{ color: '#38bdf8', fontSize: '0.8rem' }} />
          {!isExtraSmall && <span>{isRtl ? 'English' : 'العربية'}</span>}
        </button>

        {/* بادج الواتساب الدولي (يختفي في الشاشات الصغرى جداً لحماية المساحة) */}
        {!isExtraSmall && countryCode && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(16, 185, 129, 0.08)',
            color: '#34d399',
            height: '32px',
            padding: '0 8px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: '600',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <FaWhatsapp style={{ color: '#10b981', fontSize: '0.8rem' }} />
            <span style={{ direction: 'ltr' }}>+{countryCode}</span>
          </div>
        )}

        {/* بادج العملة النشطة */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(56, 189, 248, 0.08)',
          color: '#38bdf8',
          height: '32px',
          padding: isExtraSmall ? '0 6px' : '0 8px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: '700',
          border: '1px solid rgba(56, 189, 248, 0.2)'
        }}>
          <FaMoneyBillWave style={{ fontSize: '0.75rem' }} />
          <span>{currency === 'EGP' ? (isRtl ? 'ج.م' : 'EGP') : currency}</span>
        </div>

      </div>

    </header>
  );
}
