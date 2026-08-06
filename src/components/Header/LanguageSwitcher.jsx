import React from 'react';
import { FaGlobe } from 'react-icons/fa';

export default function LanguageSwitcher({ isRtl, isMobile, i18n }) {
  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(nextLang);
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all duration-200 focus:outline-none"
      title={isRtl ? 'تغيير اللغة إلى الإنجليزية' : 'Switch to Arabic'}
    >
      <FaGlobe className="text-sky-400 text-sm" />
      <span className="font-semibold">{isRtl ? 'EN' : 'عربي'}</span>
    </button>
  );
}
