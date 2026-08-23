import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ options = [], value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = useMemo(() => options.find(o => o.value === value), [options, value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-2.5 bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-xl text-xs text-[var(--text-main,#FFFFFF)] flex items-center justify-between transition-all focus:outline-none"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`text-[var(--text-sub,#94A3B8)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--surface-card,rgba(15,23,42,0.95))] border border-[var(--border-card,rgba(255,255,255,0.08))] rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto backdrop-blur-md">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full p-2.5 text-right text-xs flex items-center justify-between transition-colors ${
                value === opt.value
                  ? 'bg-[var(--primary,#E07A00)]/10 text-[var(--primary,#E07A00)] font-bold'
                  : 'text-[var(--text-main,#FFFFFF)] hover:bg-[var(--surface-input,#0A101D)]'
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={13} className="text-[var(--primary,#E07A00)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
