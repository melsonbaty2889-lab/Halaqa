import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { COUNTRIES_LIST, COUNTRIES_MAP } from '@/constants/countries';

export default function CountrySelect({
  value = 'EG',
  onChange = () => {},
  disabled = false,
  showDialCode = false,
  lang = 'ar',
  isArabic,
  isRtl,
  t = (k, d) => d
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const effectiveIsRtl = isRtl !== undefined ? isRtl : (isArabic !== undefined ? isArabic : lang === 'ar' || lang === 'ur');

  const selectedCountry = COUNTRIES_MAP[value?.toUpperCase()] || COUNTRIES_LIST.find((c) => c.code === value) || COUNTRIES_LIST[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES_LIST.filter((country) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameAr = (country.nameAr || '').toLowerCase();
    const nameEn = (country.nameEn || '').toLowerCase();
    const dialCode = (country.dialCode || '').toLowerCase();
    return nameAr.includes(query) || nameEn.includes(query) || dialCode.includes(query);
  });

  const handleSelect = (code) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const selectedName = lang === 'ar' ? selectedCountry?.nameAr : selectedCountry?.nameEn;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg border border-semantic-borderCard bg-semantic-surfaceCard text-semantic-textPrimary hover:bg-semantic-surfaceCard/80 transition-colors disabled:opacity-50 h-10"
      >
        <span className="flex items-center gap-2 truncate">
          <span>{selectedCountry?.flag}</span>
          {showDialCode ? (
            <span dir="ltr" className="text-semantic-textSecondary font-mono">
              ({selectedCountry?.dialCode})
            </span>
          ) : (
            <span className="truncate text-semantic-textPrimary">{selectedName}</span>
          )}
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform text-semantic-textSecondary ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute z-[60] mt-1 w-full max-w-sm min-w-[240px] max-h-60 rounded-lg border border-semantic-borderCard bg-semantic-surfaceCard shadow-2xl flex flex-col ${
            effectiveIsRtl ? 'right-0' : 'left-0'
          }`}
        >
          <div className="p-2 border-b border-semantic-borderCard sticky top-0 bg-semantic-surfaceCard z-10">
            <div className="relative flex items-center">
              <Search size={14} className={`absolute ${effectiveIsRtl ? 'right-2.5' : 'left-2.5'} text-semantic-textSecondary`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchCountry', 'بحث عن دولة...')}
                className={`w-full text-xs py-1.5 bg-semantic-surfaceBackground text-semantic-textPrimary rounded border border-semantic-borderCard focus:outline-none focus:border-semantic-actionPrimary ${
                  effectiveIsRtl ? 'pr-8 pl-2' : 'pl-8 pr-2'
                }`}
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-1 space-y-0.5 custom-scrollbar">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCountry?.code;
                const countryName = lang === 'ar' ? country.nameAr : country.nameEn;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded transition-colors gap-2 ${
                      isSelected
                        ? 'bg-semantic-actionPrimary/10 text-semantic-actionPrimary font-bold'
                        : 'text-semantic-textPrimary hover:bg-semantic-surfaceBackground'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="shrink-0">{country.flag}</span>
                      <span className="text-right leading-tight whitespace-normal">{countryName}</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0 text-semantic-textSecondary">
                      {showDialCode && <span dir="ltr" className="font-mono">({country.dialCode})</span>}
                      {isSelected && <Check size={14} className="text-semantic-actionPrimary shrink-0" />}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-semantic-textSecondary">
                {t('common.noResults', 'لا توجد نتائج')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
