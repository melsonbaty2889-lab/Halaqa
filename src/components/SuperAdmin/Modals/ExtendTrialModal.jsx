import React from 'react';
import { useTranslation } from 'react-i18next';
import { Infinity as InfinityIcon, Clock } from 'lucide-react';

export default function ExtendTrialModal({
  extendModalAcademy,
  onClose,
  onExtend,
  getSafeText
}) {
  const { t } = useTranslation();

  if (!extendModalAcademy) return null;

  return (
    <div className="fixed inset-0 bg-[#070b11]/82 backdrop-blur-md flex items-center justify-center z-[2000] p-4 transition-all duration-300">
      <div className="bg-[#0a0f1c] border border-white/8 rounded-2xl p-6 max-w-sm w-full text-white text-center shadow-2xl transition-all">
        {/* الأيقونة والترويسة */}
        <div className="p-3 rounded-2xl w-fit mx-auto mb-3 flex items-center justify-center bg-amber-500/10 text-amber-500">
          <Clock size={24} />
        </div>

        <h3 className="m-0 mb-1 text-base font-bold">
          {t('academy.extend_subscription', 'تمديد اشتراك الأكاديمية')}
        </h3>
        
        <p className="text-slate-400 text-xs mb-5 font-medium">
          {getSafeText(extendModalAcademy.name)}
        </p>

        {/* خيارات التمديد بالتدريج */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <button 
            onClick={() => onExtend(extendModalAcademy.id, 7)} 
            className="p-3 rounded-xl cursor-pointer font-bold text-xs transition-all bg-[#070b11] border border-white/8 text-white hover:border-amber-500/50 active:scale-[0.98]"
          >
            {t('academy.add_7_days', '+7 أيام')}
          </button>

          <button 
            onClick={() => onExtend(extendModalAcademy.id, 30)} 
            className="p-3 rounded-xl cursor-pointer font-bold text-xs transition-all bg-amber-500/5 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 active:scale-[0.98]"
          >
            {t('academy.add_30_days', '+30 يوم')}
          </button>
        </div>

        {/* زر الاشتراك الدائم */}
        <button 
          onClick={() => onExtend(extendModalAcademy.id, 0, true)} 
          className="w-full bg-sky-500/15 border border-sky-500/30 text-sky-400 p-3 rounded-xl cursor-pointer font-bold text-xs mb-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md hover:bg-sky-500/25"
        >
          <InfinityIcon size={18} /> 
          <span>{t('academy.grant_lifetime', 'اشتراك دائم (Lifetime)')}</span>
        </button>

        {/* زر الإلغاء */}
        <button 
          onClick={onClose} 
          className="bg-transparent border-0 text-slate-400 hover:text-white cursor-pointer text-xs transition-colors py-1 px-3"
        >
          {t('common.cancel', 'إلغاء')}
        </button>
      </div>
    </div>
  );
}
