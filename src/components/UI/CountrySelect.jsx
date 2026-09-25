import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { COUNTRIES_LIST, COUNTRIES_MAP } from '@/constants/countries';

export default function CountrySelect({
  value = '',
  onChange = () => {},
  lang = 'ar',
  isArabic = true,
  t = (key, fallback) => fallback
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedCountry = COUNTRIES_MAP[value] || COUNTRIES_LIST.find((c) => c.code === value) || COUNTRIES_LIST[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES_LIST.filter((country) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nameAr = (country.nameAr || '').toLowerCase();
    const nameEn = (country.nameEn || '').toLowerCase();
    const code = (country.code || '').toLowerCase();
    const dialCode = (country.dialCode || '').toLowerCase();
    return (
      nameAr.includes(term) ||
      nameEn.includes(term) ||
      code.includes(term) ||
      dialCode.includes(term)
    );
  });

  const handleSelect = (code) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* زر فتح القائمة */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[42px] px-2.5 py-2 bg-semantic-surfaceBorder/20 border border-semantic-borderCard rounded-lg text-semantic-textPrimary flex items-center justify-between gap-1.5 hover:border-semantic-actionPrimary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-semantic-actionPrimary"
      >
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <span className="text-base shrink-0">{selectedCountry?.flag}</span>
          <span className="text-xs text-semantic-textSecondary shrink-0 dir-ltr font-mono">
            ({selectedCountry?.dialCode})
          </span>
          <span className="text-xs truncate text-semantic-textPrimary">
            {isArabic ? selectedCountry?.nameAr : selectedCountry?.nameEn}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 text-semantic-textSecondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div className="absolute top-full mt-1 z-50 w-64 max-w-[85vw] bg-semantic-surfaceCard border border-semantic-borderCard rounded-lg shadow-xl overflow-hidden start-0">
          {/* حقل البحث */}
          <div className="p-2 border-b border-semantic-borderCard bg-semantic-surfaceBorder/10">
            <div className="relative flex items-center">
              <Search
                size={14}
                className="absolute start-2.5 text-semantic-textSecondary pointer-events-none"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.searchCountry', 'ابحث باسم الدولة أو الكود...')}
                className="w-full h-8 start-0 ps-8 pe-2.5 text-xs bg-semantic-surfaceBorder/20 border border-semantic-borderCard rounded-md text-semantic-textPrimary placeholder:text-semantic-textSecondary/60 focus:outline-none focus:border-semantic-actionPrimary"
                autoFocus
              />
            </div>
          </div>

          {/* قائمة الدول */}
          <div className="max-h-48 overflow-y-auto divide-y divide-semantic-borderCard/30">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCountry?.code;
                const countryName = isArabic ? country.nameAr : country.nameEn;

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.code)}
                    className={`w-full px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors hover:bg-semantic-actionPrimary/10 ${
                      isSelected
                        ? 'bg-semantic-actionPrimary/15 font-bold text-semantic-actionPrimary'
                        : 'text-semantic-textPrimary'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base shrink-0">{country.flag}</span>
                      <span className="truncate">{countryName}</span>
                      <span className="text-[11px] text-semantic-textSecondary dir-ltr shrink-0 font-mono">
                        ({country.dialCode})
                      </span>
                    </div>

                    {isSelected && (
                      <Check size={14} className="shrink-0 text-semantic-actionPrimary" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-xs text-center text-semantic-textSecondary">
                {t('common.noResults', 'لا توجد نتائج')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
