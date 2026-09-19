/* src/components/UI/CustomDatePicker.jsx */
import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Globe, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatHijriDate, calculateAge } from '@/utils/dateUtils';

export default function CustomDatePicker({
  selectedDate = new Date(),
  onChange = () => {},
  showAge = true,
  variant = 'standard', // standard | compact
  lang = 'ar',
  t = (key, fallback) => fallback
}) {
  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = ['ar', 'ur'].includes(cleanLang);

  const [calendarMode, setCalendarMode] = useState('gregorian'); // gregorian | hijri
  const [isOpen, setIsOpen] = useState(false);
  
  // تاريخ العرض الحالي داخل النافذة المنبثقة
  const dateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate || Date.now());
  const [viewDate, setViewDate] = useState(dateObj);

  const pickerRef = useRef(null);

  // مزامنة تاريخ العرض عند تغير التاريخ المحدد من الخارج
  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate));
    }
  }, [selectedDate]);

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

  const computedAge = calculateAge(dateObj);

  // تنسيق النص المعروض داخل حقل الإدخال الرئيسي
  const formattedDisplayDate = calendarMode === 'hijri'
    ? formatHijriDate(dateObj, cleanLang)
    : dateObj.toLocaleDateString(cleanLang, { year: 'numeric', month: '2-digit', day: '2-digit' });

  // تنقل الأشهُر (السابق والتالي)
  const handleMonthChange = (offset) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  // اختيار يوم محدد من التقويم
  const handleSelectDay = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate);
    setIsOpen(false);
  };

  // تغيير السنة المباشر
  const handleYearSelect = (e) => {
    const newYear = parseInt(e.target.value, 10);
    const newDate = new Date(viewDate);
    newDate.setFullYear(newYear);
    setViewDate(newDate);
  };

  // تغيير الشهر المباشر
  const handleMonthSelect = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    const newDate = new Date(viewDate);
    newDate.setMonth(newMonth);
    setViewDate(newDate);
  };

  // حساب أيام الشهر الحالي
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // قائمة السنوات لاختيار السنة (100 سنة سابقة إلى 5 سنوات قادمة)
  const currentYear = new Date().getFullYear();
  const yearsOptions = Array.from({ length: 105 }, (_, i) => currentYear + 5 - i);

  return (
    <div className="relative w-full text-start" dir={isRtl ? 'rtl' : 'ltr'} ref={pickerRef}>
      
      {/* رأس الحقل مع حساب العمر وتاريخ الميلاد */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-semantic-textSecondary">
          {t('datePicker.birthDate', 'تاريخ الميلاد')}
        </label>
        {showAge && computedAge !== null && (
          <span className="text-[11px] font-bold text-semantic-actionPrimary bg-semantic-surfaceInput px-2 py-0.5 rounded-md border border-semantic-borderInput">
            {t('datePicker.age', 'العمر')}: {computedAge} {t('datePicker.years', 'سنة')}
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
          <span className="text-xs font-bold dir-ltr text-semantic-textPrimary">
            {formattedDisplayDate}
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
          
          {/* رأس التقويم ومسارات خيارات الشهر والسنة */}
          <div className="flex items-center justify-between pb-3 border-b border-semantic-borderInput gap-1">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary"
            >
              {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className="flex items-center gap-1.5">
              {/* قائمة اختيار الشهر */}
              <select
                value={month}
                onChange={handleMonthSelect}
                className="text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2000, i, 1).toLocaleDateString(cleanLang, { month: 'short' })}
                  </option>
                ))}
              </select>

              {/* قائمة اختيار السنة */}
              <select
                value={year}
                onChange={handleYearSelect}
                className="text-xs font-bold bg-semantic-surfaceInput text-semantic-textPrimary border border-semantic-borderInput rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {yearsOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleMonthChange(1)}
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

          {/* شبكة الأيام القابلة للضغط والاختيار */}
          <div className="pt-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-semantic-textSecondary mb-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i}>
                  {new Date(2023, 0, 1 + i).toLocaleDateString(cleanLang, { weekday: 'narrow' })}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* الفراغات السابقة للشهر */}
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* الأيام الفعلية الشغالة للضغط */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isSelected = 
                  dateObj.getDate() === day &&
                  dateObj.getMonth() === month &&
                  dateObj.getFullYear() === year;

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
