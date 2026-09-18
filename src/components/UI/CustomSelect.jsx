/* src/components/UI/CustomSelect.jsx */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, offset, shift, flip } from '@floating-ui/react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import C from '@/theme/colors';

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
  className = '',
  id,
  isArabic = true,
  lang = 'ar',
  t = (key, fallback) => fallback,
}) => {
  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = isArabic !== undefined ? isArabic : ['ar', 'ur'].includes(cleanLang);

  const resolvedPlaceholder = placeholder || t('common.select', 'اختر...');
  const resolvedSearchPlaceholder = searchPlaceholder || t('common.search', 'بحث...');
  const resolvedNoOptionsMessage = noOptionsMessage || t('common.noOptions', 'لا توجد خيارات متاحة');

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const bgMain = C?.dark?.bg || '#0F172A';
  const bgSurface = C?.dark?.surface || '#1E293B';
  const borderCol = C?.dark?.borderInput || C?.inputs?.border || '#334155';
  const titleColor = C?.text?.title || '#F8FAFC';
  const subColor = C?.text?.sub || C?.text?.muted || '#94A3B8';
  const errorColor = C?.error?.DEFAULT || '#EF4444';
  const primaryColor = C?.amber?.DEFAULT || C?.primary?.DEFAULT || '#38BDF8';

  const { x, y, strategy, refs, elements, isPositioned } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    strategy: 'fixed',
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ fallbackPlacements: ['top-start', 'bottom-start'] }),
      shift({ padding: 8 }),
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
    <div className={`relative w-full text-start ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {label && (
        <label 
          htmlFor={id}
          className="block text-xs font-bold mb-1.5 transition-colors select-none"
          style={{ color: titleColor }}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        ref={refs.setReference}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label || resolvedPlaceholder}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSearchTerm('');
          setIsOpen((prev) => !prev);
        }}
        className="w-full flex items-center justify-between cursor-pointer text-start transition-all duration-200 min-h-[42px] px-2 py-2 rounded-xl border focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none"
        style={{
          backgroundColor: bgMain,
          borderColor: error ? errorColor : (isOpen ? primaryColor : borderCol),
          color: titleColor
        }}
      >
        <span 
          className="text-[11px] whitespace-nowrap overflow-hidden text-center w-full"
          style={{ 
            fontWeight: selectedOption ? '600' : '400',
            color: selectedOption ? titleColor : subColor 
          }}
        >
          {selectedOption ? selectedOption.label : resolvedPlaceholder}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 shrink-0 ms-1 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: isOpen ? primaryColor : subColor }}
        />
      </button>

      {error && (
        <p className="text-[11px] mt-1.5 font-medium" style={{ color: errorColor }}>
          {error}
        </p>
      )}

      {/* Floating Dropdown Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={refs.setFloating}
            id="portal-select-dropdown"
            role="listbox"
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              position: strategy,
              top: `${y ?? 0}px`,
              left: `${x ?? 0}px`,
              minWidth: elements.reference ? `${elements.reference.getBoundingClientRect().width}px` : 'auto',
              zIndex: 999999,
              opacity: isPositioned ? 1 : 0,
              visibility: isPositioned ? 'visible' : 'hidden',
              backgroundColor: bgSurface,
              borderColor: borderCol,
            }}
            className={`overflow-hidden border rounded-xl shadow-2xl flex flex-col max-h-56 ${
              isPositioned ? 'transition-opacity duration-150' : ''
            }`}
          >
            {searchable && (
              <div 
                className="p-2 border-b sticky top-0 z-10"
                style={{ backgroundColor: bgSurface, borderColor: borderCol }}
              >
                <div className="relative flex items-center">
                  <Search 
                    size={14} 
                    className="absolute pointer-events-none" 
                    style={{
                      right: isRtl ? '0.75rem' : 'auto',
                      left: isRtl ? 'auto' : '0.75rem',
                      color: subColor
                    }}
                  />
                  <input
                    type="text"
                    placeholder={resolvedSearchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={resolvedSearchPlaceholder}
                    className="w-full rounded-lg text-xs focus:outline-none transition-all text-start border"
                    style={{
                      paddingRight: isRtl ? '2.25rem' : '0.75rem',
                      paddingLeft: isRtl ? '0.75rem' : '2.25rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem',
                      backgroundColor: bgMain,
                      borderColor: borderCol,
                      color: titleColor
                    }}
                  />
                </div>
              </div>
            )}

            <div 
              className="overflow-y-auto flex-1 custom-scrollbar p-1 space-y-0.5"
              style={{ backgroundColor: bgSurface }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-xs text-center font-medium" style={{ color: subColor }}>
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
                      role="option"
                      aria-selected={isSelected}
                      onClick={(e) => handleSelect(e, opt.value)}
                      className="w-full text-start px-2.5 py-2 text-xs rounded-lg flex items-center justify-between gap-2 transition-all duration-150 cursor-pointer focus:outline-none select-none min-h-[36px]"
                      style={{
                        backgroundColor: isSelected ? `${primaryColor}20` : 'transparent',
                        color: isSelected ? primaryColor : titleColor,
                        fontWeight: isSelected ? '600' : '400'
                      }}
                    >
                      <span className="whitespace-nowrap">{opt.label}</span>
                      {isSelected && (
                        <Check 
                          size={14} 
                          className="shrink-0 ms-2" 
                          style={{ color: primaryColor }}
                        />
                      )}
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
