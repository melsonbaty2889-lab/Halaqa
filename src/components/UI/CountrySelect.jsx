import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COUNTRIES_LIST } from '@/constants/countries';
import C from '@/theme/colors';

export default function CountrySelect({
  value,
  onChange,
  isArabic,
  placeholder,
  disabled = false,
}) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentLang = i18n.language || 'ar';
  const cleanLang = currentLang.toLowerCase().split('-')[0];
  
  // تحديد اتجاه اللغة مع دعم الخيار اليدوي للبروب القديم إن وجد
  const isRtl = isArabic !== undefined 
    ? isArabic 
    : (i18n?.dir ? i18n.dir() === 'rtl' : ['ar', 'ur'].includes(cleanLang));

  // استخراج الألوان من كائن الألوان C
  const cardBg = C.dark?.surface || '#1E293B';
  const inputBg = C.dark?.bg || '#0F172A';
  const borderCol = C.dark?.borderInput || C.inputs?.border || '#334155';
  const titleColor = C.text?.title || '#F8FAFC';
  const subColor = C.text?.sub || C.text?.muted || '#94A3B8';
  const primaryColor = C.amber?.DEFAULT || C.primary?.DEFAULT || '#38BDF8';

  // 1. استخراج isPositioned لمنع الوميض قبل تحديد الموقع
  const { x, y, strategy, refs, elements, isPositioned } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: isRtl ? 'bottom-start' : 'bottom-end',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ fallbackPlacements: ['top-start', 'top-end'] }),
      shift({ padding: 10 }),
    ],
  });

  // 2. إغلاق القائمة عند اللمس خارجها
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

  const selectedCountry = COUNTRIES_LIST.find((c) => c.code === value);

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

  return (
    <div className="w-full text-start" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* الزر الرئيسي */}
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
              {isRtl ? selectedCountry.nameAr : (selectedCountry.nameEn || selectedCountry.nameAr)}
            </span>
            <span className="text-xs dir-ltr" style={{ color: subColor }}>
              ({selectedCountry.dialCode})
            </span>
          </span>
        ) : (
          <span className="truncate" style={{ color: `${subColor}A0` }}>
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

      {/* القائمة المنسدلة بدون وميض */}
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
            {/* حقل البحث */}
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
                    [isRtl ? 'right' : 'left']: '0.75rem',
                    color: subColor
                  }}
                />
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('countrySelect.searchPlaceholder', 'ابحث باسم الدولة أو الكود...')}
                  className="w-full py-1.5 border rounded-lg text-xs focus:outline-none transition-colors"
                  style={{
                    paddingRight: isRtl ? '2.25rem' : '0.75rem',
                    paddingLeft: isRtl ? '0.75rem' : '2.25rem',
                    borderColor: borderCol,
                    color: titleColor,
                    backgroundColor: inputBg
                  }}
                />
              </div>
            </div>

            {/* قائمة العناصر */}
            <div 
              className="overflow-y-auto flex-1 custom-scrollbar p-1 space-y-0.5"
              role="listbox"
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => {
                  const isSelected = value === c.code;
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
                        backgroundColor: isSelected ? `${primaryColor}20` : 'transparent',
                        color: isSelected ? primaryColor : titleColor,
                        fontWeight: isSelected ? '600' : '400'
                      }}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>{c.flag}</span>
                        <span className="truncate">
                          {isRtl ? c.nameAr : (c.nameEn || c.nameAr)}
                        </span>
                        <span className="dir-ltr" style={{ color: subColor }}>
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
