import React, { useState, useEffect } from 'react';
import { Clock, X, Check } from 'lucide-react';
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
        setMinutes(m);
        setPeriod(p);
      }
    }
  }, [value]);

  const handleConfirm = () => {
    let hourNum = parseInt(hours, 10);
    if (period === 'PM' && hourNum < 12) hourNum += 12;
    if (period === 'AM' && hourNum === 12) hourNum = 0;

    const formattedTime = `${hourNum.toString().padStart(2, '0')}:${minutes}`;
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

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-xs font-bold text-semantic-textPrimary mb-1.5">
          {label} {required && <span className="text-semantic-actionDanger">*</span>}
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

      {error && <p className="text-[11px] text-semantic-actionDanger mt-1">{error}</p>}

      {/* النافذة المنبثقة لاختيار الوقت */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl shadow-xl overflow-hidden text-semantic-textPrimary">
            
            {/* الهيدر */}
            <div className="flex items-center justify-between p-3.5 border-b border-semantic-borderCard bg-semantic-surfaceInput">
              <span className="text-xs font-bold">{t('selectTime', 'اختر الوقت')}</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-semantic-borderCard/40 text-semantic-textMuted hover:text-semantic-textPrimary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* عناصر اختيار الساعة والدقيقة والتوقيت */}
            <div className="p-4 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 dir-ltr">
                <select
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textPrimary text-xl font-bold p-2.5 rounded-xl text-center outline-none focus:border-semantic-actionPrimary cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((h) => (
                    <option key={h} value={h} className="bg-semantic-surfaceCard text-sm">
                      {h}
                    </option>
                  ))}
                </select>

                <span className="text-xl font-bold text-semantic-actionPrimary">:</span>

                <select
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="bg-semantic-surfaceInput border border-semantic-borderCard text-semantic-textPrimary text-xl font-bold p-2.5 rounded-xl text-center outline-none focus:border-semantic-actionPrimary cursor-pointer"
                >
                  {['00', '15', '30', '45'].map((m) => (
                    <option key={m} value={m} className="bg-semantic-surfaceCard text-sm">
                      {m}
                    </option>
                  ))}
                </select>

                <div className="flex flex-col gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() => setPeriod('AM')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      period === 'AM'
                        ? 'bg-semantic-actionPrimary text-semantic-textPrimary border-semantic-actionPrimary'
                        : 'bg-semantic-surfaceInput text-semantic-textMuted border-semantic-borderCard'
                    }`}
                  >
                    {t('am', 'ص')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('PM')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      period === 'PM'
                        ? 'bg-semantic-actionPrimary text-semantic-textPrimary border-semantic-actionPrimary'
                        : 'bg-semantic-surfaceInput text-semantic-textMuted border-semantic-borderCard'
                    }`}
                  >
                    {t('pm', 'م')}
                  </button>
                </div>
              </div>
            </div>

            {/* الأزرار المعربة */}
            <div className="flex items-center gap-2 p-3 bg-semantic-surfaceInput border-t border-semantic-borderCard">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2 px-3 bg-semantic-actionPrimary text-semantic-textPrimary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 cursor-pointer border-none"
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
        </div>
      )}
    </div>
  );
}
