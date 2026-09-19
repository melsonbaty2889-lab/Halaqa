/* src/components/UI/DatePickerDaysGrid.jsx */
import React from 'react';
import moment from 'moment-hijri';

export default function DatePickerDaysGrid({
  calendarMode,
  weekDaysHeaders,
  gregorianGrid,
  hijriGrid,
  gregorianView,
  hijriView,
  disableFuture,
  todayNoon,
  parsedDate,
  handleGregorianDaySelect,
  handleHijriDaySelect
}) {
  return (
    <div className="pt-3">
      {/* أسماء أيام الأسبوع */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-semantic-textSecondary mb-2">
        {weekDaysHeaders.map((dayName, i) => (
          <div key={i}>{dayName}</div>
        ))}
      </div>

      {/* شبكة التقويم الميلادي */}
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
        /* شبكة التقويم الهجري */
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
  );
}
