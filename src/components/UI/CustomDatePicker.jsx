import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { ar, enUS } from 'date-fns/locale';
import { formatHijriDate, calculateAge } from '@/utils/dateUtils';
import 'react-datepicker/dist/react-datepicker.css';

export default function CustomDatePicker({ 
  selectedDate, 
  startDate, 
  endDate, 
  onChange, 
  isArabic = true, 
  isRange = false,
  placeholder,
  showAge = false
}) {
  const [calendarMode, setCalendarMode] = useState('gregorian'); // 'gregorian' | 'hijri'

  // تحديد اللغة
  const currentLocale = isArabic ? ar : enUS;

  // حساب السن والتاريخ الهجري
  const mainDate = isRange ? startDate : selectedDate;
  const hijriText = mainDate ? formatHijriDate(mainDate, isArabic) : '';
  const age = (showAge && mainDate) ? calculateAge(mainDate) : null;

  return (
    <div className="flex flex-col w-full space-y-1.5">
      {/* شريط التبديل بين التقويمين وحساب العمر */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setCalendarMode(calendarMode === 'gregorian' ? 'hijri' : 'gregorian')}
          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 transition-all"
        >
          <Repeat size={12} />
          {calendarMode === 'gregorian' 
            ? (isArabic ? 'عرض التقويم الهجري' : 'Switch to Hijri') 
            : (isArabic ? 'عرض التقويم الميلادي' : 'Switch to Gregorian')}
        </button>

        {age !== null && (
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {isArabic ? `العمر: ${age} سنة` : `Age: ${age} yrs`}
          </span>
        )}
      </div>

      {/* حقل اختيار التاريخ */}
      <div className="relative flex items-center w-full">
        {isRange ? (
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            locale={currentLocale}
            dateFormat="yyyy/MM/dd"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            placeholderText={placeholder || (isArabic ? "اختر نطاق التاريخ..." : "Select date range...")}
            className="w-full bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl px-10 py-2.5 text-xs focus:outline-none focus:border-emerald-500/80 transition-all cursor-pointer shadow-inner placeholder:text-slate-500"
            calendarClassName="custom-dark-calendar"
            popperClassName="z-[9999]"
            popperPlacement="bottom-start"
          />
        ) : (
          <DatePicker
            selected={selectedDate}
            onChange={onChange}
            locale={currentLocale}
            dateFormat="yyyy/MM/dd"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            maxDate={new Date()}
            yearDropdownItemNumber={80}
            scrollableYearDropdown
            placeholderText={placeholder || (isArabic ? "اختر التاريخ..." : "Select date...")}
            className="w-full bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl px-10 py-2.5 text-xs focus:outline-none focus:border-emerald-500/80 transition-all cursor-pointer shadow-inner placeholder:text-slate-500"
            calendarClassName="custom-dark-calendar"
            popperClassName="z-[9999]"
            popperPlacement="bottom-start"
          />
        )}

        <CalendarIcon 
          size={16} 
          className={`absolute text-emerald-400 pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} 
        />
      </div>

      {/* شريط المعاينة الهجرية */}
      {mainDate && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold">
          <span>{isArabic ? 'الموافق هجرياً:' : 'Hijri:'}</span>
          <span>{hijriText}</span>
        </div>
      )}
    </div>
  );
}
