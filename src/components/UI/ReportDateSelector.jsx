import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Globe, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import C from '@/theme/colors';
import { 
  HIJRI_MONTHS, 
  getHijriParts, 
  formatHijriDate, 
  getSavedHijriOffset, 
  setSavedHijriOffset,
  toArNums 
} from '@/utils/dateUtils';

export default function ReportDateSelector({ selectedDate, setSelectedDate }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  
  const cleanLang = currentLang.toLowerCase().split('-')[0];
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : ['ar', 'ur'].includes(cleanLang);
  const usesArNums = ['ar', 'ur'].includes(cleanLang);

  const [useHijri, setUseHijri] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hijriOffset, setHijriOffsetState] = useState(getSavedHijriOffset());
  const dropdownRef = useRef(null);

  const dateObj = useMemo(() => {
    if (!selectedDate) return new Date();
    const [year, month, day] = selectedDate.split('-').map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  }, [selectedDate]);

  const [viewDate, setViewDate] = useState(dateObj);

  useEffect(() => {
    setViewDate(dateObj);
  }, [selectedDate, dateObj]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOffsetChange = (newOffset) => {
    setHijriOffsetState(newOffset);
    setSavedHijriOffset(newOffset);
  };

  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      if (useHijri) {
        return formatHijriDate(dateObj, currentLang, hijriOffset);
      }
      return new Intl.DateTimeFormat(currentLang, {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(dateObj);
    } catch (e) {
      return selectedDate;
    }
  }, [selectedDate, currentLang, useHijri, dateObj, hijriOffset]);

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const headerTitle = useMemo(() => {
    if (useHijri) {
      const { month, year } = getHijriParts(viewDate, hijriOffset);
      const monthsList = HIJRI_MONTHS[cleanLang] || HIJRI_MONTHS.en;
      const monthName = monthsList[month] || monthsList[0];
      const suffix = isRtl ? 'هـ' : 'AH';
      const yearFormatted = usesArNums ? toArNums(year) : year;
      return `${monthName} ${yearFormatted} ${suffix}`;
    }
    return new Intl.DateTimeFormat(currentLang, { month: 'long', year: 'numeric' }).format(viewDate);
  }, [viewDate, useHijri, cleanLang, isRtl, usesArNums, currentLang, hijriOffset]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const firstDayOfWeek = useMemo(() => {
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return isRtl ? (day + 1) % 7 : day;
  }, [currentYear, currentMonth, isRtl]);

  const weekDays = useMemo(() => {
    const days = [];
    const refDate = new Date(2026, 7, 1);
    const startOffset = isRtl ? 0 : 1;

    for (let i = 0; i < 7; i++) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() + startOffset + i);
      days.push(new Intl.DateTimeFormat(currentLang, { weekday: 'narrow' }).format(d));
    }
    return days;
  }, [currentLang, isRtl]);

  // الربط التام بطبقة الألوان الدلالية من دليل نظام التصميم
  const actionPrimary = C.semantic?.actionPrimary || 'var(--color-action-primary)';
  const surfaceInput = C.semantic?.surfaceInput || 'var(--color-surface-input)';
  const surfaceCard = C.semantic?.surfaceCard || 'var(--color-surface-card)';
  const bgPage = C.semantic?.bgPage || 'var(--color-bg-page)';
  const borderInput = C.semantic?.borderInput || 'var(--color-border-input)';
  const textPrimary = C.semantic?.textPrimary || 'var(--color-text-primary)';
  const textSecondary = C.semantic?.textSecondary || 'var(--color-text-secondary)';
  const textMuted = C.semantic?.textMuted || 'var(--color-text-muted)';

  const formatNum = (num) => (usesArNums ? toArNums(num) : num);

  return (
    <div ref={dropdownRef} className="relative inline-block z-40" dir={isRtl ? 'rtl' : 'ltr'}>
      <div 
        className="flex items-center gap-2 rounded-xl border px-3 py-1.5 whitespace-nowrap min-h-[44px] flex-wrap sm:flex-nowrap"
        style={{
          backgroundColor: surfaceInput,
          borderColor: borderInput
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('reports.selectDate', 'اختر التاريخ')}
          className="flex items-center gap-1.5 bg-transparent border-0 cursor-pointer text-xs font-semibold p-0"
          style={{ color: actionPrimary }}
        >
          <CalendarIcon size={16} />
          <span style={{ color: textPrimary }}>
            {formatNum(selectedDate)}
          </span>
        </button>

        <span style={{ color: textMuted }}>|</span>

        <span className="text-xs font-bold" style={{ color: actionPrimary }}>
          {formattedDisplayDate}
        </span>

        <button
          type="button"
          onClick={() => setUseHijri(!useHijri)}
          aria-label={t('reports.toggleCalendarType', 'تغيير نوع التقويم')}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer border transition-all"
          style={{
            backgroundColor: useHijri ? 'var(--primary-glow)' : bgPage,
            color: useHijri ? actionPrimary : textSecondary,
            borderColor: useHijri ? actionPrimary : borderInput
          }}
        >
          <Globe size={12} />
          <span>
            {useHijri 
              ? t('common.hijri', 'هجري') 
              : t('common.gregorian', 'ميلادي')}
          </span>
        </button>
      </div>

      {isOpen && (
        <div 
          className="absolute top-[110%] z-50 rounded-2xl p-3 border shadow-2xl w-64 transition-all"
          style={{
            backgroundColor: surfaceCard,
            borderColor: borderInput,
            [isRtl ? 'right' : 'left']: 0
          }}
        >
          <div className="flex justify-between items-center mb-2.5">
            <button 
              type="button" 
              onClick={handlePrevMonth} 
              aria-label={t('common.prevMonth', 'الشهر السابق')}
              className="p-1 rounded-lg border cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
              style={{ backgroundColor: surfaceInput, borderColor: borderInput, color: textPrimary }}
            >
              {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <span className="text-xs font-bold" style={{ color: textPrimary }}>
              {headerTitle}
            </span>
            <button 
              type="button" 
              onClick={handleNextMonth} 
              aria-label={t('common.nextMonth', 'الشهر التالي')}
              className="p-1 rounded-lg border cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
              style={{ backgroundColor: surfaceInput, borderColor: borderInput, color: textPrimary }}
            >
              {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center mb-1.5">
            {weekDays.map((d, i) => (
              <span key={i} className="text-[10px] font-semibold" style={{ color: textSecondary }}>
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDate;
              
              const dayObj = new Date(currentYear, currentMonth, dayNum);
              const rawDisplayNum = useHijri ? getHijriParts(dayObj, hijriOffset).day : dayNum;
              const displayNum = formatNum(rawDisplayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => { setSelectedDate(dateStr); setIsOpen(false); }}
                  className="py-1.5 text-xs rounded-md border-0 cursor-pointer transition-all font-semibold"
                  style={{
                    backgroundColor: isSelected ? actionPrimary : surfaceInput,
                    color: isSelected ? bgPage : textPrimary,
                    fontWeight: isSelected ? '800' : '500'
                  }}
                >
                  {displayNum}
                </button>
              );
            })}
          </div>

          {useHijri && (
            <div 
              className="mt-2.5 pt-2 border-t flex items-center justify-between"
              style={{ borderColor: borderInput }}
            >
              <span className="text-[10px] flex items-center gap-1 font-medium" style={{ color: textSecondary }}>
                <Settings2 size={12} /> {t('reports.sightAdjustment', 'تعديل الرؤية:')}
              </span>
              <div className="flex gap-1">
                {[-1, 0, 1].map((offset) => (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => handleOffsetChange(offset)}
                    className="px-1.5 py-0.5 text-[10px] rounded border-0 cursor-pointer font-bold"
                    style={{
                      backgroundColor: hijriOffset === offset ? actionPrimary : surfaceInput,
                      color: hijriOffset === offset ? bgPage : textSecondary
                    }}
                  >
                    {offset > 0 ? `+${formatNum(offset)}` : formatNum(offset)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={t('common.close', 'إغلاق')}
            className="w-full mt-2.5 py-1.5 text-xs font-semibold rounded-lg border-0 cursor-pointer transition-all min-h-[36px]"
            style={{
              backgroundColor: borderInput,
              color: textPrimary
            }}
          >
            {t('common.close', 'إغلاق')}
          </button>
        </div>
      )}
    </div>
  );
}
