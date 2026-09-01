import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, offset, shift, size, flip } from '@floating-ui/react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CustomSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  noOptionsMessage,
  error = null,
  searchable = false,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  const resolvedPlaceholder = placeholder || t('common.select', isRtl ? 'اختر من القائمة...' : 'Select...');
  const resolvedSearchPlaceholder = searchPlaceholder || t('common.search', isRtl ? 'بحث...' : 'Search...');
  const resolvedNoOptionsMessage = noOptionsMessage || t('common.noOptions', isRtl ? 'لا توجد خيارات متاحة' : 'No options available');

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // استخدام flip بدلاً من autoPlacement لضبط الالتصاق تحت/فوق الحقل مباشرة بدون قفز
  const { x, y, strategy, refs, elements, isPositioned } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    strategy: 'fixed',
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4), // مسافة بسيطة ومحددة جداً بين الحقل والقائمة
      flip({ fallbackPlacements: ['top-start', 'bottom-start'] }),
      shift({ padding: 10 }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(220, availableHeight - 16)}px`,
          });
        },
      }),
    ],
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      const refEl = elements.reference;
      const floatEl = elements.floating;

      if (
        refEl &&
        !refEl.contains(event.target) &&
        floatEl &&
        !floatEl.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen, elements]);

  const safeValue = value !== undefined && value !== null ? String(value) : '';

  const selectedOption = options.find(
    (opt) => opt && opt.value !== undefined && String(opt.value) === safeValue
  );

  const filteredOptions = options.filter((opt) => {
    if (!searchable || !searchTerm.trim()) return true;
    return String(opt?.label || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelect = (e, optionValue) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof onChange === 'function') {
      onChange(optionValue);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full text-start" dir={isRtl ? 'rtl' : 'ltr'}>
      {label && (
        <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={refs.setReference}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSearchTerm('');
          setIsOpen((prev) => !prev);
        }}
        className={`app-input w-full flex items-center justify-between cursor-pointer text-start transition-all disabled:opacity-50 ${
          error ? 'border-rose-500' : ''
        }`}
      >
        <span className={`truncate text-xs ${selectedOption ? 'text-[#FFFFFF] font-semibold' : 'text-[#94A3B8]'}`}>
          {selectedOption ? selectedOption.label : resolvedPlaceholder}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#E07A00]' : 'text-[#94A3B8]'
          }`}
        />
      </button>

      {error && <p className="text-rose-400 text-[10px] mt-1">{error}</p>}

      {/* Floating Dropdown Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={refs.setFloating}
            id="portal-select-dropdown"
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              position: strategy,
              top: `${y ?? 0}px`,
              left: `${x ?? 0}px`,
              zIndex: 999999,
              opacity: isPositioned ? 1 : 0,
              visibility: isPositioned ? 'visible' : 'hidden',
            }}
            /* bg-[#0F172A] خلفية معتمة بالكامل لمنع الشفافية والتداخل */
            className={`overflow-hidden bg-[#0F172A] border border-[#1B2738] rounded-xl shadow-2xl flex flex-col ${
              isPositioned ? 'transition-opacity duration-150' : ''
            }`}
          >
            {searchable && (
              <div className="p-2 border-b border-[#1B2738] sticky top-0 bg-[#0F172A] z-10">
                <div className="relative flex items-center">
                  <Search size={14} className="absolute start-3 text-[#94A3B8] pointer-events-none" />
                  <input
                    type="text"
                    placeholder={resolvedSearchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-full bg-[#0A101D] border border-[#1B2738] rounded-lg ps-8 pe-3 py-1.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#E07A00] placeholder:text-[#475569] text-start"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-1 custom-scrollbar p-1 space-y-0.5 bg-[#0F172A]">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-xs text-[#94A3B8] text-center">
                  {resolvedNoOptionsMessage}
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const optVal = opt?.value !== undefined ? String(opt.value) : String(idx);
                  const isSelected = optVal === safeValue;
                  return (
                    <button
                      key={optVal || idx}
                      type="button"
                      onClick={(e) => handleSelect(e, opt.value)}
                      /* 🎨 الضبط الصريح للألوان: المختار برتقالي بكلام أبيض ناصع، والباقي أبيض وواضح جودة عالية */
                      className={`w-full text-start px-3 py-2.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#E07A00] text-[#FFFFFF] font-bold shadow-md'
                          : 'text-[#F1F5F9] hover:bg-[#162032] hover:text-[#FFFFFF] active:bg-[#1E293B]'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check size={14} className="shrink-0 text-[#FFFFFF]" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomSelect;
