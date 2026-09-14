import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'ur', name: 'اردو', dir: 'rtl' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];
  const isRtl = i18n.dir() === 'rtl';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code) => {
    const selected = LANGUAGES.find((l) => l.code === code);
    i18n.changeLanguage(code);
    document.documentElement.dir = selected?.dir || 'ltr';
    document.documentElement.lang = code;
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-start z-50" ref={dropdownRef}>
      {/* زر اختيار اللغة */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-900/90 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-all shadow-md"
      >
        <Globe className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="uppercase tracking-wider">{currentLang.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* القائمة المنبثقة التكيفية */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-1.5 z-50 overflow-hidden ${
            isRtl ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          }`}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-start px-4 py-2.5 text-xs flex items-center justify-between transition-colors ${
                i18n.language === lang.code
                  ? 'bg-amber-500/15 text-amber-400 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="truncate">{lang.name}</span>
              {i18n.language === lang.code && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
