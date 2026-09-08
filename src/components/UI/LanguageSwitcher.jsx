import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import C from '@/theme/colors';

const SUPPORTED_LANGUAGES = [
  { code: 'ar', nativeName: 'العربية' },
  { code: 'en', nativeName: 'English' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'tr', nativeName: 'Türkçe' },
  { code: 'ur', nativeName: 'اردو' },
  { code: 'id', nativeName: 'Bahasa Indonesia' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (langCode) => {
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(langCode);
      document.documentElement.dir = ['ar', 'ur'].includes(langCode) ? 'rtl' : 'ltr';
      document.documentElement.lang = langCode;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handlePointerDownOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block text-start z-50" ref={dropdownRef}>
      {/* تم تصغير الارتفاع وتنسيق الحواف ليكون أنيقاً */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={t('common.switchLanguage')}
        aria-label={t('common.switchLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer h-8 shadow-sm hover:border-amber-500/50"
        style={{
          backgroundColor: C?.dark?.surfaceInput || '#0A101D',
          borderColor: C?.dark?.border || '#1B2738',
          color: C?.text?.primary || '#FFFFFF',
        }}
      >
        <Globe size={13} style={{ color: C?.primary?.DEFAULT || '#E07A00' }} />
        <span className="uppercase tracking-wider">{currentLang.code}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: C?.text?.secondary || '#94A3B8' }}
        />
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute end-0 mt-1.5 w-40 rounded-xl border shadow-2xl py-1 z-[999999] overflow-hidden"
          style={{
            backgroundColor: C?.dark?.surface || '#0F172A',
            borderColor: C?.dark?.border || '#1B2738',
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                role="menuitem"
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full text-start px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer hover:bg-white/5"
                style={{
                  backgroundColor: isSelected ? (C?.primary?.DEFAULT || '#E07A00') : 'transparent',
                  color: isSelected ? '#000000' : (C?.text?.primary || '#FFFFFF'),
                }}
              >
                <span className={isSelected ? 'font-bold' : 'font-normal'}>{lang.nativeName}</span>
                {isSelected && <Check size={13} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
