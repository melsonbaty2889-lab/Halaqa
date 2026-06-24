/* src/components/Sidebar.jsx */
import React from 'react';
import { 
  FaChartLine, 
  FaUsers, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaCog, 
  FaAward, 
  FaWhatsapp, 
  FaSignOutAlt, 
  FaClock, 
  FaCrown 
} from "react-icons/fa";
import { supabase } from '../lib/supabase';

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

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';

  const menuItems = [
    { id: 'dashboard', icon: <FaChartLine />, labelKey: 'dashboard', def: 'Dashboard', ar: 'لوحة التحكم' },
    { id: 'students', icon: <FaUsers />, labelKey: 'student_management', def: 'Faculty & Students', ar: 'الهيئة التعليمية والطلاب' },
    { id: 'attendance', icon: <FaCalendarCheck />, labelKey: 'recitation_attendance', def: 'Recitation & Attendance', ar: 'الحلقات والتسميع' },
    { id: 'exams', icon: <FaAward />, labelKey: 'surah_juz_exams', def: 'Assessments & Certificates', ar: 'التقييمات والشهادات' }, 
    { id: 'reports', icon: <FaWhatsapp />, labelKey: 'parent_reports', def: 'Performance Insights', ar: 'تقارير الأداء والمشاركة' }, 
    { id: 'payments', icon: <FaMoneyBillWave />, labelKey: 'billing_finance', def: 'Tuition & Billing', ar: 'الرسوم والفوترة' },
    { id: 'settings', icon: <FaCog />, labelKey: 'general_settings', def: 'System Configuration', ar: 'إعدادات النظام' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (isPlatformAdmin) {
      return item.id === 'dashboard' || item.id === 'settings';
    }
    return true;
  });

  const getSidebarTranslate = () => {
    if (!isMobile) return 'translateX(0)';
    if (sidebarOpen) return 'translateX(0)';
    return isRtl ? 'translateX(100%)' : 'translateX(-100%)';
  };

  return (
    <aside style={{
      position: isMobile ? 'fixed' : 'sticky',
      top: 0,
      right: isRtl ? 0 : 'auto',   
      left: isRtl ? 'auto' : 0,    
      width: '270px',
      minWidth: '270px',
      height: '100vh',
      background: '#111827', 
      borderLeft: isRtl && !isMobile ? '1px solid #1f2937' : 'none',
      borderRight: !isRtl && !isMobile ? '1px solid #1f2937' : 'none',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999, /* 🌟 رفع الـ zIndex لأعلى درجة لمنع تداخل الهيدر نهائياً */
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: getSidebarTranslate(),
      boxShadow: isMobile ? (isRtl ? '-10px 0 30px rgba(0,0,0,0.6)' : '10px 0 30px rgba(0,0,0,0.6)') : 'none',
      boxSizing: 'border-box',
      padding: '24px 20px',
    }}>
      
      <h2 style={{
        color: '#FBBF24',
        fontSize: '1.4rem',
        fontWeight: 'bold',
        marginBottom: '5px',
        textAlign: 'start', /* 🌟 يتبع اتجاه الكومبوننت الأب تلقائياً */
        marginTop: 0
      }}>
        {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
      </h2>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#9CA3AF',
        fontSize: '0.8rem',
        marginBottom: '25px',
        justifyContent: 'flex-start',
        flexDirection: isRtl ? 'row-reverse' : 'row' /* حماية توقيت المنطقة الزمنية من الانعكاس الرقمي */
      }}>
        <span style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }}></span>
        <span>{timezone.split('/')[1] || timezone} : {academyTime || '--:--'}</span>
      </div>
      
      {!isPlatformAdmin && (
        <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            background: isTrial ? 'rgba(219, 139, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: isTrial ? '#F59E0B' : '#10B981',
            border: isTrial ? '1px solid rgba(219, 139, 11, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
          }}>
            <FaClock size={14} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isTrial 
                ? (isRtl ? `متبقي ${numberFormatter.format(trialDaysLeft)} أيام تجريبية` : `${numberFormatter.format(trialDaysLeft)} trial days left`)
                : (isRtl ? `متبقي ${numberFormatter.format(trialDaysLeft)} يوماً` : `${numberFormatter.format(trialDaysLeft)} days left`)}
            </span>
          </div>

          {isTrial && !accountActivated && (
            <button 
              onClick={() => setShowEarlyUpgrade(true)} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(90deg, #F59E0B, #D97706)',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <FaCrown />
              <span>{isRtl ? 'ترقية الحساب الآن' : 'Upgrade Now'}</span>
            </button>
          )}
        </div>
      )}
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
        {filteredMenuItems.map(item => {
          const isSelected = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => { 
                setActiveTab(item.id); 
                if(isMobile) setSidebarOpen(false); 
              }} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isSelected ? '#1E293B' : 'transparent',
                color: isSelected ? '#FBBF24' : '#9CA3AF',
                cursor: 'pointer',
                textAlign: 'start', /* 🌟 السر هنا: إجبار البراوزر على بدء النص من البداية المنطقية للغة الحالية */
                fontSize: '0.9rem',
                fontWeight: isSelected ? '600' : 'normal',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                if(!isSelected) {
                  e.currentTarget.style.background = '#1f2937';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if(!isSelected) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#9CA3AF';
                }
              }}
            >
              <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {item.icon}
              </span> 
              <span style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1
              }}>
                {isRtl ? item.ar : t(item.labelKey, item.def)}
              </span>
            </button>
          );
        })}
      </nav>

      <button 
        onClick={() => supabase.auth.signOut()} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 14px',
          borderRadius: '8px',
          border: 'none',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#EF4444',
          cursor: 'pointer',
          fontSize: '0.95rem',
          marginTop: 'auto',
          boxSizing: 'border-box',
          justifyContent: 'center'
        }}
      >
        <FaSignOutAlt /> <span>{t('logout', 'Log Out')}</span>
      </button>
    </aside>
  );
}
