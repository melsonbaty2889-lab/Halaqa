import React, { useState } from 'react';
import { Search, X, Check } from 'lucide-react';

export default function SelectModal({ isOpen, onClose, title, options = [], selectedValue, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // تصفية القائمة بناءً على البحث
  const filteredOptions = options.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    const label = (item.label || '').toLowerCase();
    const subLabel = (item.subLabel || '').toLowerCase();
    const code = (item.value || '').toLowerCase();
    return label.includes(term) || subLabel.includes(term) || code.includes(term);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
        
        {/* رأس النافذة */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#172033]">
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* حقل البحث */}
        <div className="p-4 border-b border-slate-800/60 bg-[#111827]">
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث..."
              className="w-full pr-11 pl-4 py-2.5 bg-[#192338] text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700/50 focus:outline-none focus:border-amber-500/70 text-sm transition"
              autoFocus
            />
          </div>
        </div>

        {/* قائمة الخيارات */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1 custom-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((item) => {
              const isSelected = selectedValue === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition duration-150 ${
                    isSelected
                      ? 'bg-amber-500/10 border border-amber-500/40 text-amber-400'
                      : 'hover:bg-[#192338] text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <span className="text-xl leading-none">{item.icon}</span>}
                    <div className="text-right">
                      <div className="font-semibold text-sm text-slate-100">{item.label}</div>
                      {item.subLabel && <div className="text-xs text-slate-400 mt-0.5">{item.subLabel}</div>}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center">
                      <Check size={13} className="text-amber-400" />
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">لا توجد نتائج مطابقة</div>
          )}
        </div>

      </div>
    </div>
  );
}
