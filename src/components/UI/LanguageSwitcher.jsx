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
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={t('common.switchLanguage')}
        aria-label={t('common.switchLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer min-h-[44px]"
        style={{
          backgroundColor: C.dark.surfaceInput,
          borderColor: C.dark.border,
          color: C.text.primary,
        }}
      >
        <Globe size={15} style={{ color: C.primary.DEFAULT }} />
        <span className="uppercase">{currentLang.code}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: C.text.secondary }}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute end-0 mt-2 w-44 rounded-xl border shadow-2xl py-1 z-[999999] overflow-hidden"
          style={{
            backgroundColor: C.dark.surface,
            borderColor: C.dark.border,
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
                className="w-full text-start px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer min-h-[44px]"
                style={{
                  backgroundColor: isSelected ? C.primary.DEFAULT : 'transparent',
                  color: C.text.primary,
                }}
              >
                <span>{lang.nativeName}</span>
                {isSelected && <Check size={14} className="shrink-0" style={{ color: C.text.primary }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
