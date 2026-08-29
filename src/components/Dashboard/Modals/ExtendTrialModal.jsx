import React from 'react';
import { Infinity as InfinityIcon } from 'lucide-react';

export default function ExtendTrialModal({
  extendModalAcademy,
  onClose,
  onExtend,
  isRtl,
  getSafeText
}) {
  if (!extendModalAcademy) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 max-w-sm w-full text-white text-center">
        <h3 className="mb-2 text-base font-bold">{isRtl ? 'تمديد اشتراك الأكاديمية' : 'Extend Subscription'}</h3>
        <p className="text-slate-400 text-xs mb-4">{getSafeText(extendModalAcademy.name)}</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button onClick={() => onExtend(extendModalAcademy.id, 7)} className="bg-slate-800 border border-slate-700 text-white p-2.5 rounded-xl cursor-pointer font-bold text-xs">+7 {isRtl ? 'أيام' : 'Days'}</button>
          <button onClick={() => onExtend(extendModalAcademy.id, 30)} className="bg-slate-800 border border-amber-500/40 text-amber-400 p-2.5 rounded-xl cursor-pointer font-bold text-xs">+30 {isRtl ? 'يوم' : 'Days'}</button>
        </div>

        <button onClick={() => onExtend(extendModalAcademy.id, 0, true)} className="w-full bg-sky-600 text-white border-0 p-2.5 rounded-xl cursor-pointer font-bold text-xs mb-3 flex items-center justify-center gap-2">
          <InfinityIcon size={18} /> {isRtl ? 'اشتراك دائم (Lifetime)' : 'Grant Lifetime'}
        </button>

        <button onClick={onClose} className="bg-transparent border-0 text-slate-400 cursor-pointer text-xs">
          {isRtl ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
