import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';

export default function SelectModal({
  isOpen,
  onClose,
  title,
  options = [],
  selectedValue,
  onSelect,
  isRtl = true
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // تصفية الخيارات بناءً على البحث
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    
    return options.filter((opt) => {
      const labelMatch = opt.label?.toLowerCase().includes(query);
      const subLabelMatch = opt.subLabel?.toLowerCase().includes(query);
      const valueMatch = opt.value?.toLowerCase().includes(query);
      return labelMatch || subLabelMatch || valueMatch;
    });
  }, [options, searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (value) => {
    onSelect(value);
    setSearchQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--surface-card,#0D1526)] border border-[var(--border-input,#1B2738)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* الهيدر */}
        <div className="flex items-center justify-between p-3.5 border-b border-[var(--border-input,#1B2738)] bg-[var(--surface-input,#0A101D)]">
          <h3 className="text-sm font-bold text-[var(--text-main,#FFFFFF)]">{title}</h3>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* حقل البحث (يظهر إذا كان عدد الخيارات أكثر من 5) */}
        {options.length > 5 && (
          <div className="p-3 border-b border-[var(--border-input,#1B2738)]">
            <div className="relative">
              <input
                type="text"
                placeholder={isRtl ? 'بحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-xl text-xs text-[var(--text-main,#FFFFFF)] focus:border-[var(--primary,#E07A00)] outline-none"
                autoFocus
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>
        )}

        {/* قائمة الخيارات */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {filteredOptions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              {isRtl ? 'لا توجد نتائج مطابقة' : 'No options found'}
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition text-right ${
                    isSelected
                      ? 'bg-[var(--primary,#E07A00)]/15 text-[var(--primary,#E07A00)] font-bold'
                      : 'hover:bg-slate-800/60 text-[var(--text-main,#FFFFFF)] font-medium'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span>{option.label}</span>
                    {option.subLabel && (
                      <span className="text-[10px] text-slate-400 font-normal dir-ltr text-right">
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={15} className="text-[var(--primary,#E07A00)] shrink-0" />}
                </button>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
