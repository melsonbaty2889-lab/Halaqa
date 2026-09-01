// src/components/UI/CountrySelect.jsx

import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import { Search, ChevronDown, Check, X } from 'lucide-react';
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

  // قفل السكرول في الخلفية أثناء فتح القائمة على الموبايل
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        type="button"
        disabled={disabled}
        onClick={() => {
          setSearchTerm('');
          setIsOpen(true);
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
        <ChevronDown className="w-4 h-4 text-appText-sub shrink-0" />
      </button>

      {/* نافذة اختيار الدولة بألوان الهوية الموحدة */}
      {isOpen &&
        ReactDom.createPortal(
          <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            {/* خلفية للإغلاق عند النقر خارج النافذة */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            {/* محتوى القائمة متوافق مع كروت المشروع */}
            <div
              dir={isArabic ? 'rtl' : 'ltr'}
              className="relative w-full sm:max-w-md bg-dark-card border border-appBorder-card rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[75vh] sm:max-h-[550px] z-10 overflow-hidden animate-in slide-in-from-bottom duration-200"
            >
              {/* الهيدر */}
              <div className="px-4 py-3 border-b border-appBorder-card flex items-center justify-between bg-dark-card">
                <h3 className="text-sm font-semibold text-appText-main">
                  {isArabic ? 'اختر الدولة' : 'Select Country'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-appText-sub hover:text-appText-main rounded-lg hover:bg-dark-input transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* حقل البحث */}
              <div className="p-3 border-b border-appBorder-card bg-dark-card">
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
                      isArabic
                        ? 'ابحث باسم الدولة أو كود الاتصال...'
                        : 'Search country or code...'
                    }
                    className={`w-full ${
                      isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    } py-2 bg-dark-input border border-appBorder-input rounded-xl text-appText-main text-xs focus:outline-none focus:border-appBorder-hover placeholder:text-appText-sub/50`}
                  />
                </div>
              </div>

              {/* قائمة الدول */}
              <div className="overflow-y-auto flex-1 custom-scrollbar p-2 space-y-1 bg-dark-card">
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
                      } px-3 py-2.5 text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                        value === c.code
                          ? 'bg-primary/20 text-primary font-semibold'
                          : 'text-appText-main hover:bg-dark-input active:bg-dark-input'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span className="text-base">{c.flag}</span>
                        <span className="truncate">{isArabic ? c.nameAr : c.nameEn}</span>
                        <span className="text-appText-sub dir-ltr">({c.dialCode})</span>
                      </span>
                      {value === c.code && (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-appText-sub">
                    {isArabic ? 'لم يتم العثور على نتائج' : 'No countries found'}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
