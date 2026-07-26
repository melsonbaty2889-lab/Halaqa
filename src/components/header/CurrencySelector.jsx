import React, { useState, useRef, useEffect } from 'react';
import { FaCoins, FaChevronDown } from 'react-icons/fa';

export default function CurrencySelector({ isRtl, currency, setCurrency }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currencies = [
    { code: 'USD', symbol: '$', labelAr: 'دولار أمريكي', labelEn: 'US Dollar' },
    { code: 'EGP', symbol: 'ج.م', labelAr: 'جنيه مصري', labelEn: 'EGP' },
    { code: 'SAR', symbol: 'ر.س', labelAr: 'ريال سعودي', labelEn: 'SAR' },
    { code: 'EUR', symbol: '€', labelAr: 'يورو', labelEn: 'Euro' },
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
      {/* زر اختار العملة */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all duration-200 focus:outline-none"
      >
        <FaCoins className="text-amber-400 text-xs" />
        <span className="font-semibold">{currentCurrencyObj.code}</span>
        <FaChevronDown className={`text-[10px] text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-36 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden text-xs ${
            isRtl ? 'left-0' : 'right-0'
          }`}
        >
          <div className="py-1 divide-y divide-slate-800/50">
            {currencies.map((item) => (
              <button
                key={item.code}
                onClick={() => handleSelect(item.code)}
                className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors ${
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
