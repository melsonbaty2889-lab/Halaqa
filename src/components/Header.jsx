import React from 'react';
import { FaBars, FaMoneyBillWave, FaWhatsapp, FaGlobe } from "react-icons/fa";

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
    <header 
      className="h-[65px] sticky top-0 z-[999] w-full border-b border-white/5 backdrop-blur-md bg-[var(--surface)] px-4 md:px-6 flex items-center justify-between transition-all duration-300"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      
      {/* 📑 القسم الأول: المسار الذكي والعناوين (يأتي أولاً دائماً لضمان القيادية البصرية) */}
      <div className="flex items-center gap-3 min-w-0">
        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="bg-white/5 hover:bg-white/10 active:scale-90 text-[var(--gold)] border-none w-9 h-9 rounded-xl cursor-pointer flex items-center justify-center transition-all flex-shrink-0"
            aria-label="Toggle Sidebar Menu"
          >
            <FaBars size={15} />
          </button>
        )}

        <div className="text-xs md:text-sm font-medium tracking-wide min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-slate-400 hidden md:inline">
            {isRtl ? 'الأكاديمية الرقمية' : 'Digital Academy'}
          </span> 
          <span className="mx-2 text-slate-600 hidden md:inline">/</span>
          <span className="text-white font-bold bg-white/[0.02] md:bg-transparent px-2.5 py-1 md:p-0 rounded-lg border border-white/5 md:border-none">
            {isRtl ? currentTitle.ar : currentTitle.en}
          </span>
        </div>
      </div>

      {/* 🌐 القسم الثاني: أدوات التحكم والبادجات (تتمحور تلقائياً في الطرف المقابل للغة) */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        
        {/* زر تبديل اللغة */}
        <button 
          onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')} 
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 active:scale-95 text-white border-none h-8 px-2.5 md:px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap select-none"
        >
          <FaGlobe className="text-blue-400 text-xs md:text-sm" />
          <span className="hidden sm:inline">{isRtl ? 'English' : 'العربية'}</span>
        </button>

        {/* بادج الواتساب الدولي */}
        <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 h-8 px-2 md:px-2.5 rounded-xl text-xs font-semibold border border-blue-500/15">
          <FaWhatsapp size={14} className="text-emerald-400" />
          <span className="hidden sm:inline" style={{ direction: 'ltr' }}>+{countryCode}</span>
        </div>

        {/* بادج العملة النشطة */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 h-8 px-2 md:px-2.5 rounded-xl text-xs font-bold border border-emerald-500/15 select-none">
          <FaMoneyBillWave size={13} className="opacity-80" />
          <span className="tracking-wide">
            {currency === 'EGP' ? (isRtl ? 'ج.م' : 'EGP') : currency}
          </span>
        </div>
      </div>

    </header>
  );
}
