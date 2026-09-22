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
  t = (key, fallback) => fallback,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const triggerRef = useRef(null);
  const autoId = useId();
  const selectId = customId || autoId;
  const displayError = errorText || error;

  const safeValue = value !== undefined && value !== null ? String(value) : '';
  const selectedOption = options.find(o => o && o.value !== undefined && String(o.value) === safeValue);

  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // قفل تمرير الصفحة الخلفية عند فتح القائمة المنبثقة
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

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

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 220)
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

  // إيقاف تسرب التمرير أثناء استخدام اللمس للجوال
  const handleOverlayTouchMove = (e) => {
    e.stopPropagation();
  };

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
          padding: "10px 14px",
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
            shrink: 0,
            marginStart: 8
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
          /* وضع الهواتف المحمولة (Select Modal) */
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
            onTouchMove={handleOverlayTouchMove}
          >
            <div 
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-semantic-borderCard bg-semantic-surfaceCard text-semantic-textPrimary"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* الهيدر */}
              <div className="flex items-center justify-between p-3.5 border-b border-semantic-borderInput bg-semantic-surfaceInput/40 shrink-0">
                <h3 className="text-sm font-bold m-0 text-semantic-textPrimary">
                  {title || label || placeholder}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title={t('common.close', 'إغلاق')}
                  aria-label={t('common.close', 'إغلاق')}
                  className="p-1.5 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary"
                >
                  <X size={18} />
                </button>
              </div>

              {/* حقل البحث */}
              {(searchable || options.length > 5) && (
                <div className="p-3 border-b border-semantic-borderInput shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={searchPlaceholder || t('common.search', 'بحث...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 px-9 border border-semantic-borderInput bg-semantic-surfaceInput text-semantic-textPrimary rounded-xl text-xs outline-none transition focus:border-semantic-actionPrimary"
                    />
                    <Search 
                      size={14} 
                      className="absolute top-3 start-3 text-semantic-textSecondary" 
                    />
                  </div>
                </div>
              )}

              {/* قائمة الخيارات */}
              <div 
                className="overflow-y-auto p-2 space-y-1 max-h-[50vh] overscroll-contain"
                style={{ overscrollBehavior: 'contain' }}
                onTouchMove={(e) => e.stopPropagation()}
              >
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
                        <div className="flex flex-col gap-0.5">
                          <span>{option.label}</span>
                          {option.subLabel && (
                            <span className="text-[10px] font-normal text-semantic-textSecondary">
                              {option.subLabel}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check 
                            size={16} 
                            className="shrink-0 ms-2 text-semantic-actionPrimary" 
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        ) : (
          /* وضع الشاشات الكبيرة (Desktop Dropdown) */
          <>
            <div 
              style={{ position: "fixed", inset: 0, zIndex: 9998 }} 
              onClick={() => setIsOpen(false)} 
            />
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
                maxHeight: 280,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)"
              }}
            >
              {(searchable || options.length > 5) && (
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
                  maxHeight: 220,
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
          </>
        ),
        document.body
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
