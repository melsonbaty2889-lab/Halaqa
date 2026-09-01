import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇪🇬' },
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
];

export default function LanguageSwitcher({ i18n }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n?.language || 'ar';
  const currentLang = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  const handleLanguageChange = (lang) => {
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(lang.code);
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = lang.code;
    }
    setIsOpen(false);
  };

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-start" ref={dropdownRef}>
      {/* زر فتح القائمة */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-all duration-200 focus:outline-none"
      >
        <Globe size={14} className="text-[#10B981] shrink-0" />
        <span className="font-semibold uppercase">{currentLang.code}</span>
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* القائمة المنسدلة للغات */}
      {isOpen && (
        <div className="absolute end-0 mt-1.5 w-36 bg-[#0F172A] border border-[#1B2738] rounded-xl shadow-2xl py-1 z-[999999] overflow-hidden">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-start px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#E07A00] text-white font-bold'
                    : 'text-slate-200 hover:bg-[#162032] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {isSelected && <Check size={14} className="text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
