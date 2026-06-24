/* src/components/Header.jsx */
import React from 'react';
import { FaBars, FaMoneyBillWave, FaWhatsapp } from "react-icons/fa";

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

  const menuTitles = {
    dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
    students: { en: 'Faculty & Students', ar: 'الهيئة التعليمية والطلاب' },
    attendance: { en: 'Recitation & Attendance', ar: 'الحلقات والتسميع' },
    exams: { en: 'Assessments & Certificates', ar: 'التقييمات والشهادات' },
    reports: { en: 'Performance Insights', ar: 'تقارير الأداء والمشاركة' },
    payments: { en: 'Tuition & Billing', ar: 'الرسوم والفوترة' },
    settings: { en: 'System Configuration', ar: 'إعدادات النظام' }
  };

  const currentTitle = menuTitles[activeTab] || { en: 'Management Portal', ar: 'بوابة الإدارة' };

  return (
    <header style={{
      height: '65px',
      background: '#1e293b', 
      borderBottom: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: isRtl ? 'row' : 'row-reverse', /* 🌐 قلب اتجاه الهيدر العلوي كاملاً */
      padding: isMobile ? '0 12px' : '0 24px',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 999,
    }}>
      
      {/* القسم المخصص لأدوات البوابة (العملة، الدولة، اللغة) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isMobile ? '6px' : '12px',
        flexShrink: 0,
        flexDirection: isRtl ? 'row' : 'row-reverse' /* تعكس الأزرار الداخلية حسب اللغة */
      }}>
        
        {/* زر تحويل اللغة والمحاذاة الفوري */}
        <button 
          onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')} 
          style={{
            background: '#334155',
            color: '#FFFFFF',
            border: 'none',
            padding: '7px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
          title="Change System Language"
        >
          {isRtl ? 'English 🌐' : 'العربية 🌐'}
        </button>

        {/* بادج بوابة الواتساب الدولية */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3B82F6',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: '600',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }} title="WhatsApp Gateway">
          <FaWhatsapp size={12} />
          <span style={{ direction: 'ltr' }}>+{countryCode}</span>
        </div>

        {/* بادج العملة */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10B981',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: '600',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }} title="Active Billing Currency">
          <FaMoneyBillWave size={12} />
          <span>{currency === 'EGP' ? (isRtl ? 'ج.م' : 'EGP') : currency}</span>
        </div>
      </div>

      {/* القسم الخاص بـ: زر القائمة للموبايل + المسار الحركي للعنوان */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        minWidth: 0,
        flexDirection: isRtl ? 'row' : 'row-reverse'
      }}>
        {/* نص المسار الذكي */}
        <div style={{
          color: '#9CA3AF',
          fontSize: isMobile ? '0.85rem' : '0.95rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: '500',
          textAlign: isRtl ? 'right' : 'left'
        }}>
          {!isMobile && (isRtl ? 'الإدارة العالمية' : 'Global Admin')} 
          {!isMobile && <span style={{ margin: '0 8px', color: '#4b5563' }}>/</span>}
          <span style={{ color: '#FFFFFF', fontWeight: '600' }}>
            {isRtl ? currentTitle.ar : currentTitle.en}
          </span>
        </div>

        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{
              background: '#334155',
              border: 'none',
              color: '#FBBF24',
              padding: '8px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaBars size={16} />
          </button>
        )}
      </div>

    </header>
  );
}
