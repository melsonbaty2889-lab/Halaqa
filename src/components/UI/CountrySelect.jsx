// src/components/UI/CountrySelect.jsx
import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import { useFloating, autoUpdate, offset, shift } from '@floating-ui/react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';
import { COUNTRIES_LIST } from '@/constants/countries';

// دالة ذكية لاكتشاف أي دولة في العالم تلقائياً بناءً على المنطقة الزمنية للجهاز
const detectUserCountryCode = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return '';

    // 1. مطابقة مباشرة ودقيقة مع أي دولة مسجلة في ملف القائمة بناءً على الـ timezone الخاص بها
    const matched = COUNTRIES_LIST.find((c) => c.timezone === tz);
    if (matched) return matched.code;

    // 2. مطابقة عامة مرنة في حال وجود توافق جزئي مع المدينة أو القارة
    const tzCity = tz.split('/')[1];
    if (tzCity) {
      const partialMatch = COUNTRIES_LIST.find(
        (c) => c.timezone && c.timezone.includes(tzCity)
      );
      if (partialMatch) return partialMatch.code;
    }
  } catch {
    // تجاهل الأخطاء العائدة من بيئات التشغيل القديمة
  }
  return '';
};

export default function CountrySelect({
  value,
  onChange,
  t = (key, fallback) => fallback,
  lang = 'ar',
  isArabic = true,
  placeholder,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = isArabic !== undefined ? isArabic : ['ar', 'ur'].includes(cleanLang);

  const cardBg = 'var(--color-surface-card)';
  const inputBg = 'var(--color-surface-input)';
  const borderCol = 'var(--color-border-input)';
  const titleColor = 'var(--color-text-primary)';
  const subColor = 'var(--color-text-secondary)';
  const primaryColor = 'var(--color-action-primary)';

  // التحديد التلقائي للدولة عند التحميل إذا لم تكن القيمة محددة مسبقاً
  useEffect(() => {
    if (!value && typeof onChange === 'function') {
      const detectedCode = detectUserCountryCode();
      if (detectedCode) {
        onChange(detectedCode);
      }
    }
  }, [value, onChange]);

  const { x, y, strategy, refs, elements, isPositioned } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      shift({ padding: 10 }),
    ],
  });

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (
        elements.reference &&
        !elements.reference.contains(event.target) &&
        elements.floating &&
        !elements.floating.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, elements]);

  const selectedCountry = COUNTRIES_LIST.find((c) => c.code === (value || detectUserCountryCode()));

  const filteredCountries = COUNTRIES_LIST.filter((c) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      c.nameAr?.toLowerCase().includes(search) ||
      c.nameEn?.toLowerCase().includes(search) ||
      c.dialCode?.includes(search) ||
      c.code?.toLowerCase().includes(search)
    );
  });

  const defaultPlaceholder = placeholder || t('countrySelect.placeholder', 'اختر الدولة...');

  const getCountryName = (c) => {
    if (cleanLang === 'ar') return c.nameAr || c.nameEn;
    if (cleanLang === 'fr') return c.nameFr || c.nameEn || c.nameAr;
    if (cleanLang === 'tr') return c.nameTr || c.nameEn || c.nameAr;
    if (cleanLang === 'ur') return c.nameUr || c.nameAr || c.nameEn;
    if (cleanLang === 'id') return c.nameId || c.nameEn || c.nameAr;
    return c.nameEn || c.nameAr;
  };

  return (
    <div className="w-full text-start" dir={isRtl ? 'rtl' : 'ltr'}>
      <button
        ref={refs.setReference}
        type="button"
        disabled={disabled}
        onClick={() => {
          setSearchTerm('');
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full px-3 py-2.5 border rounded-xl text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
        style={{
          backgroundColor: inputBg,
          borderColor: borderCol,
          color: titleColor,
        }}
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2 truncate">
            <span>{selectedCountry.flag}</span>
            <span className="truncate" style={{ color: titleColor }}>
              {getCountryName(selectedCountry)}
            </span>
            <span className="text-xs" dir="ltr" style={{ color: subColor }}>
              ({selectedCountry.dialCode})
            </span>
          </span>
        ) : (
          <span className="truncate" style={{ color: subColor }}>
            {defaultPlaceholder}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: isOpen ? primaryColor : subColor }}
        />
      </button>

      {isOpen &&
        ReactDom.createPortal(
          <div
            ref={refs.setFloating}
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: elements.reference
                ? `${elements.reference.getBoundingClientRect().width}px`
                : 'auto',
              zIndex: 99999,
              opacity: isPositioned ? 1 : 0,
              visibility: isPositioned ? 'visible' : 'hidden',
              backgroundColor: cardBg,
              borderColor: borderCol,
            }}
            className={`border rounded-xl shadow-2xl overflow-hidden max-h-56 flex flex-col ${
              isPositioned ? 'transition-opacity duration-150' : ''
            }`}
          >
            <div 
              className="p-2 border-b sticky top-0 z-10"
              style={{ 
                backgroundColor: cardBg,
                borderColor: borderCol 
              }}
            >
              <div className="relative flex items-center">
                <Search
                  size={16}
                  className="absolute pointer-events-none shrink-0"
                  style={{
                    right: isRtl ? '0.75rem' : 'auto',
                    left: isRtl ? 'auto' : '0.75rem',
                    color: subColor
                  }}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('countrySelect.searchPlaceholder', 'ابحث باسم الدولة أو الكود...')}
                  className="w-full py-2 border rounded-lg text-xs focus:outline-none transition-colors"
                  style={{
                    paddingRight: isRtl ? '2.5rem' : '0.75rem',
                    paddingLeft: isRtl ? '0.75rem' : '2.5rem',
                    borderColor: borderCol,
                    color: titleColor,
                    backgroundColor: inputBg
                  }}
                />
              </div>
            </div>

            <div 
              className="overflow-y-auto flex-1 custom-scrollbar p-1 space-y-0.5"
              role="listbox"
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => {
                  const isSelected = (value || detectUserCountryCode()) === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(c.code);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full text-start px-2.5 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer min-h-[36px]"
                      style={{
                        backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-action-primary) 20%, transparent)' : 'transparent',
                        color: isSelected ? primaryColor : titleColor,
                        fontWeight: isSelected ? '600' : '400'
                      }}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>{c.flag}</span>
                        <span className="truncate">
                          {getCountryName(c)}
                        </span>
                        <span dir="ltr" style={{ color: subColor }}>
                          ({c.dialCode})
                        </span>
                      </span>
                      {isSelected && (
                        <Check size={14} style={{ color: primaryColor }} className="shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div 
                  className="p-4 text-center text-xs"
                  style={{ color: subColor }}
                >
                  {t('countrySelect.noResults', 'لم يتم العثور على نتائج')}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
