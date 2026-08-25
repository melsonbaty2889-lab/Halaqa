import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'اختر من القائمة...',
  error = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-slate-800 border ${
          error ? 'border-rose-500' : 'border-slate-700'
        } rounded-xl px-3 py-2.5 text-right text-sm text-slate-100 flex items-center justify-between focus:outline-none focus:border-primary-500 transition-all cursor-pointer`}
      >
        <span className={selectedOption ? 'text-slate-100 font-medium' : 'text-slate-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary-400' : ''
          }`}
        />
      </button>

      {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500 text-center">
              لا توجد خيارات متاحة
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-right px-3 py-2.5 text-sm rounded-lg flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-primary-500/15 text-primary-400 font-semibold'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary-400" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
