/* src/components/UI/CustomDatePicker.jsx */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, Globe, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomDatePicker({
  value,
  selectedDate,
  onChange = () => {},
  showAge = true,
  lang = 'ar',
  t = (key, fallback) => fallback
}) {
  // دعم كلا الاسمين للحفاظ على التوافق مع مكونات مشروعك (value أو selectedDate)
  const activeDateValue = value || selectedDate;
  
  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = ['ar', 'ur'].includes(cleanLang);

  const [calendarMode, setCalendarMode] = useState('gregorian'); // gregorian | hijri
  const [isOpen, setIsOpen] = useState(false);

  // تحويل النص أو الكائن الممرر إلى كائن Date صالح
  const parsedDate = useMemo(() => {
    if (!activeDateValue) return new Date();
    const d = new Date(activeDateValue);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [activeDateValue]);

  // حالة عرض التقويم داخل النافذة (الشهر والسنة المعروضان)
  const [viewDate, setViewDate] = useState(parsedDate);

  // مزامنة العرض الداخلي عند تغيير التاريخ من الخارج
  useEffect(() => {
    setViewDate(parsedDate);
  }, [parsedDate]);

  const pickerRef = useRef(null);

  // إغلاق النافذة المنبثقة عند النقر خارج المكون
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // حساب العمر بالسنوات تلقائياً
  const calculatedAge = useMemo(() => {
    if (!parsedDate) return 0;
    const today = new Date();
    let age = today.getFullYear() - parsedDate.getFullYear();
    const monthDiff = today.getMonth() - parsedDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  }, [parsedDate]);

  // تحويل ميلادي إلى هجري تقريبي دقيق للعرض
  const formatHijri = (date) => {
    try {
      return new Intl.DateTimeFormat(`${cleanLang}-TN-u-ca-islamic`, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return date.toLocaleDateString(cleanLang);
    }
  };

  // تنسيق نص التاريخ الرئيسي المكتوب بالحقل
  const formattedDisplayDate = calendarMode === 'hijri'
    ? formatHijri(parsedDate)
    : parsedDate.toLocaleDateString(cleanLang, { year: 'numeric', month: '2-digit', day: '2-digit' });

  // معالجة اختيار يوم محدد من الشبكة
  const handleSelectDay = (day) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(selected);
    setIsOpen(false);
  };

  // معالجة تغيير السنة من القائمة المنسدلة
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    const updatedView = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    updatedView.setFullYear(newYear);
    setViewDate(updatedView);

    // تحديث التاريخ المختار مع الحفاظ على اليوم والشهر
    const newSelected = new Date(parsedDate);
    newSelected.setFullYear(newYear);
    onChange(newSelected);
  };

  // معالجة تغيير الشهر من القائمة المنسدلة
  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    const updatedView = new Date(viewDate.getFullYear(), newMonth, 1);
    setViewDate(updatedView);

    // تحديث التاريخ المختار مع الحفاظ على اليوم والسنة
    const newSelected = new Date(parsedDate);
    newSelected.setMonth(newMonth);
    onChange(newSelected);
  };

  // التنقل بين الأشهر عبر الأسهم
  const handleMonthOffset = (offset) => {
    const updatedView = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(updatedView);
  };

  // حسابات شبكة الأيام
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // قائمة نطاق السنوات (100 سنة للوراء و5 سنوات للمستقبل)
  const yearOptions = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const years = [];
    for (let y = thisYear + 5; y >= thisYear - 100; y--) {
      years.push(y);
    }
    return years;
  }, []);

  return (
    <div className="relative w-full text-start" dir={isRtl ? 'rtl' : 'ltr'} ref={pickerRef}>
      
      {/* رأس الحقل مع عنوان تاريخ الميلاد وحساب العمر الديناميكي */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-semantic-textSecondary">
          {t('datePicker.birthDate', 'تاريخ الميلاد')}
        </label>
        {showAge && (
          <span className="text-[11px] font-bold text-semantic-actionPrimary bg-semantic-surfaceInput px-2 py-0.5 rounded-md border border-semantic-borderInput">
            {t('datePicker.age', 'العمر')}: {calculatedAge} {t('datePicker.years', 'سنة')}
          </span>
        )}
      </div>

      {/* زر الحقل الرئيسي لفتح التقويم */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-2.5 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput cursor-pointer hover:border-semantic-actionPrimary transition-all"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-semantic-actionPrimary" />
          <span className="text-xs font-bold dir-ltr text-semantic-textPrimary">
            {formattedDisplayDate}
          </span>
        </div>

        {/* زر التبديل بين التقويم الهجري والميلادي */}
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

      {/* النافذة المنبثقة لاختيار الشهر/السنة واليوم */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-w-sm rounded-2xl border border-semantic-borderCard bg-semantic-surfaceCard p-4 shadow-2xl backdrop-blur-md">
          
          {/* رأس التقويم والتنقل السريع */}
          <div className="flex items-center justify-between pb-3 border-b border-semantic-borderInput gap-1">
            <button
              type="button"
              onClick={() => handleMonthOffset(-1)}
              className="p-1.5 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary transition-colors"
            >
              {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className="flex items-center gap-1.5">
              {/* اختيار الشهر */}
              <select
                value={currentMonth}
                onChange={handleMonthChange}
                className="text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2026, i, 1).toLocaleDateString(cleanLang, { month: 'long' })}
                  </option>
                ))}
              </select>

              {/* اختيار السنة */}
              <select
                value={currentYear}
                onChange={handleYearChange}
                className="text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleMonthOffset(1)}
              className="p-1.5 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary transition-colors"
            >
              {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput transition-colors ms-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* شبكة أسبوع التقويم والأيام */}
          <div className="pt-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-semantic-textSecondary mb-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i}>
                  {new Date(2026, 0, 4 + i).toLocaleDateString(cleanLang, { weekday: 'narrow' })}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* الخانات الفارغة قبل بداية الشهر */}
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* الأيام القابلة للاختيار */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isSelected = 
                  parsedDate.getDate() === day &&
                  parsedDate.getMonth() === currentMonth &&
                  parsedDate.getFullYear() === currentYear;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
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
          </div>

          {/* أزرار الإجراءات السريعة (اليوم / إغلاق) */}
          <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-semantic-borderInput">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onChange(today);
                setViewDate(today);
                setIsOpen(false);
              }}
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
