import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { COUNTRIES_LIST } from '@/constants/countries';

// تحديد أهم الدول الأكثر شيوعاً لوضعها في البداية
const POPULAR_COUNTRY_CODES = ['EG', 'SA', 'AE', 'KW', 'QA', 'OM', 'BH', 'JO'];

export default function CountrySelect({ value, onChange, isArabic = true }) {
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

  // تصفية الدول بحسب البحث
  const filteredCountries = COUNTRIES_LIST.filter((c) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      c.nameAr.toLowerCase().includes(search) ||
      c.nameEn?.toLowerCase().includes(search) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search)
    );
  });

  const popularCountries = COUNTRIES_LIST.filter((c) => POPULAR_COUNTRY_CODES.includes(c.code));

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* زر عرض الدولة المختارة */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-primary-500 transition-colors flex items-center justify-between"
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2">
            <span>{selectedCountry.flag}</span>
            <span className="text-slate-200">{isArabic ? selectedCountry.nameAr : selectedCountry.nameEn}</span>
            <span className="text-xs text-slate-400 dir-ltr">({selectedCountry.dialCode})</span>
          </span>
        ) : (
          <span className="text-slate-500">{isArabic ? 'اختر الدولة...' : 'Select Country...'}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* القائمة المنسدلة مع حقل البحث */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          
          {/* حقل البحث الداخلي */}
          <div className="p-2 border-b border-slate-800 sticky top-0 bg-slate-900">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute right-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isArabic ? 'ابحث باسم الدولة أو كود الاتصال...' : 'Search country or code...'}
                className="w-full pr-9 pl-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-primary-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* قائمة العناصر */}
          <div className="overflow-y-auto flex-1 custom-scrollbar p-1">
            {searchTerm === '' && (
              <>
                <div className="px-2 py-1 text-[10px] font-bold text-primary-400 uppercase tracking-wider">
                  {isArabic ? 'الدول الأكثر استخداماً' : 'Popular Countries'}
                </div>
                {popularCountries.map((c) => (
                  <button
                    key={`popular-${c.code}`}
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-right px-2.5 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                      value === c.code ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{isArabic ? c.nameAr : c.nameEn}</span>
                      <span className="text-slate-400 dir-ltr">({c.dialCode})</span>
                    </span>
                    {value === c.code && <Check className="w-3.5 h-3.5 text-primary-400" />}
                  </button>
                ))}
                <div className="my-1 border-t border-slate-800" />
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isArabic ? 'جميع الدول' : 'All Countries'}
                </div>
              </>
            )}

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
                  className={`w-full text-right px-2.5 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                    value === c.code ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{isArabic ? c.nameAr : c.nameEn}</span>
                    <span className="text-slate-400 dir-ltr">({c.dialCode})</span>
                  </span>
                  {value === c.code && <Check className="w-3.5 h-3.5 text-primary-400" />}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                {isArabic ? 'لم يتم العثور على نتائج' : 'No countries found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
      }
