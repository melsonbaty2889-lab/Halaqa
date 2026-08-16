import React, { useState, useRef, useEffect } from 'react';
import { Coins, ChevronDown } from 'lucide-react';

export default function CurrencySelector({ isRtl, currency, setCurrency }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // قائمة العملات الشاملة المطابقة لصفحة الإعدادات والهيدر
  const currencies = [
    { code: 'EGP', symbol: 'ج.م', labelAr: 'جنيه مصري', labelEn: 'EGP' },
    { code: 'SAR', symbol: 'ر.س', labelAr: 'ريال سعودي', labelEn: 'SAR' },
    { code: 'AED', symbol: 'د.إ', labelAr: 'درهم إماراتي', labelEn: 'AED' },
    { code: 'KWD', symbol: 'د.ك', labelAr: 'دينار كويتي', labelEn: 'KWD' },
    { code: 'QAR', symbol: 'ر.ق', labelAr: 'ريال قطري', labelEn: 'QAR' },
    { code: 'OMR', symbol: 'ر.ع.', labelAr: 'ريال عماني', labelEn: 'OMR' },
    { code: 'BHD', symbol: 'د.ب.', labelAr: 'دينار بحريني', labelEn: 'BHD' },
    { code: 'JOD', symbol: 'د.أ', labelAr: 'دينار أردني', labelEn: 'JOD' },
    { code: 'MAD', symbol: 'د.م.', labelAr: 'درهم مغربي', labelEn: 'MAD' },
    { code: 'USD', symbol: '$', labelAr: 'دولار أمريكي', labelEn: 'US Dollar' },
    { code: 'EUR', symbol: '€', labelAr: 'يورو', labelEn: 'Euro' },
    { code: 'GBP', symbol: '£', labelAr: 'جنيه إسترليني', labelEn: 'GBP' },
    { code: 'CAD', symbol: 'CA$', labelAr: 'دولار كندي', labelEn: 'CAD' },
    { code: 'TRY', symbol: '₺', labelAr: 'ليرة تركية', labelEn: 'TRY' },
    { code: 'AUD', symbol: 'A$', labelAr: 'دولار أسترالي', labelEn: 'AUD' },
  ];

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    if (setCurrency) {
      setCurrency(code);
    }
    setIsOpen(false);
  };

  const currentCurrencyObj = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* زر اختيار العملة */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all duration-200 focus:outline-none cursor-pointer"
      >
        <Coins className="text-amber-400 w-3.5 h-3.5" />
        <span className="font-semibold">{currentCurrencyObj.code}</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-44 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden text-xs max-h-60 overflow-y-auto scrollbar-thin ${
            isRtl ? 'left-0' : 'right-0'
          }`}
        >
          <div className="py-1 divide-y divide-slate-800/50">
            {currencies.map((item) => (
              <button
                type="button"
                key={item.code}
                onClick={() => handleSelect(item.code)}
                className={`w-full px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                  isRtl ? 'text-right' : 'text-left'
                } ${
                  currency === item.code
                    ? 'bg-amber-500/10 text-amber-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span>{isRtl ? item.labelAr : item.labelEn}</span>
                <span className="text-[10px] text-slate-500 font-mono">{item.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
