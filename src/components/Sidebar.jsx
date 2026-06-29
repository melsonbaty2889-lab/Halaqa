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
    <aside 
      className="transition-all duration-300 ease-out"
      style={{
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        right: isRtl ? 0 : 'auto',   
        left: isRtl ? 'auto' : 0,    
        width: '270px',
        minWidth: '270px',
        height: '100vh',
        // 💡 ربط الخلفية والحواف بالهوية اللونية الموحدة للمنصة
        background: 'var(--surface)', 
        borderLeft: isRtl && !isMobile ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        borderRight: !isRtl && !isMobile ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999, 
        transform: getSidebarTranslate(),
        boxShadow: isMobile ? 'var(--shadow)' : 'none',
        boxSizing: 'border-box',
        padding: '24px 20px',
      }}
    >
      
      {/* عنوان المنصة باللون الذهبي الموحد المعمد للمنصة */}
      <h2 className="text-xl font-bold mb-1 text-right" style={{ color: 'var(--gold)' }}>
        {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
      </h2>

      {/* التوقيت والمنطقة الزمنية بتنسيق لوني متناسق */}
      <div 
        className="flex items-center gap-2 text-xs mb-6 text-slate-400"
        style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>{timezone.split('/')[1] || timezone} : {academyTime || '--:--'}</span>
      </div>
      
      {!isPlatformAdmin && (
        <div className="mb-6 flex flex-col gap-2.5">
          {/* كارت العداد التجريبي منسق بـ Tailwind */}
          <div className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium border ${
            isTrial 
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          }`}>
            <FaClock size={14} className="flex-shrink-0" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {isTrial 
                ? (isRtl ? `متبقي ${numberFormatter.format(trialDaysLeft)} أيام تجريبية` : `${numberFormatter.format(trialDaysLeft)} trial days left`)
                : (isRtl ? `متبقي ${numberFormatter.format(trialDaysLeft)} يوماً` : `${numberFormatter.format(trialDaysLeft)} days left`)}
            </span>
          </div>

          {isTrial && !accountActivated && (
            <button 
              onClick={() => setShowEarlyUpgrade(true)} 
              className="flex items-center justify-center gap-2 w-full p-3 text-xs font-bold text-slate-950 rounded-lg transition-all active:scale-95 shadow-lg"
              style={{
                background: 'linear-gradient(90deg, var(--gold), #A38436)',
              }}
            >
              <FaCrown />
              <span>{isRtl ? 'ترقية الحساب الآن' : 'Upgrade Now'}</span>
            </button>
          )}
        </div>
      )}
      
      {/* قائمة التبويبات والتنقل الذكي الموحد */}
      <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
        {filteredMenuItems.map(item => {
          const isSelected = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => { 
                setActiveTab(item.id); 
                if(isMobile) setSidebarOpen(false); 
              }} 
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-none cursor-pointer text-right text-sm transition-all duration-200 group ${
                isSelected 
                  ? 'text-slate-950 font-bold shadow-md' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              style={{
                background: isSelected ? 'var(--gold)' : 'transparent',
              }}
            >
              <span className={`text-base flex items-center flex-shrink-0 transition-transform duration-200 ${!isSelected && 'group-hover:scale-110'}`}>
                {item.icon}
              </span> 
              <span className="whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                {isRtl ? item.ar : t(item.labelKey, item.def)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* زر تسجيل الخروج متناسق الألوان */}
      <button 
        onClick={() => supabase.auth.signOut()} 
        className="flex items-center justify-center gap-3 w-full p-3 rounded-xl border-none bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 transition-all text-sm mt-auto"
      >
        <FaSignOutAlt /> <span>{t('logout', 'Log Out')}</span>
      </button>
    </aside>
  );
}
