/* src/components/UI/CustomDatePicker.jsx */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, Globe, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import moment from 'moment-hijri';

const HIJRI_MIN_YEAR = 1356;
const HIJRI_MAX_YEAR = 1500;

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const getTodayNoon = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
};

export default function CustomDatePicker({
  value,
  selectedDate,
  onChange = () => {},
  showAge = false,
  disableFuture = false,
  lang = 'ar',
  label,
  t = (key, fallback) => fallback
}) {
  const activeDateValue = value ?? selectedDate;

  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = ['ar', 'ur'].includes(cleanLang);

  const [calendarMode, setCalendarMode] = useState('gregorian');
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const pickerRef = useRef(null);

  // 1. Parsing التاريخ الخارجي بضمان الجودة
  const parsedDate = useMemo(() => {
    if (!activeDateValue) return null;
    let d = null;
    if (typeof activeDateValue === 'string') {
      const cleanStr = activeDateValue.split('T')[0];
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        d = new Date(y, m, day, 12, 0, 0);
      } else {
        d = new Date(activeDateValue);
      }
    } else if (activeDateValue instanceof Date) {
      d = new Date(activeDateValue.getTime());
    }

    return (d && !isNaN(d.getTime())) ? d : null;
  }, [activeDateValue]);

  // 2. إعداد حالات العرض والمزامنة
  const [gregorianView, setGregorianView] = useState(() => {
    const base = parsedDate || getTodayNoon();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const [hijriView, setHijriView] = useState(() => {
    const base = parsedDate || getTodayNoon();
    const m = moment(base);
    const validYear = m.isValid() ? m.iYear() : 1445;
    const validMonth = m.isValid() ? m.iMonth() : 0;
    const hYear = Math.max(HIJRI_MIN_YEAR, Math.min(HIJRI_MAX_YEAR, validYear));
    return { year: hYear, month: validMonth };
  });

  useEffect(() => {
    if (!parsedDate) return;
    setGregorianView({ year: parsedDate.getFullYear(), month: parsedDate.getMonth() });

    const m = moment(parsedDate);
    if (m.isValid()) {
      const calculatedHYear = m.iYear();
      const hYear = Math.max(HIJRI_MIN_YEAR, Math.min(HIJRI_MAX_YEAR, calculatedHYear));
      setHijriView({ year: hYear, month: m.iMonth() });
    }
  }, [parsedDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. حساب العمر
  const computedAge = useMemo(() => {
    if (!parsedDate) return null;
    const today = getTodayNoon();
    let age = today.getFullYear() - parsedDate.getFullYear();
    const monthDiff = today.getMonth() - parsedDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  }, [parsedDate]);

  // 4. تنسيق التاريخ المعروض حماية من NaN
  const formattedDisplayDate = useMemo(() => {
    if (!parsedDate) return null;
    if (calendarMode === 'hijri') {
      const m = moment(parsedDate);
      if (!m.isValid()) return null;
      const day = m.iDate();
      const monthIdx = m.iMonth();
      const year = m.iYear();
      if (isNaN(day) || isNaN(monthIdx) || isNaN(year)) return null;
      const monthName = t(`datePicker.hijriMonths.${monthIdx}`, HIJRI_MONTHS_AR[monthIdx] || '');
      return `${day} ${monthName} ${year}`;
    } else {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    }
  }, [parsedDate, calendarMode, t]);

  // 5. حدود التنقل للـ Future
  const todayNoon = useMemo(() => getTodayNoon(), []);

  const isNextGregorianDisabled = useMemo(() => {
    if (!disableFuture) return false;
    const currentViewDate = new Date(gregorianView.year, gregorianView.month, 1, 12, 0, 0);
    const todayViewDate = new Date(todayNoon.getFullYear(), todayNoon.getMonth(), 1, 12, 0, 0);
    return currentViewDate >= todayViewDate;
  }, [disableFuture, gregorianView, todayNoon]);

  const isNextHijriDisabled = useMemo(() => {
    if (!disableFuture) return false;
    const todayM = moment(todayNoon);
    if (!todayM.isValid()) return false;
    const todayHYear = todayM.iYear();
    const todayHMonth = todayM.iMonth();

    if (hijriView.year > todayHYear) return true;
    if (hijriView.year === todayHYear && hijriView.month >= todayHMonth) return true;
    return false;
  }, [disableFuture, hijriView, todayNoon]);

  // 6. التنقل والانتخاب
  const handleGregorianMonthOffset = (offset) => {
    if (offset > 0 && isNextGregorianDisabled) return;
    setGregorianView((prev) => {
      let newMonth = prev.month + offset;
      let newYear = prev.year;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      return { year: newYear, month: newMonth };
    });
  };

  const handleHijriMonthOffset = (offset) => {
    if (offset > 0 && isNextHijriDisabled) return;
    setHijriView((prev) => {
      let newMonth = prev.month + offset;
      let newYear = prev.year;
      if (newMonth > 11) {
        newMonth = 0;
        newYear = Math.min(HIJRI_MAX_YEAR, newYear + 1);
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear = Math.max(HIJRI_MIN_YEAR, newYear - 1);
      }
      return { year: newYear, month: newMonth };
    });
  };

  const handleGregorianDaySelect = (day) => {
    const selected = new Date(gregorianView.year, gregorianView.month, day, 12, 0, 0);
    if (disableFuture && selected > todayNoon) return;
    onChange(selected);
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const handleHijriDaySelect = (hDay) => {
    try {
      const m = moment(`${hijriView.year}/${hijriView.month + 1}/${hDay}`, 'iYYYY/iM/iD');
      if (m.isValid()) {
        const gDate = m.toDate();
        const safeGregorianDate = new Date(gDate.getFullYear(), gDate.getMonth(), gDate.getDate(), 12, 0, 0);
        if (disableFuture && safeGregorianDate > todayNoon) return;
        onChange(safeGregorianDate);
      }
    } catch (e) {
      console.error('Error parsing hijri date:', e);
    }
    setIsOpen(false);
    setOpenDropdown(null);
  };

  // 7. شبكة الأيام
  const gregorianGrid = useMemo(() => {
    const daysInMonth = new Date(gregorianView.year, gregorianView.month + 1, 0).getDate();
    const firstDayOfWeek = new Date(gregorianView.year, gregorianView.month, 1).getDay();
    return { daysInMonth, firstDayOfWeek };
  }, [gregorianView]);

  const hijriGrid = useMemo(() => {
    try {
      const safeYear = Math.max(HIJRI_MIN_YEAR, Math.min(HIJRI_MAX_YEAR, hijriView.year));
      const startOfMonth = moment(`${safeYear}/${hijriView.month + 1}/1`, 'iYYYY/iM/iD');
      if (startOfMonth.isValid() && !isNaN(startOfMonth.iDaysInMonth())) {
        return { 
          daysInMonth: startOfMonth.iDaysInMonth(), 
          firstDayOfWeek: startOfMonth.day() 
        };
      }
    } catch (e) {
      console.error('Error generating hijri grid:', e);
    }
    return { daysInMonth: 29, firstDayOfWeek: 0 };
  }, [hijriView]);

  // 8. خيارات السنوات والشهور (محدثة لدعم التقارير وإضافة الطالب)
  const gregorianYearsOptions = useMemo(() => {
    const currentY = todayNoon.getFullYear();
    const startYear = disableFuture ? currentY : currentY + 5;
    const endYear = disableFuture ? currentY - 100 : currentY - 30;
    const years = [];
    for (let y = startYear; y >= endYear; y--) {
      years.push(y);
    }
    return years;
  }, [disableFuture, todayNoon]);

  // 8 مكرر. خيارات السنوات الهجرية (محدثة لدعم النطاق المنطقي)
  const hijriYearsOptions = useMemo(() => {
    const todayM = moment(todayNoon);
    const currentHY = todayM.isValid() ? todayM.iYear() : 1448;
     
    const maxHY = disableFuture ? Math.min(HIJRI_MAX_YEAR, currentHY) : Math.min(HIJRI_MAX_YEAR, currentHY + 5);
    const minHY = HIJRI_MIN_YEAR;
    const years = [];
    for (let y = maxHY; y >= minHY; y--) {
      years.push(y);
    }
    return years;
  }, [disableFuture, todayNoon]);

  const isGregorianMonthDisabled = (monthIdx) => {
    if (!disableFuture) return false;
    const checkDate = new Date(gregorianView.year, monthIdx, 1, 12, 0, 0);
    const todayFirstDay = new Date(todayNoon.getFullYear(), todayNoon.getMonth(), 1, 12, 0, 0);
    return checkDate > todayFirstDay;
  };

  const isHijriMonthDisabled = (monthIdx) => {
    if (!disableFuture) return false;
    const todayM = moment(todayNoon);
    if (!todayM.isValid()) return false;
    const todayHYear = todayM.iYear();
    const todayHMonth = todayM.iMonth();

    if (hijriView.year > todayHYear) return true;
    if (hijriView.year === todayHYear && monthIdx > todayHMonth) return true;
    return false;
  };

  const handleSelectToday = () => {
    onChange(getTodayNoon());
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const weekDaysHeaders = useMemo(() => {
    const days = [];
    const baseDate = new Date(2023, 0, 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push(d.toLocaleDateString(cleanLang, { weekday: 'narrow' }));
    }
    return days;
  }, [cleanLang]);

  return (
    <div className="relative w-full text-start" dir={isRtl ? 'rtl' : 'ltr'} ref={pickerRef}>
      
      {/* Label and Age */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-semantic-textSecondary">
          {label || t('datePicker.birthDate', 'تاريخ الميلاد')}
        </label>
        {showAge && (
          <span className="text-[11px] font-bold text-semantic-actionPrimary bg-semantic-surfaceInput px-2 py-0.5 rounded-md border border-semantic-borderInput">
            {t('datePicker.age', 'العمر')}: {computedAge !== null ? `${computedAge} ${t('datePicker.years', 'سنة')}` : '—'}
          </span>
        )}
      </div>

      {/* Main Input Display */}
      <div 
        onClick={() => {
          setIsOpen(!isOpen);
          setOpenDropdown(null);
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={label || t('datePicker.birthDate', 'تاريخ الميلاد')}
        className="flex items-center justify-between p-2.5 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput cursor-pointer hover:border-semantic-actionPrimary transition-all"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-semantic-actionPrimary" />
          <span className={`text-xs font-bold ${formattedDisplayDate ? 'dir-ltr text-semantic-textPrimary' : 'text-semantic-textSecondary'}`}>
            {formattedDisplayDate || t('datePicker.placeholder', 'اختر التاريخ')}
          </span>
        </div>

        <button
          type="button"
          aria-label={calendarMode === 'gregorian' ? t('datePicker.switchToHijri', 'التحويل للهجري') : t('datePicker.switchToGregorian', 'التحويل للميلادي')}
          onClick={(e) => {
            e.stopPropagation();
            setCalendarMode(calendarMode === 'gregorian' ? 'hijri' : 'gregorian');
            setOpenDropdown(null);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-semantic-surfaceCard border border-semantic-borderCard text-[11px] font-bold text-semantic-textSecondary hover:text-semantic-actionPrimary transition-colors"
        >
          <Globe size={13} />
          <span>
            {calendarMode === 'gregorian' 
              ? t('datePicker.gregorian', 'ميلادي') 
              : t('datePicker.hijri', 'هجري')}
          </span>
        </button>
      </div>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-w-sm rounded-2xl border border-semantic-borderCard bg-semantic-surfaceCard p-4 shadow-xl backdrop-blur-md">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-semantic-borderInput gap-1">
            <button
              type="button"
              aria-label={t('datePicker.previousMonth', 'الشهر السابق')}
              onClick={() => {
                calendarMode === 'gregorian' ? handleGregorianMonthOffset(-1) : handleHijriMonthOffset(-1);
                setOpenDropdown(null);
              }}
              className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary"
            >
              {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className="flex items-center gap-2 relative">
              {/* Custom Month Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={openDropdown === 'month'}
                  aria-label={t('datePicker.selectMonth', 'اختر الشهر')}
                  onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
                  className="flex items-center gap-1 text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2.5 py-1.5 hover:border-semantic-actionPrimary transition-colors"
                >
                  <span>
                    {calendarMode === 'gregorian'
                      ? new Date(gregorianView.year, gregorianView.month, 1).toLocaleDateString(cleanLang, { month: 'long' })
                      : t(`datePicker.hijriMonths.${hijriView.month}`, HIJRI_MONTHS_AR[hijriView.month] || '')}
                  </span>
                  <ChevronDown size={14} className="text-semantic-textSecondary" />
                </button>

                {openDropdown === 'month' && (
                  <div className="absolute top-full mt-1 start-0 z-20 max-h-48 w-36 overflow-y-auto rounded-xl border border-semantic-borderCard bg-semantic-surfaceCard py-1 shadow-lg">
                    {calendarMode === 'gregorian'
                      ? Array.from({ length: 12 }, (_, i) => {
                          const disabled = isGregorianMonthDisabled(i);
                          return (
                            <button
                              key={i}
                              type="button"
                              disabled={disabled}
                              aria-disabled={disabled}
                              onClick={() => {
                                if (disabled) return;
                                setGregorianView({ ...gregorianView, month: i });
                                setOpenDropdown(null);
                              }}
                              className={`w-full text-start px-3 py-1.5 text-xs font-semibold transition-colors ${
                                disabled
                                  ? 'opacity-30 cursor-not-allowed text-semantic-textSecondary'
                                  : gregorianView.month === i
                                  ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary'
                                  : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                              }`}
                            >
                              {new Date(gregorianView.year, i, 1).toLocaleDateString(cleanLang, { month: 'long' })}
                            </button>
                          );
                        })
                      : HIJRI_MONTHS_AR.map((mName, idx) => {
                          const disabled = isHijriMonthDisabled(idx);
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={disabled}
                              aria-disabled={disabled}
                              onClick={() => {
                                if (disabled) return;
                                setHijriView({ ...hijriView, month: idx });
                                setOpenDropdown(null);
                              }}
                              className={`w-full text-start px-3 py-1.5 text-xs font-semibold transition-colors ${
                                disabled
                                  ? 'opacity-30 cursor-not-allowed text-semantic-textSecondary'
                                  : hijriView.month === idx
                                  ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary'
                                  : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                              }`}
                            >
                              {t(`datePicker.hijriMonths.${idx}`, mName)}
                            </button>
                          );
                        })}
                  </div>
                )}
              </div>

              {/* Custom Year Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={openDropdown === 'year'}
                  aria-label={t('datePicker.selectYear', 'اختر السنة')}
                  onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                  className="flex items-center gap-1 text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2.5 py-1.5 hover:border-semantic-actionPrimary transition-colors"
                >
                  <span>{calendarMode === 'gregorian' ? gregorianView.year : hijriView.year}</span>
                  <ChevronDown size={14} className="text-semantic-textSecondary" />
                </button>

                {openDropdown === 'year' && (
                  <div className="absolute top-full mt-1 end-0 z-20 max-h-48 w-28 overflow-y-auto rounded-xl border border-semantic-borderCard bg-semantic-surfaceCard py-1 shadow-lg">
                    {(calendarMode === 'gregorian' ? gregorianYearsOptions : hijriYearsOptions).map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          if (calendarMode === 'gregorian') {
                            setGregorianView({ ...gregorianView, year: y });
                          } else {
                            setHijriView({ ...hijriView, year: y });
                          }
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-center px-3 py-1.5 text-xs font-semibold transition-colors ${
                          (calendarMode === 'gregorian' ? gregorianView.year : hijriView.year) === y
                            ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary'
                            : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              aria-label={t('datePicker.nextMonth', 'الشهر التالي')}
              disabled={calendarMode === 'gregorian' ? isNextGregorianDisabled : isNextHijriDisabled}
              aria-disabled={calendarMode === 'gregorian' ? isNextGregorianDisabled : isNextHijriDisabled}
              onClick={() => {
                calendarMode === 'gregorian' ? handleGregorianMonthOffset(1) : handleHijriMonthOffset(1);
                setOpenDropdown(null);
              }}
              className={`p-1 rounded-lg text-semantic-textSecondary transition-colors ${
                (calendarMode === 'gregorian' ? isNextGregorianDisabled : isNextHijriDisabled)
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary'
              }`}
            >
              {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            <button 
              type="button"
              aria-label={t('datePicker.close', 'إغلاق')}
              onClick={() => {
                setIsOpen(false);
                setOpenDropdown(null);
              }}
              className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput ms-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* Days Grid */}
          <div className="pt-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-semantic-textSecondary mb-2">
              {weekDaysHeaders.map((dayName, i) => (
                <div key={i}>{dayName}</div>
              ))}
            </div>

            {calendarMode === 'gregorian' ? (
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: gregorianGrid.firstDayOfWeek }, (_, i) => (
                  <div key={`empty-g-${i}`} />
                ))}

                {Array.from({ length: gregorianGrid.daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const cellDate = new Date(gregorianView.year, gregorianView.month, day, 12, 0, 0);
                  const isFuture = disableFuture && (cellDate > todayNoon);
                  const isSelected = parsedDate &&
                    parsedDate.getDate() === day &&
                    parsedDate.getMonth() === gregorianView.month &&
                    parsedDate.getFullYear() === gregorianView.year;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isFuture}
                      aria-disabled={isFuture}
                      onClick={() => handleGregorianDaySelect(day)}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isFuture
                          ? 'opacity-30 cursor-not-allowed text-semantic-textSecondary'
                          : isSelected
                          ? 'bg-semantic-actionPrimary text-white font-bold shadow-md'
                          : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: hijriGrid.firstDayOfWeek }, (_, i) => (
                  <div key={`empty-h-${i}`} />
                ))}

                {Array.from({ length: hijriGrid.daysInMonth }, (_, i) => {
                  const day = i + 1;
                  let isFuture = false;
                  if (disableFuture) {
                    try {
                      const mCell = moment(`${hijriView.year}/${hijriView.month + 1}/${day}`, 'iYYYY/iM/iD');
                      if (mCell.isValid()) {
                        const cellDate = mCell.toDate();
                        cellDate.setHours(12, 0, 0, 0);
                        isFuture = cellDate > todayNoon;
                      }
                    } catch (e) {}
                  }

                  let isSelected = false;
                  if (parsedDate) {
                    const mSelected = moment(parsedDate);
                    if (mSelected.isValid()) {
                      isSelected = mSelected.iDate() === day &&
                        mSelected.iMonth() === hijriView.month &&
                        mSelected.iYear() === hijriView.year;
                    }
                  }

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isFuture}
                      aria-disabled={isFuture}
                      onClick={() => handleHijriDaySelect(day)}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isFuture
                          ? 'opacity-30 cursor-not-allowed text-semantic-textSecondary'
                          : isSelected
                          ? 'bg-semantic-actionPrimary text-white font-bold shadow-md'
                          : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-semantic-borderInput">
            <button
              type="button"
              onClick={handleSelectToday}
              className="flex-1 py-1.5 rounded-lg bg-semantic-actionPrimary/10 text-semantic-actionPrimary font-bold text-xs hover:bg-semantic-actionPrimary/20 transition-colors"
            >
              {t('datePicker.today', 'اليوم')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setOpenDropdown(null);
              }}
              className="flex-1 py-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-textSecondary font-bold text-xs hover:bg-semantic-borderInput transition-colors"
            >
              {t('datePicker.close', 'إغلاق')}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
