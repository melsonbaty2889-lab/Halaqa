import React from 'react';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import NotificationMenu from './NotificationMenu';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySelector from './CurrencySelector';

export default function Header({
  isRtl,
  isMobile,
  toggleSidebar,
  setActiveTab,
  i18n,
  currency,
  setCurrency,
  userData
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0b1329]/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between transition-all">
      
      {/* القسم الأيمن: زر القائمة الجانبية (للصوّر والجوال) + العنوان أو شعار المصغّر */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors"
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-lg" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-sm lg:text-base font-bold text-slate-100">
            {isRtl ? 'منصة إدارة الحلقات' : 'Halaqa Management'}
          </h1>
          <span className="text-[10px] text-slate-400">
            {isRtl ? 'لوحة التحكم الرئيسية' : 'Dashboard Overview'}
          </span>
        </div>
      </div>

      {/* القسم الأيسر: أدوات الهيدر (اللغة، العملة، التنبيهات، وحساب المستخدم) */}
      <div className="flex items-center gap-2 lg:gap-3">
        
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

        <div className="h-5 w-[1px] bg-slate-800 mx-0.5"></div>

        {/* بروفایل المستخدم المختصر */}
        <div 
          onClick={() => setActiveTab && setActiveTab('profile')}
          className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          {userData?.avatar ? (
            <img 
              src={userData.avatar} 
              alt="User" 
              className="w-7 h-7 rounded-full object-cover border border-slate-700" 
            />
          ) : (
            <FaUserCircle className="text-2xl text-slate-400" />
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
