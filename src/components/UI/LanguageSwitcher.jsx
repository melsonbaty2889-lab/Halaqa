/* src/components/UI/LanguageSwitcher.jsx */
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

export default function LanguageSwitcher({ className = '', align = 'auto' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const currentLang = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  // إغلاق القائمة عند النقر خارجها
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

  // ضبط اتجاه القائمة المنسدلة ذكياً لتجنب الخروج خارج أطراف الشاشة
  const getAlignmentClass = () => {
    if (align === 'start') return 'start-0';
    if (align === 'end') return 'end-0';
    
    // التعديل التلقائي للـ Header في اتجاهات LTR و RTL
    const isRtl = document.documentElement.dir === 'rtl';
    return isRtl ? 'start-0 sm:end-0' : 'start-0';
  };

  return (
    <div className={`relative inline-block text-start z-50 ${className}`} ref={dropdownRef}>
      {/* زر فتح المنسدلة */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput text-semantic-textPrimary text-xs font-semibold hover:border-semantic-borderHover transition-all shadow-sm focus:outline-none cursor-pointer"
        aria-expanded={isOpen}
        aria-label="Change Language"
      >
        <Globe className="w-3.5 h-3.5 text-semantic-actionPrimary shrink-0" />
        <span className="uppercase font-mono tracking-wider">{currentLang.code}</span>
        <ChevronDown
          className={`w-3 h-3 text-semantic-textSecondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* قائمة اللغات المنسدلة */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 w-48 max-w-[85vw] rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput shadow-2xl py-1.5 z-50 backdrop-blur-xl transition-all ${getAlignmentClass()}`}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = currentLangCode === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                dir={lang.dir}
                className={`w-full px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary font-bold'
                    : 'text-semantic-textSecondary hover:bg-semantic-borderCard hover:text-semantic-textPrimary'
                }`}
              >
                <span className="truncate">{lang.name}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-semantic-actionPrimary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
