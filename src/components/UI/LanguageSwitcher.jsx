// src/components/UI/LanguageSwitcher.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LANGUAGES = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'ur', name: 'اردو', dir: 'rtl' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr' },
];

export default function LanguageSwitcher({ dropDirection = 'down', placement = 'auth' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const currentLang = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];
  const isRtl = currentLang.dir === 'rtl';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang) => {
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(lang.code);
    }
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
    setIsOpen(false);
  };

  const dropdownVerticalClass = 
    dropDirection === 'up' 
      ? 'bottom-full mb-2' 
      : 'top-full mt-2';

  // حساب كلاس المحاذاة الدقيق لمنع خروج القائمة عن إطار الشاشة
  const getAlignmentClass = () => {
    if (placement === 'footer') {
      // الفوتر:
      // العربية -> تفتح يساراً (نثبت حافتها اليمنى مع الزر right-0 فتتمدد لليسار)
      // الإنجليزية -> تفتح يميناً (نثبت حافتها اليسرى مع الزر left-0 فتتمدد لليمين)
      return isRtl ? 'right-0' : 'left-0';
    }

    // صفحات المصادقة (auth):
    // العربية -> تفتح يميناً (نثبت حافتها اليسرى مع الزر left-0 فتتمدد لليمين)
    // الإنجليزية -> تفتح يساراً (نثبت حافتها اليمنى مع الزر right-0 فتتمدد لليسار)
    return isRtl ? 'left-0' : 'right-0';
  };

  return (
    <div className="relative inline-block text-start z-50" ref={dropdownRef}>
      {/* زر محول اللغات */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        aria-expanded={isOpen}
        className="h-10 flex items-center justify-center gap-1.5 px-3 rounded-xl border border-semantic-borderCard bg-semantic-surfaceCard text-semantic-textPrimary text-xs font-semibold hover:border-semantic-borderHover transition-all duration-200 focus:outline-none cursor-pointer active:scale-95 shadow-sm"
      >
        <Globe size={15} className="shrink-0 text-semantic-textSecondary" />
        <span className="uppercase font-mono font-bold text-semantic-textPrimary">
          {currentLang.code}
        </span>
        <ChevronDown 
          size={14} 
          className={`shrink-0 text-semantic-textSecondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div 
          className={`absolute ${dropdownVerticalClass} ${getAlignmentClass()} w-44 rounded-2xl border border-semantic-borderCard bg-dark-card shadow-2xl py-1.5 z-50 overflow-hidden backdrop-blur-md`}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = currentLangCode === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                dir={lang.dir}
                className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer select-none font-medium ${
                  isSelected
                    ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary font-bold'
                    : 'text-semantic-textPrimary hover:bg-semantic-surfaceSecondary hover:text-semantic-actionPrimary'
                }`}
              >
                <span className="truncate">{lang.name}</span>
                {isSelected && (
                  <Check size={14} className="shrink-0 ms-2 text-semantic-actionPrimary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
