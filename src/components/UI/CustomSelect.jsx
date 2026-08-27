import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const CustomSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'اختر من القائمة...',
  error = null,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  // تصفية الخيارات بناءً على البحث
  const filteredOptions = searchable && searchTerm
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="relative w-full text-start" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
          {label}
        </label>
      )}

      {/* زر القائمة المنسدلة */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`app-input w-full flex items-center justify-between cursor-pointer text-start transition-all ${
          error ? 'border-rose-500' : ''
        }`}
      >
        <span className={`truncate text-xs ${selectedOption ? 'text-[var(--text-main)] font-semibold' : 'text-[var(--text-muted)]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[var(--primary)]' : 'text-[var(--text-sub)]'
          }`}
        />
      </button>

      {error && <p className="text-rose-400 text-[10px] mt-1">{error}</p>}

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-1 max-h-52 overflow-y-auto bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl shadow-2xl z-50 p-1 space-y-0.5 custom-scrollbar backdrop-blur-md">
          {searchable && (
            <div className="sticky top-0 p-1 bg-[var(--surface-card)] z-10 border-b border-[var(--border-card)] pb-1.5">
              <div className="relative flex items-center">
                <Search size={12} className="absolute right-2.5 text-[var(--text-sub)] pointer-events-none" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--surface-input)] border border-[var(--border-input)] rounded-lg pr-7 pl-2 py-1 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--text-muted)]"
                  autoFocus
                />
              </div>
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[var(--text-sub)] text-center">
              لا توجد خيارات متاحة
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-right px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--primary)] text-white font-bold'
                      : 'text-[var(--text-main)] hover:bg-[var(--surface-input)]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
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
