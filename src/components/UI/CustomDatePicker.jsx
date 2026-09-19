/* src/components/UI/CustomDatePicker.jsx */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Globe, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import C from '@/theme/colors';
import CustomSelect from './CustomSelect';
import { 
  HIJRI_MONTHS, 
  getHijriParts, 
  formatHijriDate, 
  getSavedHijriOffset, 
  setSavedHijriOffset,
  toArNums,
  toUrNums,
  calculateAge
} from '@/utils/dateUtils';

export default function CustomDatePicker({ 
  selectedDate, 
  onChange, 
  variant = 'grid', // 'grid' | 'compact' | 'select'
  showHijriToggle = true,
  showSightAdjustment = true,
  showAge = false,
  className = ''
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const cleanLang = currentLang.toLowerCase().split('-')[0];
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : ['ar', 'ur'].includes(cleanLang);
  const usesArNums = ['ar', 'ur'].includes(cleanLang);

  const [useHijri, setUseHijri] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hijriOffset, setHijriOffsetState] = useState(getSavedHijriOffset());
  const dropdownRef = useRef(null);

  // تحويل التاريخ المدخل إلى كيان Date
  const dateObj = useMemo(() => {
    if (!selectedDate) return new Date();
    if (selectedDate instanceof Date) return selectedDate;
    if (typeof selectedDate === 'string') {
      const [year, month, day] = selectedDate.split('-').map(Number);
      if (year && month) return new Date(year, month - 1, day || 1);
    }
    const parsed = new Date(selectedDate);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [selectedDate]);

  const [viewDate, setViewDate] = useState(dateObj);

  useEffect(() => {
    setViewDate(dateObj);
  }, [dateObj]);

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
      return String(selectedDate);
    }
  }, [selectedDate, currentLang, useHijri, dateObj, hijriOffset]);

  const formatNum = (num) => {
    if (cleanLang === 'ur') return toUrNums(num);
    return usesArNums ? toArNums(num) : num;
  };

  const handleSelectDate = (dateStr) => {
    if (typeof onChange === 'function') {
      onChange(dateStr);
    }
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const now = new Date();
    const str = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    handleSelectDate(str);
  };

  // ألوان نظام التصميم الدلالية المعتمة الصلبة
  const actionPrimary = C.semantic?.actionPrimary || '#38BDF8';
  const surfaceInput = C.semantic?.surfaceInput || '#1E293B';
  const surfaceCard = C.semantic?.surfaceCard || '#0F172A';
  const bgPage = C.semantic?.bgPage || '#020617';
  const borderInput = C.semantic?.borderInput || '#334155';
  const textPrimary = C.semantic?.textPrimary || '#F8FAFC';
  const textSecondary = C.semantic?.textSecondary || '#94A3B8';
  const textMuted = C.semantic?.textMuted || '#64748B';

  const dateIsoString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

  const age = (showAge && dateObj) ? calculateAge(dateObj) : null;

  // -------------------------------------------------------------
  // النمط 3: Select Dropdowns Variant
  // -------------------------------------------------------------
  if (variant === 'select') {
    const gDay = dateObj.getDate();
    const gMonth = dateObj.getMonth();
    const gYear = dateObj.getFullYear();

    const currentGregorianYear = new Date().getFullYear();
    const daysInMonth = new Date(gYear, gMonth + 1, 0).getDate();

    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => ({
      label: formatNum(i + 1),
      value: i + 1
    }));

    const monthOptions = Array.from({ length: 12 }, (_, idx) => ({
      label: new Intl.DateTimeFormat(cleanLang, { month: 'long' }).format(new Date(2026, idx, 1)),
      value: idx
    }));

    const yearOptions = [
      { label: t('datePicker.selectYearPlaceholder', 'السنة...'), value: '' },
      ...Array.from({ length: 100 }, (_, i) => {
        const y = currentGregorianYear - i;
        return { label: formatNum(y), value: y };
      })
    ];

    const handleSelectChange = (d, m, y) => {
      const safeD = d || 1;
      const safeM = m ?? 0;
      const safeY = y || currentGregorianYear;
      const newD = new Date(safeY, safeM, safeD);
      const str = `${newD.getFullYear()}-${String(newD.getMonth() + 1).padStart(2, '0')}-${String(newD.getDate()).padStart(2, '0')}`;
      handleSelectDate(str);
    };

    return (
      <div className={`flex flex-col w-full space-y-2 text-start ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {showAge && age !== null && (
          <div className="flex justify-end mb-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded border" style={{ color: actionPrimary, backgroundColor: surfaceInput, borderColor: borderInput }}>
              {t('datePicker.ageFormat', `العمر: ${formatNum(age)} سنة`)}
            </span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          <CustomSelect options={dayOptions} value={gDay} onChange={(v) => handleSelectChange(v, gMonth, gYear)} isArabic={isRtl} lang={cleanLang} t={t} />
          <CustomSelect options={monthOptions} value={gMonth} onChange={(v) => handleSelectChange(gDay, v, gYear)} isArabic={isRtl} lang={cleanLang} t={t} />
          <CustomSelect options={yearOptions} value={gYear} onChange={(v) => handleSelectChange(gDay, gMonth, v)} isArabic={isRtl} lang={cleanLang} t={t} />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // النمط 1 و 2: Grid Variant & Compact Bar Variant
  // -------------------------------------------------------------
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const firstDayOfWeek = (() => {
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return isRtl ? (day + 1) % 7 : day;
  })();

  const weekDays = (() => {
    const days = [];
    const refDate = new Date(2026, 7, 1);
    const startOffset = isRtl ? 0 : 1;
    for (let i = 0; i < 7; i++) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() + startOffset + i);
      days.push(new Intl.DateTimeFormat(currentLang, { weekday: 'narrow' }).format(d));
    }
    return days;
  })();

  // خيارات الأشهر والسنين للتنقل السريع
  const nowYear = new Date().getFullYear();
  const monthSelectOptions = Array.from({ length: 12 }, (_, idx) => ({
    label: new Intl.DateTimeFormat(cleanLang, { month: 'short' }).format(new Date(2026, idx, 1)),
    value: idx
  }));

  const yearSelectOptions = Array.from({ length: 90 }, (_, idx) => {
    const y = nowYear - 70 + idx;
    return { label: formatNum(y), value: y };
  });

  return (
    <div ref={dropdownRef} className={`relative inline-block z-40 ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* الشريط الإرشادي/الزناد (Trigger Container) */}
      <div 
        className="flex items-center gap-2 rounded-xl border px-3 py-1.5 whitespace-nowrap min-h-[44px] flex-wrap sm:flex-nowrap"
        style={{ backgroundColor: surfaceInput, borderColor: borderInput }}
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
            {formatNum(dateIsoString)}
          </span>
        </button>

        <span style={{ color: textMuted }}>|</span>

        <span className="text-xs font-bold" style={{ color: actionPrimary }}>
          {formattedDisplayDate}
        </span>

        {showHijriToggle && (
          <button
            type="button"
            onClick={() => setUseHijri(!useHijri)}
            aria-label={t('reports.toggleCalendarType', 'تغيير نوع التقويم')}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer border transition-all"
            style={{
              backgroundColor: useHijri ? 'var(--primary-glow, rgba(56,189,248,0.15))' : bgPage,
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
        )}
      </div>

      {/* النافذة المنبثقة للتقويم مع حل الشفافية نهائياً (Solid Background & Overlay) */}
      {isOpen && (
        <div 
          className="absolute top-[110%] z-50 rounded-2xl p-3.5 border shadow-2xl w-72 transition-all"
          style={{
            backgroundColor: surfaceCard,
            borderColor: borderInput,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
            [isRtl ? 'right' : 'left']: 0
          }}
        >
          {/* اختيار الشهر والسنة السريع لسهولة اختيار التاريخ والتنقل */}
          {!useHijri ? (
            <div className="flex items-center justify-between gap-1 mb-3">
              <button 
                type="button" 
                onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} 
                aria-label={t('common.prevMonth', 'الشهر السابق')}
                className="p-1 rounded-lg border cursor-pointer flex items-center justify-center min-w-[30px] min-h-[30px]"
                style={{ backgroundColor: surfaceInput, borderColor: borderInput, color: textPrimary }}
              >
                {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>

              <div className="flex items-center gap-1 flex-1 px-1">
                <div className="w-1/2">
                  <CustomSelect
                    options={monthSelectOptions}
                    value={currentMonth}
                    onChange={(m) => setViewDate(new Date(currentYear, Number(m), 1))}
                    isArabic={isRtl}
                    lang={cleanLang}
                    t={t}
                  />
                </div>
                <div className="w-1/2">
                  <CustomSelect
                    options={yearSelectOptions}
                    value={currentYear}
                    onChange={(y) => setViewDate(new Date(Number(y), currentMonth, 1))}
                    isArabic={isRtl}
                    lang={cleanLang}
                    t={t}
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} 
                aria-label={t('common.nextMonth', 'الشهر التالي')}
                className="p-1 rounded-lg border cursor-pointer flex items-center justify-center min-w-[30px] min-h-[30px]"
                style={{ backgroundColor: surfaceInput, borderColor: borderInput, color: textPrimary }}
              >
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center mb-3">
              <button 
                type="button" 
                onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} 
                aria-label={t('common.prevMonth', 'الشهر السابق')}
                className="p-1 rounded-lg border cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
                style={{ backgroundColor: surfaceInput, borderColor: borderInput, color: textPrimary }}
              >
                {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>

              <span className="text-xs font-bold" style={{ color: textPrimary }}>
                {(() => {
                  const { month, year } = getHijriParts(viewDate, hijriOffset);
                  const monthsList = HIJRI_MONTHS[cleanLang] || HIJRI_MONTHS.ar;
                  const monthName = monthsList[month] || monthsList[0];
                  const suffix = isRtl ? 'هـ' : 'AH';
                  return `${monthName} ${formatNum(year)} ${suffix}`;
                })()}
              </span>

              <button 
                type="button" 
                onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} 
                aria-label={t('common.nextMonth', 'الشهر التالي')}
                className="p-1 rounded-lg border cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
                style={{ backgroundColor: surfaceInput, borderColor: borderInput, color: textPrimary }}
              >
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          )}

          {/* أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-0.5 text-center mb-1.5">
            {weekDays.map((d, i) => (
              <span key={i} className="text-[10px] font-semibold" style={{ color: textSecondary }}>
                {d}
              </span>
            ))}
          </div>

          {/* شبكة الأيام مع وضوح الأرقام وسهولة النقر */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = dateStr === dateIsoString;
              
              const dayObj = new Date(currentYear, currentMonth, dayNum);
              const rawDisplayNum = useHijri ? getHijriParts(dayObj, hijriOffset).day : dayNum;
              const displayNum = formatNum(rawDisplayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDate(dateStr)}
                  className="py-1.5 text-xs rounded-md border-0 cursor-pointer transition-all font-semibold hover:opacity-90 active:scale-95"
                  style={{
                    backgroundColor: isSelected ? actionPrimary : surfaceInput,
                    color: isSelected ? bgPage : textPrimary,
                    fontWeight: isSelected ? '800' : '600'
                  }}
                >
                  {displayNum}
                </button>
              );
            })}
          </div>

          {/* تعديل رؤية الهلال للهجري */}
          {useHijri && showSightAdjustment && (
            <div className="mt-2.5 pt-2 border-t flex items-center justify-between" style={{ borderColor: borderInput }}>
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

          {/* أزرار اختيار "اليوم" والإغلاق */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t" style={{ borderColor: borderInput }}>
            <button
              type="button"
              onClick={handleSelectToday}
              className="py-1.5 text-xs font-bold rounded-lg border-0 cursor-pointer transition-all"
              style={{
                backgroundColor: surfaceInput,
                color: actionPrimary
              }}
            >
              {t('common.today', 'اليوم')}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t('common.close', 'إغلاق')}
              className="py-1.5 text-xs font-semibold rounded-lg border-0 cursor-pointer transition-all"
              style={{
                backgroundColor: borderInput,
                color: textPrimary
              }}
            >
              {t('common.close', 'إغلاق')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
