// src/components/UI/CustomSelect.jsx

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUpward: false });

  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // حساب الموقع بدقة مع ميزة الفتح للأعلى (Smart Positioning)
  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < 220 && rect.top > 220;

      setCoords({
        top: openUpward ? rect.top - 6 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openUpward,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateCoords();

      // إعادة حساب المكان أثناء السكرول بدلاً من إغلاق القائمة فوراً
      const handleScroll = (e) => {
        if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
        updateCoords();
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updateCoords);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updateCoords);
      };
    }
  }, [isOpen]);

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
    <div className="relative w-full text-start" ref={containerRef} dir={isRtl ? 'rtl' : 'ltr'}>
      {label && (
        <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
          {label}
        </label>
      )}

      {/* زر فتح القائمة */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`app-input w-full flex items-center justify-between cursor-pointer text-start transition-all disabled:opacity-50 ${
          error ? 'border-rose-500' : ''
        }`}
      >
        <span className={`truncate text-xs ${selectedOption ? 'text-[var(--text-main)] font-semibold' : 'text-[var(--text-muted)]'}`}>
          {selectedOption ? selectedOption.label : resolvedPlaceholder}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[var(--primary)]' : 'text-[var(--text-sub)]'
          }`}
        />
      </button>

      {error && <p className="text-rose-400 text-[10px] mt-1">{error}</p>}

      {/* القائمة المنسدلة عبر Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            id="portal-select-dropdown"
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              position: 'fixed',
              top: coords.openUpward ? 'auto' : `${coords.top}px`,
              bottom: coords.openUpward ? `${window.innerHeight - coords.top}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            className="max-h-56 overflow-y-auto bg-[#0A101D] border border-[var(--border-card)] rounded-xl shadow-2xl z-[999999] p-1 space-y-0.5 custom-scrollbar animate-in fade-in zoom-in-95 duration-100"
          >
            {searchable && (
              <div className="sticky top-0 p-1 bg-[#0A101D] z-10 border-b border-[var(--border-card)] pb-1.5 mb-1">
                <div className="relative flex items-center">
                  <Search size={12} className="absolute start-2.5 text-[var(--text-sub)] pointer-events-none" />
                  <input
                    type="text"
                    placeholder={resolvedSearchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-input)] rounded-lg ps-7 pe-2 py-1 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--text-muted)] text-start"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[var(--text-sub)] text-center">
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
                    className={`w-full text-start px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomSelect;
