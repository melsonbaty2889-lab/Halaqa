import React from 'react';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import NotificationMenu from './NotificationMenu';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySelector from './CurrencySelector';

export default function Header({
  isRtl,
  isMobile,
  toggleSidebar,
  activeTab, // 👈 تم إضافة activeTab للـ props لعرض اسم الصفحة ديناميكياً
  setActiveTab,
  i18n,
  currency,
  setCurrency,
  userData
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0b1329]/80 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 lg:px-8 py-3 flex items-center justify-between transition-all">
      
      {/* القسم الرئيسي: زر القائمة الجانبية + اسم الصفحة الحالية فقط */}
      <div className="flex items-center gap-2.5 shrink-0">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors"
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-lg" />
          </button>
        )}

        {/* 🟢 التعديل الرئيسي: تبسيط العنوان وتوجيهه لنوع الصفحة لتقليل التزاحم */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xs sm:text-sm lg:text-base font-bold text-slate-100 truncate max-w-[110px] sm:max-w-none">
            {isRtl ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* القسم الفرعي: أدوات الهيدر (العملة، اللغة، التنبيهات، والبروفايل) */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        
        {/* محول العملات */}
        <CurrencySelector 
          isRtl={isRtl} 
          currency={currency} 
          setCurrency={setCurrency} 
        />

        {/* محول اللغة */}
        <LanguageSwitcher 
          isRtl={isRtl} 
          isMobile={isMobile} 
          i18n={i18n} 
        />

        {/* قائمة التنبيهات */}
        <NotificationMenu 
          isRtl={isRtl} 
          isMobile={isMobile} 
          setActiveTab={setActiveTab} 
        />

        <div className="h-5 w-[1px] bg-slate-800 mx-0.5 hidden sm:block"></div>

        {/* بروفايل المستخدم المختصر */}
        <div 
          onClick={() => setActiveTab && setActiveTab('profile')}
          className="flex items-center gap-2 cursor-pointer p-1 sm:p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          {userData?.avatar ? (
            <img 
              src={userData.avatar} 
              alt="User" 
              className="w-7 h-7 rounded-full object-cover border border-slate-700" 
            />
          ) : (
            <FaUserCircle className="text-xl sm:text-2xl text-slate-400" />
          )}
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200">
              {userData?.name || (isRtl ? 'المشرف العام' : 'Admin')}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
