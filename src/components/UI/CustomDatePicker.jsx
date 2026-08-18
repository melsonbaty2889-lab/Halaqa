import React from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { ar, enUS } from 'date-fns/locale';
import { formatHijriDate } from '../../utils/dateUtils';
import 'react-datepicker/dist/react-datepicker.css';

export default function CustomDatePicker({ startDate, endDate, onChange, isArabic = true }) {
  // تنسيق عرض التاريخ الهجري باستخدام دالتك الخاصة
  const renderHijriInfo = () => {
    if (!startDate) return null;
    
    const startHijri = formatHijriDate(startDate, isArabic);
    const endHijri = endDate ? formatHijriDate(endDate, isArabic) : null;

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold mt-1.5">
        <span>{isArabic ? 'الموافق هجرياً:' : 'Hijri:'}</span>
        <span>{startHijri}</span>
        {endHijri && (
          <>
            <span className="opacity-50">{isArabic ? 'إلى' : 'to'}</span>
            <span>{endHijri}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative flex items-center">
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={onChange}
          locale={isArabic ? ar : enUS}
          dateFormat="yyyy/MM/dd"
          placeholderText={isArabic ? "اختر نطاق التاريخ..." : "Select date range..."}
          className="w-full bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl px-10 py-2.5 text-xs focus:outline-none focus:border-emerald-500/80 transition-all cursor-pointer shadow-inner placeholder:text-slate-500"
          calendarClassName="custom-dark-calendar"
        />
        <CalendarIcon size={16} className="absolute right-3 text-emerald-400 pointer-events-none" />
      </div>

      {/* عرض التاريخ الهجري من ملفك */}
      {renderHijriInfo()}
    </div>
  );
}
