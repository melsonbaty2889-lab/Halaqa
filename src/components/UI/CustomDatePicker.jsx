/* src/components/UI/CustomDatePicker.jsx */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, Globe, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import moment from 'moment-hijri';

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export default function CustomDatePicker({
  value,
  selectedDate,
  onChange = () => {},
  showAge = true,
  lang = 'ar',
  t = (key, fallback) => fallback
}) {
  const activeDateValue = value ?? selectedDate;

  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = ['ar', 'ur'].includes(cleanLang);

  const [calendarMode, setCalendarMode] = useState('gregorian'); // 'gregorian' | 'hijri'
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'month' | 'year' | null

  const pickerRef = useRef(null);

  // ==========================================
  // 1. Parsing التاريخ الخارجي بدون Timezone Shift
  // ==========================================
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

  // ==========================================
  // 2. إعداد حالات العرض والمزامنة
  // ==========================================
  const [gregorianView, setGregorianView] = useState(() => {
    const base = parsedDate || new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const [hijriView, setHijriView] = useState(() => {
    const base = parsedDate || new Date();
    const m = moment(base);
    const hYear = Math.max(1356, Math.min(1500, m.iYear()));
    return { year: hYear, month: m.iMonth() };
  });

  // مزامنة حالة العرض عند تغيير التاريخ الخارجي
  useEffect(() => {
    const base = parsedDate || new Date();
    setGregorianView({ year: base.getFullYear(), month: base.getMonth() });

    const m = moment(base);
    const hYear = Math.max(1356, Math.min(1500, m.iYear()));
    setHijriView({ year: hYear, month: m.iMonth() });
  }, [parsedDate]);

  // مزامنة العرض عند تحويل calendarMode للنمط الحالي للتاريخ المخزن
  useEffect(() => {
    if (!isOpen) return;
    const base = parsedDate || new Date();
    if (calendarMode === 'gregorian') {
      setGregorianView({ year: base.getFullYear(), month: base.getMonth() });
    } else {
      const m = moment(base);
      const hYear = Math.max(1356, Math.min(1500, m.iYear()));
      setHijriView({ year: hYear, month: m.iMonth() });
    }
  }, [calendarMode, isOpen, parsedDate]);

  // إغلاق النافذة القادمة عند الضغط خارج المكون
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

  // ==========================================
  // 3. حساب العمر
  // ==========================================
  const computedAge = useMemo(() => {
    if (!parsedDate) return null;
    const today = new Date();
    let age = today.getFullYear() - parsedDate.getFullYear();
    const monthDiff = today.getMonth() - parsedDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  }, [parsedDate]);

  // ==========================================
  // 4. تنسيق التاريخ المعروض
  // ==========================================
  const formattedDisplayDate = useMemo(() => {
    if (!parsedDate) return null;
    if (calendarMode === 'hijri') {
      const m = moment(parsedDate);
      const day = m.iDate();
      const monthIdx = m.iMonth();
      const year = m.iYear();
      const monthName = t(`datePicker.hijriMonths.${monthIdx}`, HIJRI_MONTHS_AR[monthIdx]);
      return `${day} ${monthName} ${year}`;
    } else {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    }
  }, [parsedDate, calendarMode, t]);

  // ==========================================
  // 5. التنقل والتعديلات لعرض التقويم
  // ==========================================
  const handleGregorianMonthOffset = (offset) => {
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
    setHijriView((prev) => {
      let newMonth = prev.month + offset;
      let newYear = prev.year;
      if (newMonth > 11) {
        newMonth = 0;
        newYear = Math.min(1500, newYear + 1);
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear = Math.max(1356, newYear - 1);
      }
      return { year: newYear, month: newMonth };
    });
  };

  // اختيار يوم ميلادي
  const handleGregorianDaySelect = (day) => {
    const selected = new Date(gregorianView.year, gregorianView.month, day, 12, 0, 0);
    onChange(selected);
    setIsOpen(false);
    setOpenDropdown(null);
  };

  // اختيار يوم هجري وتمرير Gregorian Date صالح
  const handleHijriDaySelect = (hDay) => {
    try {
      const m = moment(`${hijriView.year}/${hijriView.month + 1}/${hDay}`, 'iYYYY/iM/iD');
      if (m.isValid()) {
        const gDate = m.toDate();
        const safeGregorianDate = new Date(gDate.getFullYear(), gDate.getMonth(), gDate.getDate(), 12, 0, 0);
        onChange(safeGregorianDate);
      }
    } catch (e) {
      console.error('Error parsing hijri date:', e);
    }
    setIsOpen(false);
    setOpenDropdown(null);
  };

  // ==========================================
  // 6. شبكة الأيام
  // ==========================================
  const gregorianGrid = useMemo(() => {
    const daysInMonth = new Date(gregorianView.year, gregorianView.month + 1, 0).getDate();
    const firstDayOfWeek = new Date(gregorianView.year, gregorianView.month, 1).getDay();
    return { daysInMonth, firstDayOfWeek };
  }, [gregorianView]);

  const hijriGrid = useMemo(() => {
    try {
      const startOfMonth = moment(`${hijriView.year}/${hijriView.month + 1}/1`, 'iYYYY/iM/iD');
      const daysInMonth = startOfMonth.isValid() ? startOfMonth.iDaysInMonth() : 29;
      const firstDayOfWeek = startOfMonth.isValid() ? startOfMonth.day() : 0;
      return { daysInMonth, firstDayOfWeek };
    } catch (e) {
      return { daysInMonth: 29, firstDayOfWeek: 0 };
    }
  }, [hijriView]);

  // ==========================================
  // 7. خيارات السنوات (1356 - 1500)
  // ==========================================
  const gregorianYearsOptions = useMemo(() => {
    const currentY = new Date().getFullYear();
    const years = [];
    for (let y = currentY + 5; y >= currentY - 100; y--) {
      years.push(y);
    }
    return years;
  }, []);

  const hijriYearsOptions = useMemo(() => {
    const years = [];
    for (let y = 1500; y >= 1356; y--) {
      years.push(y);
    }
    return years;
  }, []);

  const handleSelectToday = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    onChange(today);
    setIsOpen(false);
    setOpenDropdown(null);
  };

  return (
    <div className="relative w-full text-start" dir={isRtl ? 'rtl' : 'ltr'} ref={pickerRef}>
      
      {/* Label and Age */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-semantic-textSecondary">
          {t('datePicker.birthDate', 'تاريخ الميلاد')}
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
                  onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
                  className="flex items-center gap-1 text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2.5 py-1.5 hover:border-semantic-actionPrimary transition-colors"
                >
                  <span>
                    {calendarMode === 'gregorian'
                      ? new Date(2026, gregorianView.month, 1).toLocaleDateString(cleanLang, { month: 'long' })
                      : t(`datePicker.hijriMonths.${hijriView.month}`, HIJRI_MONTHS_AR[hijriView.month])}
                  </span>
                  <ChevronDown size={14} className="text-semantic-textSecondary" />
                </button>

                {openDropdown === 'month' && (
                  <div className="absolute top-full mt-1 start-0 z-20 max-h-48 w-36 overflow-y-auto rounded-xl border border-semantic-borderCard bg-semantic-surfaceCard py-1 shadow-lg">
                    {calendarMode === 'gregorian'
                      ? Array.from({ length: 12 }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setGregorianView({ ...gregorianView, month: i });
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-start px-3 py-1.5 text-xs font-semibold transition-colors ${
                              gregorianView.month === i
                                ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary'
                                : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                            }`}
                          >
                            {new Date(2026, i, 1).toLocaleDateString(cleanLang, { month: 'long' })}
                          </button>
                        ))
                      : HIJRI_MONTHS_AR.map((mName, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setHijriView({ ...hijriView, month: idx });
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-start px-3 py-1.5 text-xs font-semibold transition-colors ${
                              hijriView.month === idx
                                ? 'bg-semantic-actionPrimary/15 text-semantic-actionPrimary'
                                : 'text-semantic-textPrimary hover:bg-semantic-surfaceInput'
                            }`}
                          >
                            {t(`datePicker.hijriMonths.${idx}`, mName)}
                          </button>
                        ))}
                  </div>
                )}
              </div>

              {/* Custom Year Dropdown */}
              <div className="relative">
                <button
                  type="button"
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
              onClick={() => {
                calendarMode === 'gregorian' ? handleGregorianMonthOffset(1) : handleHijriMonthOffset(1);
                setOpenDropdown(null);
              }}
              className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary"
            >
              {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            <button 
              type="button"
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
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i}>
                  {new Date(2026, 0, 4 + i).toLocaleDateString(cleanLang, { weekday: 'narrow' })}
                </div>
              ))}
            </div>

            {calendarMode === 'gregorian' ? (
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: gregorianGrid.firstDayOfWeek }, (_, i) => (
                  <div key={`empty-g-${i}`} />
                ))}

                {Array.from({ length: gregorianGrid.daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const isSelected = parsedDate &&
                    parsedDate.getDate() === day &&
                    parsedDate.getMonth() === gregorianView.month &&
                    parsedDate.getFullYear() === gregorianView.year;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleGregorianDaySelect(day)}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
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

                  let isSelected = false;
                  if (parsedDate) {
                    const mSelected = moment(parsedDate);
                    isSelected = mSelected.iDate() === day &&
                      mSelected.iMonth() === hijriView.month &&
                      mSelected.iYear() === hijriView.year;
                  }

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleHijriDaySelect(day)}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
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
