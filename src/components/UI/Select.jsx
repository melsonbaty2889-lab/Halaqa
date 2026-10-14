/* src/components/UI/Select.jsx */

import React, { useState, useRef, useEffect, useCallback, forwardRef, useId, useMemo } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

const getPrimary = () => 'var(--color-action-primary)';
const getSurface = () => 'var(--color-surface-input)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';
const getTextSub = () => 'var(--color-text-secondary)';
const getDanger = () => 'var(--color-danger)';
const getCardBg = () => 'var(--color-surface-card)';

// سجل عام لإدارة القوائم المنسدلة المفتوحة لضمان فتح قائمة واحدة فقط في نفس الوقت
const selectRegistry = new Map();

const closeOtherSelects = (currentId) => {
  selectRegistry.forEach((closeFn, id) => {
    if (id !== currentId) {
      closeFn();
    }
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
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const autoId = useId();
  const selectId = customId || autoId;
  const displayError = errorText || error;

  const safeValue = value !== undefined && value !== null ? String(value) : '';
  const selectedOption = options.find(o => o && o.value !== undefined && String(o.value) === safeValue);

  // تسجيل وإلغاء القائمة من السجل العام
  useEffect(() => {
    const closeMe = () => setIsOpen(false);
    selectRegistry.set(selectId, closeMe);
    return () => {
      selectRegistry.delete(selectId);
    };
  }, [selectId]);

  // إغلاق القائمة عند النقر في أي مكان خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // تصفية الخيارات بناءً على نص البحث
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
      closeOtherSelects(selectId);
    }
    setSearchTerm('');
    setActiveIndex(-1);
    setIsOpen(prev => !prev);
  }, [isOpen, disabled, selectId]);

  const handleOptionSelect = (optionValue) => {
    if (typeof onChange === 'function') {
      onChange(optionValue);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[activeIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} style={{ width: "100%", boxSizing: "border-box", position: "relative" }} dir={dir}>
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
        onKeyDown={handleKeyDown}
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

      {/* قائمة الخيارات المنسدلة المطلقة المحصورة داخل المودال تماماً */}
      {isOpen && (
        <div
          dir={dir}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: getCardBg(),
            border: `1px solid ${getBorder()}`,
            borderRadius: 12,
            padding: "6px 0",
            zIndex: 50,
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
                onKeyDown={handleKeyDown}
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
              filteredOptions.map((o, idx) => {
                const isSelected = String(o.value) === safeValue;
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={o.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleOptionSelect(o.value)}
                    style={{
                      padding: "10px 14px",
                      minHeight: "40px",
                      fontSize: "0.875rem",
                      color: isSelected || isActive ? getPrimary() : getTextTitle(),
                      background: isActive ? "color-mix(in srgb, var(--color-action-primary) 20%, transparent)" : (isSelected ? "color-mix(in srgb, var(--color-action-primary) 12%, transparent)" : "transparent"),
                      cursor: "pointer",
                      textAlign: "start",
                      fontWeight: isSelected ? 700 : 400,
                      transition: "background 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>{o.label}</span>
                      {o.subLabel && (
                        <span style={{ fontSize: "0.7rem", color: getTextSub() }}>{o.subLabel}</span>
                      )}
                    </div>
                    {isSelected && <Check size={16} style={{ color: getPrimary() }} />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
