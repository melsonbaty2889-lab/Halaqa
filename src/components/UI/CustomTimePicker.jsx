import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, X, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CustomTimePicker({
  value = '',
  onChange,
  placeholder = '00:00',
  label,
  error,
  required = false
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      if (h && m) {
        let hourNum = parseInt(h, 10);
        const p = hourNum >= 12 ? 'PM' : 'AM';
        hourNum = hourNum % 12 || 12;
        setHours(hourNum.toString().padStart(2, '0'));
        setMinutes(m.padStart(2, '0'));
        setPeriod(p);
      }
    }
  }, [value]);

  const handleConfirm = () => {
    let hourNum = parseInt(hours || '12', 10);
    let minNum = parseInt(minutes || '00', 10);

    // ضبط الحدود المقبولة
    if (isNaN(hourNum) || hourNum < 1) hourNum = 12;
    if (hourNum > 12) hourNum = 12;
    if (isNaN(minNum) || minNum < 0) minNum = 0;
    if (minNum > 59) minNum = 59;

    if (period === 'PM' && hourNum < 12) hourNum += 12;
    if (period === 'AM' && hourNum === 12) hourNum = 0;

    const formattedTime = `${hourNum.toString().padStart(2, '0')}:${minNum.toString().padStart(2, '0')}`;
    onChange(formattedTime);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    if (!value) return '';
    const [h, m] = value.split(':');
    if (!h || !m) return value;
    let hourNum = parseInt(h, 10);
    const p = hourNum >= 12 ? t('pm', 'م') : t('am', 'ص');
    hourNum = hourNum % 12 || 12;
    return `${hourNum.toString().padStart(2, '0')}:${m} ${p}`;
  };

  // التحكم بالساعات (كتابة + أسهم)
  const handleHoursChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setHours(val);
  };

  const handleHoursBlur = () => {
    let h = parseInt(hours, 10);
    if (isNaN(h) || h < 1) h = 12;
    if (h > 12) h = 12;
    setHours(h.toString().padStart(2, '0'));
  };

  const incrementHours = () => {
    let h = parseInt(hours || '12', 10);
    h = h >= 12 ? 1 : h + 1;
    setHours(h.toString().padStart(2, '0'));
  };

  const decrementHours = () => {
    let h = parseInt(hours || '12', 10);
    h = h <= 1 ? 12 : h - 1;
    setHours(h.toString().padStart(2, '0'));
  };

  // التحكم بالدقائق (كتابة + أسهم)
  const handleMinutesChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMinutes(val);
  };

  const handleMinutesBlur = () => {
    let m = parseInt(minutes, 10);
    if (isNaN(m) || m < 0) m = 0;
    if (m > 59) m = 59;
    setMinutes(m.toString().padStart(2, '0'));
  };

  const incrementMinutes = () => {
    let m = parseInt(minutes || '00', 10);
    m = (m + 5) % 60;
    setMinutes(m.toString().padStart(2, '0'));
  };

  const decrementMinutes = () => {
    let m = parseInt(minutes || '00', 10);
    m = (m - 5 + 60) % 60;
    setMinutes(m.toString().padStart(2, '0'));
  };

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
          {label} {required && <span className="text-semantic-actionPrimary">*</span>}
        </label>
      )}

      {/* زر الحقل الرئيسي */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-semantic-surfaceInput border rounded-xl text-sm transition-all text-right cursor-pointer ${
          error
            ? 'border-semantic-actionDanger text-semantic-actionDanger'
            : 'border-semantic-borderCard text-semantic-textPrimary hover:border-semantic-actionPrimary/50'
        }`}
      >
        <span className={value ? 'text-semantic-textPrimary font-semibold' : 'text-semantic-textMuted'}>
          {value ? formatDisplayTime() : placeholder}
        </span>
        <Clock size={16} className="text-semantic-textMuted shrink-0" />
      </button>

      {/* النافذة المنبثقة لاختيار الوقت */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl shadow-2xl overflow-hidden text-semantic-textPrimary flex flex-col">
            
            {/* الهيدر */}
            <div className="flex items-center justify-between p-3.5 border-b border-semantic-borderCard bg-semantic-surfaceInput/40 shrink-0">
              <span className="text-xs font-bold">{t('selectTime', 'اختر الوقت')}</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-semantic-borderCard/40 text-semantic-textMuted hover:text-semantic-textPrimary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* محتوى اختيار الوقت LTR */}
            <div className="p-5 flex items-center justify-center gap-3 [direction:ltr]">
              
              {/* حقل الساعات */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={incrementHours}
                  className="p-1.5 rounded-lg bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted hover:text-semantic-textPrimary hover:border-semantic-actionPrimary transition-all cursor-pointer"
                >
                  <ChevronUp size={16} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={hours}
                  onChange={handleHoursChange}
                  onBlur={handleHoursBlur}
                  onFocus={(e) => e.target.select()}
                  className="w-16 h-12 text-center bg-semantic-surfaceInput border border-semantic-borderCard rounded-xl text-xl font-bold text-semantic-textPrimary focus:border-semantic-actionPrimary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={decrementHours}
                  className="p-1.5 rounded-lg bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted hover:text-semantic-textPrimary hover:border-semantic-actionPrimary transition-all cursor-pointer"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <span className="text-2xl font-bold text-semantic-actionPrimary pb-1">:</span>

              {/* حقل الدقائق */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={incrementMinutes}
                  className="p-1.5 rounded-lg bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted hover:text-semantic-textPrimary hover:border-semantic-actionPrimary transition-all cursor-pointer"
                >
                  <ChevronUp size={16} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minutes}
                  onChange={handleMinutesChange}
                  onBlur={handleMinutesBlur}
                  onFocus={(e) => e.target.select()}
                  className="w-16 h-12 text-center bg-semantic-surfaceInput border border-semantic-borderCard rounded-xl text-xl font-bold text-semantic-textPrimary focus:border-semantic-actionPrimary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={decrementMinutes}
                  className="p-1.5 rounded-lg bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textMuted hover:text-semantic-textPrimary hover:border-semantic-actionPrimary transition-all cursor-pointer"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* أزرار ص / م */}
              <div className="flex flex-col gap-1.5 ml-2 [direction:rtl]">
                <button
                  type="button"
                  onClick={() => setPeriod('AM')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    period === 'AM'
                      ? 'bg-semantic-actionPrimary text-semantic-textPrimary border-semantic-actionPrimary shadow-xs'
                      : 'bg-semantic-surfaceInput text-semantic-textMuted border-semantic-borderCard hover:text-semantic-textPrimary'
                  }`}
                >
                  {t('am', 'ص')}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('PM')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    period === 'PM'
                      ? 'bg-semantic-actionPrimary text-semantic-textPrimary border-semantic-actionPrimary shadow-xs'
                      : 'bg-semantic-surfaceInput text-semantic-textMuted border-semantic-borderCard hover:text-semantic-textPrimary'
                  }`}
                >
                  {t('pm', 'م')}
                </button>
              </div>

            </div>

            {/* الأزرار السفلية */}
            <div className="flex items-center gap-2 p-3 bg-semantic-surfaceInput/40 border-t border-semantic-borderCard shrink-0">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2 px-3 bg-semantic-actionPrimary text-semantic-textPrimary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 cursor-pointer border-none shadow-xs"
              >
                <Check size={14} />
                <span>{t('set', 'تعيين')}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="py-2 px-3 bg-transparent text-semantic-actionDanger rounded-xl text-xs font-bold hover:bg-semantic-actionDanger/10 transition-all cursor-pointer border-none"
              >
                {t('clear', 'مسح')}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="py-2 px-3 bg-transparent text-semantic-textMuted rounded-xl text-xs font-bold hover:text-semantic-textPrimary transition-all cursor-pointer border-none"
              >
                {t('cancel', 'إلغاء')}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
