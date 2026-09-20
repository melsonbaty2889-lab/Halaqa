import React, { useState, useRef, useEffect, useCallback, forwardRef, useId } from 'react';
import { createPortal } from 'react-dom';

const getPrimary = () => 'var(--color-action-primary)';
const getSurface = () => 'var(--color-surface-input)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';
const getTextSub = () => 'var(--color-text-secondary)';
const getDanger = () => 'var(--color-danger)';
const getCardBg = () => 'var(--color-surface-card)';

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
  searchable = false, 
  disabled = false, 
  className = "", 
  style = {}, 
  id: customId,
  t = (key, fallback) => fallback,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const autoId = useId();
  const selectId = customId || autoId;
  const displayError = errorText || error;

  const safeValue = value !== undefined && value !== null ? String(value) : '';
  const selectedOption = options.find(o => o && o.value !== undefined && String(o.value) === safeValue);

  const filteredOptions = options.filter(opt => {
    if (!searchable || !searchTerm.trim()) return true;
    return String(opt?.label || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width
      });
    }
    setSearchTerm('');
    setActiveIndex(-1);
    setIsOpen(prev => !prev);
  }, [isOpen, disabled]);

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

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => setIsOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  return (
    <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box", position: "relative" }}>
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
          minHeight: "44px",
          background: getSurface(),
          border: displayError ? `1px solid ${getDanger()}` : (isOpen ? `1px solid ${getPrimary()}` : `1px solid ${getBorder()}`),
          borderRadius: 10,
          padding: "12px 14px",
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
        <span>{selectedOption?.label || placeholder || t('common.select', 'اختر...')}</span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "0.7rem", color: isOpen ? getPrimary() : getTextSub() }}>▼</span>
      </button>

      {displayError && (
        <span role="alert" style={{ fontSize: "0.75rem", marginTop: 4, display: "block", textAlign: "start", color: getDanger() }}>
          {displayError}
        </span>
      )}

      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <div
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              background: getCardBg(),
              border: `1px solid ${getBorder()}`,
              borderRadius: 12,
              padding: "6px 0",
              zIndex: 9999,
              maxHeight: 260,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(12px)"
            }}
          >
            {searchable && (
              <div style={{ padding: "6px 10px", borderBottom: `1px solid ${getBorder()}` }}>
                <input
                  type="text"
                  placeholder={searchPlaceholder || t('common.search', 'بحث...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                  autoFocus
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
                maxHeight: 200
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
                      <span>{o.label}</span>
                      {isSelected && <span style={{ color: getPrimary(), fontSize: "0.8rem" }}>✓</span>}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>,
        document.body
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
