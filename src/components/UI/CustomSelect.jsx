import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, offset, shift, size, flip } from '@floating-ui/react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { C } from '@/theme/colors';

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
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  const resolvedPlaceholder = placeholder || t('common.select', 'اختر من القائمة...');
  const resolvedSearchPlaceholder = searchPlaceholder || t('common.search', 'بحث...');
  const resolvedNoOptionsMessage = noOptionsMessage || t('common.noOptions', 'لا توجد خيارات متاحة');

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { x, y, strategy, refs, elements, isPositioned } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    strategy: 'fixed',
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ fallbackPlacements: ['top-start', 'bottom-start'] }),
      shift({ padding: 10 }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(240, availableHeight - 16)}px`,
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
    <div className={`relative w-full text-start ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {label && (
        <label 
          htmlFor={id}
          className="block text-xs font-bold mb-1.5 transition-colors select-none text-appText-main"
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
        className={`app-input w-full flex items-center justify-between cursor-pointer text-start transition-all duration-200 min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-dark-input focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed select-none ${
          error ? 'border-appError' : (isOpen ? 'border-primary' : 'border-appBorder-input')
        }`}
      >
        <span className={`truncate text-xs ${selectedOption ? 'font-semibold text-appText-main' : 'text-appText-muted'}`}>
          {selectedOption ? selectedOption.label : resolvedPlaceholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 shrink-0 ms-2 ${
            isOpen ? 'rotate-180 text-primary' : 'text-appText-muted'
          }`}
        />
      </button>

      {error && (
        <p className="text-[11px] mt-1.5 font-medium text-appError">
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
              zIndex: 999999,
              opacity: isPositioned ? 1 : 0,
              visibility: isPositioned ? 'visible' : 'hidden',
            }}
            className={`overflow-hidden border border-appBorder-card rounded-xl shadow-2xl flex flex-col bg-dark-card backdrop-blur-md ${
              isPositioned ? 'transition-opacity duration-150' : ''
            }`}
          >
            {searchable && (
              <div className="p-2 border-b border-appBorder-card sticky top-0 z-10 bg-dark-card">
                <div className="relative flex items-center">
                  <Search 
                    size={14} 
                    className="absolute start-3 pointer-events-none text-appText-muted" 
                  />
                  <input
                    type="text"
                    placeholder={resolvedSearchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={resolvedSearchPlaceholder}
                    className="w-full rounded-lg ps-8 pe-3 py-2 text-xs focus:outline-none transition-all text-start bg-dark-input border border-appBorder-input text-appText-main"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="overflow-y-auto flex-1 custom-scrollbar p-1.5 space-y-1 bg-dark-card">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-xs text-center font-medium text-appText-muted">
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
                      className={`w-full text-start px-3 py-2.5 min-h-[40px] text-xs rounded-lg flex items-center justify-between transition-all duration-150 cursor-pointer active:scale-[0.99] focus:outline-none select-none ${
                        isSelected
                          ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                          : 'text-appText-main hover:bg-dark-input hover:text-white'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check 
                          size={15} 
                          className="shrink-0 ms-2 text-primary" 
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
