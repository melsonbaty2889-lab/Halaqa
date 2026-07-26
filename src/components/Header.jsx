import React from 'react';
import { FaBars, FaMoneyBillWave, FaWhatsapp, FaGlobe, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Header({ 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile, 
  isRtl, 
  t, 
  currency, 
  countryCode, 
  i18n,
  activeTab
}) {

  // 🎯 قاموس شامل لجميع عناوين التبويبات المطابقة للـ Sidebar
  const menuTitles = {
    // 1️⃣ مركز القيادة والعمليات
    dashboard: { en: 'Dashboard & Performance', ar: 'لوحة التحكم والأداء' },
    'realtime-audit': { en: 'Realtime Audit Trail', ar: 'السجل الحي للأنشطة' },
    'omnichannel-hub': { en: 'Omnichannel Hub', ar: 'مركز التنبيهات الموحد' },
    reports: { en: 'Reports & Analytics', ar: 'التقارير والتحليلات' },

    // 2️⃣ الشؤون القرآنية والأكاديمية
    students: { en: 'Learner Directory', ar: 'إدارة الدارسين' },
    teachers: { en: 'Faculty & Reciters', ar: 'الكادر والمقرئين' },
    halaqas: { en: 'Halaqas & Sanad', ar: 'المقارئ والحلقات' },
    attendance: { en: 'Daily Recitation', ar: 'التسميع والتحضير اليومي' },
    exams: { en: 'Exams & Diplomas', ar: 'الاختبارات والتقييم' },

    // 3️⃣ تفاعل الدارسين والأسر
    'guardian-portal': { en: 'Guardian Portal', ar: 'شبكة أسر الدارسين' },
    'gamification-streaks': { en: 'Gamification & Streaks', ar: 'الإنجاز والحوافز' },

    // 4️⃣ الحوكمة والمالية
    payments: { en: 'Billing & Payments', ar: 'الاشتراكات والتحصيل' },
    'asset-management': { en: 'Asset Management', ar: 'المستندات والأصول' },
    referrals: { en: 'Affiliate & Rewards', ar: 'برنامج الإحالة والأرباح' },
    settings: { en: 'Platform Governance', ar: 'إعدادات المنظومة' }
  };

  const currentTitle = menuTitles[activeTab] || { en: 'Management Portal', ar: 'بوابة الإدارة' };

  return (
    <header 
      style={{
        height: '62px',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        width: '100%',
        backgroundColor: 'rgba(11, 19, 41, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1e293b',
        padding: isMobile ? '0 12px' : '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        direction: isRtl ? 'rtl' : 'ltr',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
      }}
    >
      
      {/* 📑 القسم الأول: المسار الذكي وعنوان الصفحة */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        
        {/* زر فتح القائمة الجانبية (للموبايل فقط) */}
        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: '#f59e0b',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            aria-label="Toggle Sidebar Menu"
          >
            <FaBars style={{ fontSize: '0.9rem' }} />
          </button>
        )}

        {/* المسار الفرعي (Breadcrumb) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontSize: '0.8rem', 
          fontWeight: '500', 
          minWidth: 0, 
          overflow: 'hidden' 
        }}>
          <span style={{ color: '#64748b', display: isMobile ? 'none' : 'inline', whitespace: 'nowrap' }}>
            {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
          </span> 
          
          <span style={{ color: '#334155', display: isMobile ? 'none' : 'inline' }}>
            {isRtl ? <FaChevronLeft style={{ fontSize: '0.65rem' }} /> : <FaChevronRight style={{ fontSize: '0.65rem' }} />}
          </span>

          <span style={{ 
            color: '#f8fafc', 
            fontWeight: '700', 
            background: 'rgba(255, 255, 255, 0.04)', 
            padding: '4px 10px', 
            borderRadius: '6px', 
            border: '1px solid #1e293b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: isMobile ? '0.78rem' : '0.82rem'
          }}>
            {isRtl ? currentTitle.ar : currentTitle.en}
          </span>
        </div>
      </div>

      {/* 🌐 القسم الثاني: أدوات التحكم والبادجات */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
        
        {/* 1️⃣ زر تبديل اللغة */}
        <button 
          onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#131f37',
            border: '1px solid #1e293b',
            color: '#e2e8f0',
            height: '32px',
            padding: isMobile ? '0 8px' : '0 12px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            userSelect: 'none'
          }}
        >
          <FaGlobe style={{ color: '#38bdf8', fontSize: '0.8rem' }} />
          <span style={{ display: isMobile ? 'none' : 'inline' }}>{isRtl ? 'English' : 'العربية'}</span>
        </button>

        {/* 2️⃣ بادج الواتساب الدولي */}
        {countryCode && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(16, 185, 129, 0.08)',
            color: '#34d399',
            height: '32px',
            padding: '0 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: '600',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <FaWhatsapp style={{ color: '#10b981', fontSize: '0.85rem' }} />
            <span style={{ direction: 'ltr', fontSize: '0.7rem' }}>+{countryCode}</span>
          </div>
        )}

        {/* 3️⃣ بادج العملة النشطة */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'rgba(56, 189, 248, 0.08)',
          color: '#38bdf8',
          height: '32px',
          padding: '0 9px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: '700',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          userSelect: 'none'
        }}>
          <FaMoneyBillWave style={{ fontSize: '0.78rem', opacity: 0.9 }} />
          <span>
            {currency === 'EGP' ? (isRtl ? 'ج.م' : 'EGP') : currency}
          </span>
        </div>

      </div>

    </header>
  );
}
