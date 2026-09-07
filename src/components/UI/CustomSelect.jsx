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
          className="block text-xs font-bold mb-1.5 transition-colors select-none"
          style={{ color: C.text?.title }}
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
        className="app-input w-full flex items-center justify-between cursor-pointer text-start transition-all duration-200 min-h-[44px] px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed select-none"
        style={{
          backgroundColor: C.inputs?.bg || C.dark?.surface,
          borderColor: error ? C.error?.DEFAULT : (isOpen ? C.amber?.DEFAULT || C.inputs?.borderFocus : C.inputs?.border),
          color: selectedOption ? C.text?.title : C.text?.placeholder,
        }}
      >
        <span className={`truncate text-xs ${selectedOption ? 'font-semibold' : ''}`}>
          {selectedOption ? selectedOption.label : resolvedPlaceholder}
        </span>
        <ChevronDown
          size={16}
          className="transition-transform duration-200 shrink-0 ms-2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: isOpen ? C.amber?.DEFAULT : C.text?.muted,
          }}
        />
      </button>

      {error && (
        <p className="text-[11px] mt-1.5 font-medium" style={{ color: C.error?.DEFAULT }}>
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
              backgroundColor: C.dark?.card || C.dark?.bg,
              borderColor: C.dark?.cardBorder || C.inputs?.border,
            }}
            className={`overflow-hidden border rounded-xl shadow-2xl flex flex-col backdrop-blur-md ${
              isPositioned ? 'transition-opacity duration-150' : ''
            }`}
          >
            {searchable && (
              <div 
                className="p-2 border-b sticky top-0 z-10"
                style={{
                  backgroundColor: C.dark?.card || C.dark?.bg,
                  borderColor: C.dark?.cardBorder || C.inputs?.border,
                }}
              >
                <div className="relative flex items-center">
                  <Search 
                    size={14} 
                    className="absolute start-3 pointer-events-none" 
                    style={{ color: C.text?.muted }}
                  />
                  <input
                    type="text"
                    placeholder={resolvedSearchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={resolvedSearchPlaceholder}
                    className="w-full rounded-lg ps-8 pe-3 py-2 text-xs focus:outline-none transition-all text-start"
                    style={{
                      backgroundColor: C.dark?.surface || C.inputs?.bg,
                      borderColor: C.inputs?.border,
                      color: C.text?.title,
                      borderWidth: '1px',
                    }}
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div 
              className="overflow-y-auto flex-1 custom-scrollbar p-1.5 space-y-1"
              style={{ backgroundColor: C.dark?.card || C.dark?.bg }}
            >
              {filteredOptions.length === 0 ? (
                <div 
                  className="px-3 py-4 text-xs text-center font-medium"
                  style={{ color: C.text?.muted }}
                >
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
                      className="w-full text-start px-3 py-2.5 min-h-[40px] text-xs rounded-lg flex items-center justify-between transition-all duration-150 cursor-pointer active:scale-[0.99] focus:outline-none select-none"
                      style={{
                        backgroundColor: isSelected ? C.amber?.DEFAULT : 'transparent',
                        color: isSelected ? C.dark?.bg : C.text?.body,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = C.dark?.surface || 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.color = C.text?.title;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = C.text?.body;
                        }
                      }}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check 
                          size={15} 
                          className="shrink-0 ms-2" 
                          style={{ color: C.dark?.bg }}
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
