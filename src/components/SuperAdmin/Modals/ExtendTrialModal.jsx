import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, X } from 'lucide-react';
import { UI } from '@/theme/styles';

export default function ExtendTrialModal({
  extendModalAcademy,
  onClose,
  onExtend,
  getSafeText
}) {
  const { t } = useTranslation();
  const [customDays, setCustomDays] = useState('');

  if (!extendModalAcademy) return null;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const days = parseInt(customDays, 10);
    if (days && days > 0) {
      onExtend(extendModalAcademy.id, days);
      setCustomDays('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[2000] p-4 transition-all duration-300 font-cairo">
      <div className="card-surface border border-semantic-borderCard rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative space-y-4">
        
        {/* زر الإغلاق العلوي */}
        <button 
          onClick={onClose}
          className="absolute left-4 top-4 text-semantic-textMuted hover:text-semantic-textPrimary transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* الأيقونة والترويسة */}
        <div className="p-3 rounded-2xl w-fit mx-auto mb-1 flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Clock size={24} />
        </div>

        <div>
          <h3 className="m-0 text-base font-bold text-semantic-textPrimary">
            {t('academy.extend_subscription', 'تمديد اشتراك الأكاديمية')}
          </h3>
          <p className="text-sky-400 text-xs font-semibold mt-1">
            {getSafeText(extendModalAcademy.name)}
          </p>
        </div>

        {/* خيارات الأيام السريعة */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => onExtend(extendModalAcademy.id, 7)} 
            className="p-2.5 rounded-xl cursor-pointer font-bold text-xs transition-all bg-semantic-surfaceInput border border-semantic-borderInput text-semantic-textPrimary hover:border-semantic-borderHover active:scale-[0.98]"
          >
            {t('academy.add_7_days', '+7 أيام')}
          </button>

          <button 
            onClick={() => onExtend(extendModalAcademy.id, 14)} 
            className="p-2.5 rounded-xl cursor-pointer font-bold text-xs transition-all bg-semantic-surfaceInput border border-semantic-borderInput text-semantic-textPrimary hover:border-semantic-borderHover active:scale-[0.98]"
          >
            {t('academy.add_14_days', '+14 يوماً')}
          </button>

          <button 
            onClick={() => onExtend(extendModalAcademy.id, 30)} 
            className="p-2.5 rounded-xl cursor-pointer font-bold text-xs transition-all bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:scale-[0.98]"
          >
            {t('academy.add_30_days', '+30 يوماً')}
          </button>
        </div>

        {/* إدخال عدد أيام مخصص */}
        <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-semantic-borderCard space-y-2">
          <label className="block text-xs font-medium text-semantic-textSecondary text-right">
            {t('academy.custom_days', 'عدد أيام مخصص:')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              placeholder="مثال: 60"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className={`${UI.input} flex-1 text-xs`}
            />
            <button
              type="submit"
              disabled={!customDays}
              className="px-4 py-2 bg-semantic-actionPrimary hover:opacity-90 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {t('common.confirm', 'تأكيد')}
            </button>
          </div>
        </form>

        {/* زر الإلغاء */}
        <button 
          onClick={onClose} 
          className="w-full bg-transparent border-0 text-semantic-textMuted hover:text-semantic-textPrimary cursor-pointer text-xs transition-colors py-1"
        >
          {t('common.cancel', 'إلغاء')}
        </button>
      </div>
    </div>
  );
}
