// src/components/UI/CountrySelect.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { COUNTRIES_LIST } from '@/constants/countries';

export default function CountrySelect({ value, onChange, isArabic = true, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = COUNTRIES_LIST.find((c) => c.code === value);

  // تصفية جميع الدول بحسب حقل البحث
  const filteredCountries = COUNTRIES_LIST.filter((c) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      c.nameAr.toLowerCase().includes(search) ||
      c.nameEn?.toLowerCase().includes(search) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search)
    );
  });

  const defaultPlaceholder = isArabic ? 'اختر الدولة...' : 'Select Country...';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* زر عرض الدولة المختارة */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 bg-dark-input border border-appBorder-input rounded-xl text-appText-main text-sm focus:outline-none focus:border-appBorder-hover transition-colors flex items-center justify-between gap-2"
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
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* القائمة المنسدلة مع حقل البحث */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-dark-card border border-appBorder-card rounded-xl shadow-2xl overflow-hidden max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          
          {/* حقل البحث الداخلي */}
          <div className="p-2 border-b border-appBorder-card sticky top-0 bg-dark-card z-10">
            <div className="relative flex items-center">
              <Search className={`w-4 h-4 absolute ${isArabic ? 'right-3' : 'left-3'} text-appText-sub pointer-events-none`} />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isArabic ? 'ابحث باسم الدولة أو كود الاتصال...' : 'Search country or code...'}
                className={`w-full ${
                  isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'
                } py-1.5 bg-dark-input border border-appBorder-input rounded-lg text-appText-main text-xs focus:outline-none focus:border-appBorder-hover placeholder:text-appText-sub/50`}
              />
            </div>
          </div>

          {/* قائمة العناصر الشاملة */}
          <div className="overflow-y-auto flex-1 custom-scrollbar p-1">
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
                  } px-2.5 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                    value === c.code
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-appText-main hover:bg-dark-input'
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
        </div>
      )}
    </div>
  );
}
