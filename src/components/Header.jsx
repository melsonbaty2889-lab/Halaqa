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
    <header 
      className="backdrop-blur-md border-b border-white/5 sticky top-0 transition-all duration-300"
      style={{
        height: '65px',
        // 💡 ربط الخلفية بالهوية اللونية الموحدة للمنصة
        background: 'var(--surface)', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: isRtl ? 'row' : 'row-reverse', 
        padding: isMobile ? '0 16px' : '0 24px',
        boxSizing: 'border-box',
        zIndex: 999,
      }}
    >
      
      {/* القسم المخصص لأدوات البوابة (العملة، الدولة، اللغة) */}
      <div 
        className="flex items-center flex-shrink-0"
        style={{ 
          gap: isMobile ? '8px' : '12px',
          flexDirection: isRtl ? 'row' : 'row-reverse' 
        }}
      >
        
        {/* زر تحويل اللغة والمحاذاة الفوري - مظهر ناعم تفاعلي */}
        <button 
          onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')} 
          className="bg-white/5 hover:bg-white/10 active:scale-95 text-white border-none py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
          title="Change System Language"
        >
          {isRtl ? 'English 🌐' : 'العربية 🌐'}
        </button>

        {/* بادج بوابة الواتساب الدولية */}
        <div 
          className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 py-1.5 px-2.5 rounded-lg text-xs font-semibold border border-blue-500/15" 
          title="WhatsApp Gateway"
        >
          <FaWhatsapp size={13} />
          <span style={{ direction: 'ltr' }}>+{countryCode}</span>
        </div>

        {/* بادج العملة */}
        <div 
          className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 py-1.5 px-2.5 rounded-lg text-xs font-semibold border border-emerald-500/15" 
          title="Active Billing Currency"
        >
          <FaMoneyBillWave size={13} />
          <span>{currency === 'EGP' ? (isRtl ? 'ج.م' : 'EGP') : currency}</span>
        </div>
      </div>

      {/* القسم الخاص بـ: زر القائمة للموبايل + المسار الحركي للعنوان */}
      <div 
        className="flex items-center gap-3 min-w-0" 
        style={{ flexDirection: isRtl ? 'row' : 'row-reverse' }}
      >
        {/* نص المسار الذكي المطور لتجربة SaaS احترافية وعالمية */}
        <div 
          className="text-slate-400 text-xs md:text-sm whitespace-nowrap overflow-hidden text-ellipsis font-medium"
          style={{ textAlign: isRtl ? 'right' : 'left' }}
        >
          {!isMobile && (isRtl ? 'الأكاديمية الرقمية' : 'Digital Academy')} 
          {!isMobile && <span className="mx-2 text-slate-600">/</span>}
          {/* إبراز اسم الصفحة الحالية بلون النص الأساسي اللامع */}
          <span className="text-white font-bold">
            {isRtl ? currentTitle.ar : currentTitle.en}
          </span>
        </div>

        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="bg-white/5 hover:bg-white/10 active:scale-95 border-none p-2 rounded-lg cursor-pointer flex items-center justify-center transition-all"
            style={{ color: 'var(--gold)' }} // ربط لون زر الهامبرغر بالذهبي الموحد
          >
            <FaBars size={16} />
          </button>
        )}
      </div>

    </header>
  );
}
