// src/components/UI/CountrySelect.jsx

import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';
import { COUNTRIES_LIST } from '@/constants/countries';

export default function CountrySelect({
  value,
  onChange,
  isArabic = true,
  placeholder,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. استخراج isPositioned لمنع الوميض قبل تحديد الموقع
  const { x, y, strategy, refs, elements, isPositioned } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ fallbackPlacements: ['top-start'] }),
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
      c.nameAr.toLowerCase().includes(search) ||
      c.nameEn?.toLowerCase().includes(search) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search)
    );
  });

  const defaultPlaceholder = isArabic ? 'اختر الدولة...' : 'Select Country...';

  return (
    <div className="w-full text-start" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* الزر الرئيسي */}
      <button
        ref={refs.setReference}
        type="button"
        disabled={disabled}
        onClick={() => {
          setSearchTerm('');
          setIsOpen((prev) => !prev);
        }}
        className="w-full px-3 py-2.5 bg-dark-input border border-appBorder-input rounded-xl text-appText-main text-sm focus:outline-none focus:border-appBorder-hover transition-colors flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50"
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2 truncate">
            <span>{selectedCountry.flag}</span>
            <span className="text-appText-main truncate">
              {isArabic ? selectedCountry.nameAr : selectedCountry.nameEn}
            </span>
            <span className="text-xs text-appText-sub dir-ltr">({selectedCountry.dialCode})</span>
          </span>
        ) : (
          <span className="text-appText-sub/60 truncate">{placeholder || defaultPlaceholder}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-appText-sub shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* القائمة المنسدلة بدون وميض */}
      {isOpen &&
        ReactDom.createPortal(
          <div
            ref={refs.setFloating}
            dir={isArabic ? 'rtl' : 'ltr'}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: elements.reference
                ? `${elements.reference.getBoundingClientRect().width}px`
                : 'auto',
              zIndex: 99999,
              // تجميد الشفافية والظهور لحين اكتمال عملية التموضع
              opacity: isPositioned ? 1 : 0,
              visibility: isPositioned ? 'visible' : 'hidden',
            }}
            className={`bg-dark-card border border-appBorder-card rounded-xl shadow-2xl overflow-hidden max-h-56 flex flex-col ${
              isPositioned ? 'transition-opacity duration-150' : ''
            }`}
          >
            {/* حقل البحث */}
            <div className="p-2 border-b border-appBorder-card sticky top-0 bg-dark-card z-10">
              <div className="relative flex items-center">
                <Search
                  className={`w-4 h-4 absolute ${
                    isArabic ? 'right-3' : 'left-3'
                  } text-appText-sub pointer-events-none`}
                />
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isArabic ? 'ابحث باسم الدولة أو الكود...' : 'Search country or code...'
                  }
                  className={`w-full ${
                    isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'
                  } py-1.5 bg-dark-input border border-appBorder-input rounded-lg text-appText-main text-xs focus:outline-none focus:border-appBorder-hover placeholder:text-appText-sub/50`}
                />
              </div>
            </div>

            {/* قائمة العناصر */}
            <div className="overflow-y-auto flex-1 custom-scrollbar p-1 space-y-0.5 bg-dark-card">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full ${
                      isArabic ? 'text-right' : 'text-left'
                    } px-2.5 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      value === c.code
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-appText-main hover:bg-dark-input active:bg-dark-input'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{c.flag}</span>
                      <span className="truncate">{isArabic ? c.nameAr : c.nameEn}</span>
                      <span className="text-appText-sub dir-ltr">({c.dialCode})</span>
                    </span>
                    {value === c.code && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-appText-sub">
                  {isArabic ? 'لم يتم العثور على نتائج' : 'No countries found'}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
