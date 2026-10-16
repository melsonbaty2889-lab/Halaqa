/* src/components/UI/Select.jsx */

import React, { useState, useRef, useEffect, useCallback, forwardRef, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Check, ChevronDown } from 'lucide-react';

const getPrimary = () => 'var(--color-action-primary)';
const getSurface = () => 'var(--color-surface-input)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';
const getTextSub = () => 'var(--color-text-secondary)';
const getDanger = () => 'var(--color-danger)';
const getCardBg = () => 'var(--color-surface-card)';

const selectRegistry = new Map();

const closeOtherSelects = (currentId) => {
  selectRegistry.forEach((closeFn, id) => {
    if (id !== currentId) closeFn();
  });
};

export const Select = forwardRef(({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "اختر...", 
  searchPlaceholder = "بحث...", 
  noOptionsMessage = "لا توجد خيارات متاحة", 
  errorText = "", 
  error = null,
  searchable = true, 
  disabled = false, 
  className = "", 
  style = {}, 
  id: customId,
  title,
  dir = 'rtl',
  t = (key, fallback) => fallback,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUpward: false });
  const [isMobile, setIsMobile] = useState(false);

  const triggerRef = useRef(null);
  const autoId = useId();
  const selectId = customId || autoId;
  const displayError = errorText || error;

  const safeValue = value !== undefined && value !== null ? String(value) : '';
  const selectedOption = options.find(o => o && o.value !== undefined && String(o.value) === safeValue);

  useEffect(() => {
    const closeMe = () => setIsOpen(false);
    selectRegistry.set(selectId, closeMe);
    return () => selectRegistry.delete(selectId);
  }, [selectId]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const minWidth = 220;
      const computedWidth = Math.max(rect.width, minWidth);
      
      let leftPos = rect.left;
      if (leftPos + computedWidth > window.innerWidth) {
        leftPos = window.innerWidth - computedWidth - 12;
      }
      if (leftPos < 12) leftPos = 12;

      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < 220 && rect.top > 220;

      setCoords({
        top: openUpward ? rect.top - 8 : rect.bottom + 4,
        left: leftPos,
        width: computedWidth,
        openUpward
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isMobile) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, isMobile, updatePosition]);

  useEffect(() => {
    if (isOpen && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isMobile]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const query = searchTerm.toLowerCase().trim();
    return options.filter((opt) => {
      const labelMatch = String(opt?.label || '').toLowerCase().includes(query);
      const subLabelMatch = String(opt?.subLabel || '').toLowerCase().includes(query);
      const valueMatch = String(opt?.value || '').toLowerCase().includes(query);
      return labelMatch || subLabelMatch || valueMatch;
    });
  }, [options, searchTerm]);

  const shouldShowSearch = searchable && options.length > 5;

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      closeOtherSelects(selectId);
    }
    setSearchTerm('');
    setIsOpen(prev => !prev);
  }, [isOpen, disabled, updatePosition, selectId]);

  const handleOptionSelect = (optionValue) => {
    if (typeof onChange === 'function') {
      onChange(optionValue);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box", position: "relative" }} dir={dir}>
      {label && (
        <label 
          htmlFor={selectId}
          style={{ fontSize: "0.8rem", color: displayError ? getDanger() : getPrimary(), marginBottom: 6, display: "block", fontWeight: 600, textAlign: "start" }}
        >
          {label}
        </label>
      )}
      
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={`ui-select ${className}`}
        style={{
          width: "100%",
          minHeight: "42px",
          background: getSurface(),
          border: displayError ? `1px solid ${getDanger()}` : (isOpen ? `1px solid ${getPrimary()}` : `1px solid ${getBorder()}`),
          borderRadius: 10,
          padding: "8px 12px",
          color: selectedOption ? getTextTitle() : getTextSub(),
          fontFamily: "inherit",
          fontSize: "0.875rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          boxSizing: "border-box",
          boxShadow: isOpen ? `0 0 0 3px ${displayError ? 'color-mix(in srgb, var(--color-danger) 20%, transparent)' : 'var(--color-action-primary-glow)'}` : "none",
          transition: "all 0.2s ease",
          ...style
        }}
        {...props}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption?.label || placeholder || t('common.select', 'اختر...')}
        </span>
        <ChevronDown 
          size={16} 
          style={{ 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
            transition: "transform 0.2s", 
            color: isOpen ? getPrimary() : getTextSub(),
            flexShrink: 0,
            marginRight: dir === 'rtl' ? 0 : 8,
            marginLeft: dir === 'rtl' ? 8 : 0
          }} 
        />
      </button>

      {displayError && (
        <span role="alert" style={{ fontSize: "0.75rem", marginTop: 4, display: "block", textAlign: "start", color: getDanger() }}>
          {displayError}
        </span>
      )}

      {isOpen && typeof window !== 'undefined' && createPortal(
        isMobile ? (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
            dir={dir}
          >
            <div 
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-semantic-borderCard bg-semantic-surfaceCard text-semantic-textPrimary"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3.5 border-b border-semantic-borderInput bg-semantic-surfaceInput/40 shrink-0">
                <h3 className="text-sm font-bold m-0 text-semantic-textPrimary">
                  {title || label || t('common.select_status', 'تصفية بحسب الحالة')}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {shouldShowSearch && (
                <div className="p-3 border-b border-semantic-borderInput shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={searchPlaceholder || t('common.search', 'بحث...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 px-9 border border-semantic-borderInput bg-semantic-surfaceInput text-semantic-textPrimary rounded-xl text-xs outline-none transition focus:border-semantic-actionPrimary"
                      autoFocus
                    />
                    <Search size={14} className={`absolute top-3 ${dir === 'rtl' ? 'right-3' : 'left-3'} text-semantic-textSecondary`} />
                  </div>
                </div>
              )}

              <div className="overflow-y-auto p-2 space-y-1 max-h-[50vh] overscroll-contain">
                {filteredOptions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-semantic-textSecondary">
                    {noOptionsMessage || t('common.noOptions', 'لا توجد خيارات متاحة')}
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = String(option.value) === safeValue;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionSelect(option.value)}
                        className={`w-full flex items-center justify-between p-3 min-h-[44px] rounded-xl text-xs transition text-start cursor-pointer border ${
                          isSelected
                            ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary font-bold border-semantic-actionPrimary/30'
                            : 'border-transparent text-semantic-textPrimary font-medium hover:bg-semantic-surfaceInput'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check size={16} className="shrink-0 ms-2 text-semantic-actionPrimary" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div 
              style={{ position: "fixed", inset: 0, zIndex: 9998 }} 
              onClick={() => setIsOpen(false)} 
            />
            <div
              dir={dir}
              style={{
                position: "fixed",
                ...(coords.openUpward ? { bottom: `${window.innerHeight - coords.top}px` } : { top: `${coords.top}px` }),
                left: coords.left,
                width: coords.width,
                background: getCardBg(),
                border: `1px solid ${getBorder()}`,
                borderRadius: 12,
                padding: "6px 0",
                zIndex: 9999,
                maxHeight: 240,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)"
              }}
            >
              {shouldShowSearch && (
                <div style={{ padding: "6px 10px", borderBottom: `1px solid ${getBorder()}` }}>
                  <input
                    type="text"
                    placeholder={searchPlaceholder || t('common.search', 'بحث...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      fontSize: "0.8rem",
                      borderRadius: 6,
                      border: `1px solid ${getBorder()}`,
                      background: getSurface(),
                      color: getTextTitle(),
                      outline: "none"
                    }}
                  />
                </div>
              )}

              <ul
                role="listbox"
                style={{
                  margin: 0,
                  padding: "4px 0",
                  listStyle: "none",
                  overflowY: "auto",
                  maxHeight: 180,
                  overscrollBehavior: 'contain'
                }}
              >
                {filteredOptions.length === 0 ? (
                  <li style={{ padding: "12px 14px", fontSize: "0.8rem", color: getTextSub(), textAlign: "center" }}>
                    {noOptionsMessage || t('common.noOptions', 'لا توجد خيارات متاحة')}
                  </li>
                ) : (
                  filteredOptions.map((o) => {
                    const isSelected = String(o.value) === safeValue;
                    return (
                      <li
                        key={o.value}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleOptionSelect(o.value)}
                        style={{
                          padding: "10px 14px",
                          minHeight: "38px",
                          fontSize: "0.85rem",
                          color: isSelected ? getPrimary() : getTextTitle(),
                          background: isSelected ? "color-mix(in srgb, var(--color-action-primary) 12%, transparent)" : "transparent",
                          cursor: "pointer",
                          textAlign: "start",
                          fontWeight: isSelected ? 700 : 400,
                          transition: "background 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <span>{o.label}</span>
                        {isSelected && <Check size={16} style={{ color: getPrimary() }} />}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </>
        ),
        document.body
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
