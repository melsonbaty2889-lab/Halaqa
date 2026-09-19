/* src/components/UI/CustomDatePicker.jsx */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, Globe, X, ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment-hijri';

// أسماء الأشهر الهجرية الافتراضية
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

  const pickerRef = useRef(null);

  // ==========================================
  // 1. معالجة وتفسير التاريخ المدخل (Parsing)
  // ==========================================
  const parsedDate = useMemo(() => {
    if (!activeDateValue) return null;
    let d;
    if (typeof activeDateValue === 'string') {
      // التعامل مع التاريخ كـ Calendar Date لمنع مشكلة Timezone UTC Shift
      const dateParts = activeDateValue.split('T')[0].split('-');
      if (dateParts.length === 3) {
        d = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
      } else {
        d = new Date(activeDateValue);
      }
    } else {
      d = new Date(activeDateValue);
    }
    return isNaN(d.getTime()) ? null : d;
  }, [activeDateValue]);

  // ==========================================
  // 2. إعداد حالة العرض الداخلي للتقويم (State)
  // ==========================================
  // حالة العرض الميلادي
  const [gregorianView, setGregorianView] = useState(() => {
    const base = parsedDate || new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  // حالة العرض الهجري
  const [hijriView, setHijriView] = useState(() => {
    const m = moment(parsedDate || new Date());
    return { year: m.iYear(), month: m.iMonth() };
  });

  // مزامنة أجهزة العرض عند تغير قيمة activeDateValue الخارجي
  useEffect(() => {
    const base = parsedDate || new Date();
    setGregorianView({ year: base.getFullYear(), month: base.getMonth() });

    const m = moment(base);
    setHijriView({ year: m.iYear(), month: m.iMonth() });
  }, [parsedDate]);

  // إغلاق التقويم عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================
  // 3. حساب العمر بدقة (Age Calculation)
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
  // 4. تنسيقات نصوص العرض والتاريخ الحاضر
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
  }, [parsedDate, calendarMode, cleanLang, t]);

  // ==========================================
  // 5. العمليات والتحويلات للتقويم الميلادي
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

  const handleGregorianDaySelect = (day) => {
    const selected = new Date(gregorianView.year, gregorianView.month, day, 12, 0, 0);
    onChange(selected);
    setIsOpen(false);
  };

  // ==========================================
  // 6. العمليات والتحويلات للتقويم الهجري (moment-hijri)
  // ==========================================
  const handleHijriMonthOffset = (offset) => {
    setHijriView((prev) => {
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

  const handleHijriDaySelect = (hDay) => {
    // إنشاء كائن moment-hijri هجري دقيق
    const m = moment(`${hijriView.year}/${hijriView.month + 1}/${hDay}`, 'iYYYY/iM/iD');
    // تحويله إلى JS Gregorian Date
    const gDate = m.toDate();
    // ضبط الوقت لتفادي مشاكل timezone UTC
    const safeGregorianDate = new Date(gDate.getFullYear(), gDate.getMonth(), gDate.getDate(), 12, 0, 0);
    onChange(safeGregorianDate);
    setIsOpen(false);
  };

  // ==========================================
  // 7. حسابات شبكة الأيام (Grid Generation)
  // ==========================================

  // بيانات الشبكة الميلادية
  const gregorianGrid = useMemo(() => {
    const daysInMonth = new Date(gregorianView.year, gregorianView.month + 1, 0).getDate();
    const firstDayOfWeek = new Date(gregorianView.year, gregorianView.month, 1).getDay();
    return { daysInMonth, firstDayOfWeek };
  }, [gregorianView]);

  // بيانات الشبكة الهجرية الحقيقية باستخدام moment-hijri
  const hijriGrid = useMemo(() => {
    // كائن moment هجري لبداية الشهر الهجري المحدد
    const startOfMonth = moment(`${hijriView.year}/${hijriView.month + 1}/1`, 'iYYYY/iM/iD');
    // عدد أيام الشهر الهجري الحالي
    const daysInMonth = moment.iDaysInMonth(hijriView.year, hijriView.month);
    // يوم الأسبوع الذي يبدأ به الشهر الهجري (0 = الأحد)
    const firstDayOfWeek = startOfMonth.day();

    return { daysInMonth, firstDayOfWeek };
  }, [hijriView]);

  // ==========================================
  // 8. قوائم الخيارات للسنوات والأشهر
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
    const currentHY = moment().iYear();
    const years = [];
    for (let y = currentHY + 5; y >= currentHY - 100; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // أزرار اليوم والمسح
  const handleSelectToday = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    onChange(today);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full text-start" dir={isRtl ? 'rtl' : 'ltr'} ref={pickerRef}>
      
      {/* رأس الحقل مع حساب العمر وتاريخ الميلاد */}
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

      {/* زر فتح واجهة التقويم */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-2.5 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput cursor-pointer hover:border-semantic-actionPrimary transition-all"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-semantic-actionPrimary" />
          <span className={`text-xs font-bold ${formattedDisplayDate ? 'dir-ltr text-semantic-textPrimary' : 'text-semantic-textSecondary'}`}>
            {formattedDisplayDate || t('datePicker.placeholder', 'اختر التاريخ')}
          </span>
        </div>

        {/* زر التبديل السريع بين الهجري والميلادي */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCalendarMode(calendarMode === 'gregorian' ? 'hijri' : 'gregorian');
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

      {/* نافذة التقويم المنبثقة للضغط والاختيار */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-w-sm rounded-2xl border border-semantic-borderCard bg-semantic-surfaceCard p-4 shadow-xl backdrop-blur-md">
          
          {/* ========================================== */}
          {/* رأس التقويم والتنقل حسب الوضع المحدد       */}
          {/* ========================================== */}
          <div className="flex items-center justify-between pb-3 border-b border-semantic-borderInput gap-1">
            <button
              type="button"
              onClick={() => calendarMode === 'gregorian' ? handleGregorianMonthOffset(-1) : handleHijriMonthOffset(-1)}
              className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary"
            >
              {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className="flex items-center gap-1.5">
              {calendarMode === 'gregorian' ? (
                /* عناصر خيارات التبديل الميلادي */
                <>
                  <select
                    value={gregorianView.month}
                    onChange={(e) => setGregorianView({ ...gregorianView, month: parseInt(e.target.value, 10) })}
                    className="text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {new Date(2026, i, 1).toLocaleDateString(cleanLang, { month: 'long' })}
                      </option>
                    ))}
                  </select>

                  <select
                    value={gregorianView.year}
                    onChange={(e) => setGregorianView({ ...gregorianView, year: parseInt(e.target.value, 10) })}
                    className="text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    {gregorianYearsOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </>
              ) : (
                /* عناصر خيارات التبديل الهجري */
                <>
                  <select
                    value={hijriView.month}
                    onChange={(e) => setHijriView({ ...hijriView, month: parseInt(e.target.value, 10) })}
                    className="text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    {HIJRI_MONTHS_AR.map((mName, idx) => (
                      <option key={idx} value={idx}>
                        {t(`datePicker.hijriMonths.${idx}`, mName)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={hijriView.year}
                    onChange={(e) => setHijriView({ ...hijriView, year: parseInt(e.target.value, 10) })}
                    className="text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    {hijriYearsOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => calendarMode === 'gregorian' ? handleGregorianMonthOffset(1) : handleHijriMonthOffset(1)}
              className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary"
            >
              {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput ms-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* ========================================== */}
          {/* شبكة الأيام القابلة للضغط والاختيار         */}
          {/* ========================================== */}
          <div className="pt-3">
            {/* أسماء أيام الأسبوع */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-semantic-textSecondary mb-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i}>
                  {new Date(2026, 0, 4 + i).toLocaleDateString(cleanLang, { weekday: 'narrow' })}
                </div>
              ))}
            </div>

            {/* عرض شبكة الأيام المخصصة بناءً على الوضع الحالي */}
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

                  // فحص التحديد بالاعتماد على moment-hijri للتاريخ المختار
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

          {/* ========================================== */}
          {/* أزرار الإجراءات السريعة (اليوم / إغلاق)       */}
          {/* ========================================== */}
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
              onClick={() => setIsOpen(false)}
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
