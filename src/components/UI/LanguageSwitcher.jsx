import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import C from '@/theme/colors';

export default function LanguageSwitcher({ i18n }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const currentLang = SUPPORTED_LANGUAGES?.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES?.[0] || {
    code: 'ar',
    nativeName: 'العربية',
    flag: '🇸🇦',
  };

  const handleLanguageChange = (lang) => {
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(lang.code);
    }
    setIsOpen(false);
  };

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
    <div className="relative inline-block text-start z-50" ref={dropdownRef}>
      {/* زر فتح القائمة */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="تغيير اللغة"
        aria-label="تغيير اللغة"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer min-h-[44px]"
        style={{
          backgroundColor: C?.dark?.surfaceInput || '#0A101D',
          borderColor: C?.dark?.border || '#1B2738',
          color: C?.text?.primary || '#FFFFFF',
        }}
      >
        <Globe size={15} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
        <span className="uppercase">{currentLang.code}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: C?.text?.secondary || '#94A3B8' }}
        />
      </button>

      {/* القائمة المنسدلة للغات */}
      {isOpen && (
        <div
          className="absolute end-0 mt-2 w-44 rounded-xl border shadow-2xl py-1 z-[999999] overflow-hidden"
          style={{
            backgroundColor: C?.dark?.surface || '#0F172A',
            borderColor: C?.dark?.border || '#1B2738',
          }}
        >
          {SUPPORTED_LANGUAGES?.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className="w-full text-start px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer min-h-[44px]"
                style={{
                  backgroundColor: isSelected ? (C?.primary?.DEFAULT || '#E07A00') : 'transparent',
                  color: isSelected ? '#FFFFFF' : (C?.text?.primary || '#FFFFFF'),
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </div>
                {isSelected && <Check size={14} className="shrink-0" style={{ color: '#FFFFFF' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
