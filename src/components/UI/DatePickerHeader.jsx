/* src/components/UI/DatePickerHeader.jsx */
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { HIJRI_MONTHS } from '@/utils/dateUtils';

export default function DatePickerHeader({
  calendarMode,
  gregorianView,
  hijriView,
  openDropdown,
  setOpenDropdown,
  handleMonthOffset,
  isNextDisabled,
  isRtl,
  cleanLang,
  gregorianYearsOptions,
  hijriYearsOptions,
  isGregorianMonthDisabled,
  isHijriMonthDisabled,
  onSelectGregorianMonth,
  onSelectHijriMonth,
  onSelectYear,
  onClose,
  t
}) {
  const currentHijriMonths = HIJRI_MONTHS[cleanLang] || HIJRI_MONTHS.ar;

  return (
    <div className="flex items-center justify-between pb-3 border-b border-semantic-borderInput gap-1">
      <button
        type="button"
        aria-label={t('datePicker.previousMonth', 'الشهر السابق')}
        onClick={() => {
          handleMonthOffset(-1);
          setOpenDropdown(null);
        }}
        className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary"
      >
        {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className="flex items-center gap-2 relative">
        {/* Month Dropdown */}
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
                : t(`datePicker.hijriMonths.${hijriView.month}`, currentHijriMonths[hijriView.month] || '')}
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
                          onSelectGregorianMonth(i);
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
                : currentHijriMonths.map((mName, idx) => {
                    const disabled = isHijriMonthDisabled(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={disabled}
                        aria-disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          onSelectHijriMonth(idx);
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

        {/* Year Dropdown */}
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
                    onSelectYear(y);
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
        disabled={isNextDisabled}
        aria-disabled={isNextDisabled}
        onClick={() => {
          handleMonthOffset(1);
          setOpenDropdown(null);
        }}
        className={`p-1 rounded-lg text-semantic-textSecondary transition-colors ${
          isNextDisabled
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:bg-semantic-surfaceInput hover:text-semantic-textPrimary'
        }`}
      >
        {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      <button
        type="button"
        aria-label={t('datePicker.close', 'إغلاق')}
        onClick={onClose}
        className="p-1 rounded-lg text-semantic-textSecondary hover:bg-semantic-surfaceInput ms-1"
      >
        <X size={16} />
      </button>
    </div>
  );
}
