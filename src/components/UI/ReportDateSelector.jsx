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
      const yearFormatted = isRtl ? toArNums(year) : year;
      return `${monthName} ${yearFormatted} ${suffix}`;
    }
    return new Intl.DateTimeFormat(currentLang, { month: 'long', year: 'numeric' }).format(viewDate);
  }, [viewDate, useHijri, cleanLang, isRtl, currentLang, hijriOffset]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const weekDays = useMemo(() => {
    const days = [];
    const refDate = new Date(2026, 7, 2);
    for (let i = 0; i < 7; i++) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() + i);
      days.push(new Intl.DateTimeFormat(currentLang, { weekday: 'narrow' }).format(d));
    }
    return days;
  }, [currentLang]);

  const primaryColor = C.amber?.DEFAULT || C.primary?.DEFAULT || '#38BDF8';
  const surfaceBg = C.dark?.surface || '#1E293B';
  const borderCol = C.dark?.borderInput || C.inputs?.border || '#334155';
  const mainBg = C.dark?.bg || '#0F172A';
  const titleColor = C.text?.title || '#F8FAFC';
  const subColor = C.text?.sub || C.text?.muted || '#94A3B8';

  return (
    <div ref={dropdownRef} className="relative inline-block" dir={isRtl ? 'rtl' : 'ltr'}>
      <div 
        className="flex items-center gap-2 rounded-xl border px-3 py-1.5 whitespace-nowrap min-h-[44px]"
        style={{
          backgroundColor: surfaceBg,
          borderColor: borderCol
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('reports.selectDate', 'اختر التاريخ')}
          className="flex items-center gap-1.5 bg-transparent border-0 cursor-pointer text-xs font-semibold p-0"
          style={{ color: primaryColor }}
        >
          <CalendarIcon size={16} />
          <span style={{ color: titleColor }}>
            {isRtl ? toArNums(selectedDate) : selectedDate}
          </span>
        </button>

        <span style={{ color: C.text?.muted || '#475569' }}>|</span>

        <span className="text-xs font-bold" style={{ color: primaryColor }}>
          {formattedDisplayDate}
        </span>

        <button
          type="button"
          onClick={() => setUseHijri(!useHijri)}
          aria-label={t('reports.toggleCalendarType', 'تبديل التقويم')}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer border transition-all"
          style={{
            backgroundColor: useHijri ? `${primaryColor}20` : mainBg,
            color: useHijri ? primaryColor : subColor,
            borderColor: useHijri ? primaryColor : borderCol
          }}
        >
          <Globe size={12} />
          <span>
            {useHijri 
              ? t('common.hijri', isRtl ? 'هجري' : 'Hijri') 
              : t('common.gregorian', isRtl ? 'ميلادي' : 'Gregorian')}
          </span>
        </button>
      </div>

      {isOpen && (
        <div 
          className="absolute top-[110%] z-50 rounded-2xl p-3 border shadow-2xl w-64 transition-all"
          style={{
            backgroundColor: mainBg,
            borderColor: borderCol,
            [isRtl ? 'right' : 'left']: 0
          }}
        >
          <div className="flex justify-between items-center mb-2.5">
            <button 
              type="button" 
              onClick={handlePrevMonth} 
              aria-label={t('common.prevMonth', 'الشهر السابق')}
              className="p-1 rounded-lg border cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
              style={{ backgroundColor: surfaceBg, borderColor: borderCol, color: titleColor }}
            >
              {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <span className="text-xs font-bold" style={{ color: titleColor }}>
              {headerTitle}
            </span>
            <button 
              type="button" 
              onClick={handleNextMonth} 
              aria-label={t('common.nextMonth', 'الشهر التالي')}
              className="p-1 rounded-lg border cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
              style={{ backgroundColor: surfaceBg, borderColor: borderCol, color: titleColor }}
            >
              {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center mb-1.5">
            {weekDays.map((d, i) => (
              <span key={i} className="text-[10px] font-semibold" style={{ color: subColor }}>
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
              const displayNum = isRtl ? toArNums(rawDisplayNum) : rawDisplayNum;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => { setSelectedDate(dateStr); setIsOpen(false); }}
                  className="py-1.5 text-xs rounded-md border-0 cursor-pointer transition-all font-semibold"
                  style={{
                    backgroundColor: isSelected ? primaryColor : surfaceBg,
                    color: isSelected ? mainBg : titleColor,
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
              style={{ borderColor: surfaceBg }}
            >
              <span className="text-[10px] flex items-center gap-1 font-medium" style={{ color: subColor }}>
                <Settings2 size={12} /> {t('reports.sightAdjustment', isRtl ? 'تعديل الرؤية:' : 'Sight Adjustment:')}
              </span>
              <div className="flex gap-1">
                {[-1, 0, 1].map((offset) => (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => handleOffsetChange(offset)}
                    className="px-1.5 py-0.5 text-[10px] rounded border-0 cursor-pointer font-bold"
                    style={{
                      backgroundColor: hijriOffset === offset ? primaryColor : surfaceBg,
                      color: hijriOffset === offset ? mainBg : subColor
                    }}
                  >
                    {offset > 0 ? (isRtl ? `+${toArNums(offset)}` : `+${offset}`) : (isRtl ? toArNums(offset) : offset)}
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
              backgroundColor: borderCol,
              color: titleColor
            }}
          >
            {t('common.close', isRtl ? 'إغلاق' : 'Close')}
          </button>
        </div>
      )}
    </div>
  );
}
