import React from 'react';
import { 
  Building2, CheckCircle, ShieldAlert, AlertTriangle, 
  ExternalLink, MessageCircle, MoreVertical, PlusCircle, Check
} from 'lucide-react';

export default function AcademyCard({
  academy,
  isRtl,
  selectedAcademyIds,
  onToggleSelect,
  onOpenDrawer,
  onStatusToggle,
  onExtendClick,
  onWhatsAppClick,
  onOpenPhoneModal,
  onSelectAcademy,
  processingId,
  getSafeText
}) {
  const isSelected = selectedAcademyIds.includes(academy.id);

  return (
    <div className={`bg-slate-900/90 border rounded-xl p-4 transition-all relative ${
      isSelected ? 'border-sky-500 bg-slate-900' : academy.is_active ? 'border-slate-800' : 'border-rose-900/40 bg-rose-950/10'
    }`}>
      
      {/* Checkbox للإجراءات الجماعية */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => onToggleSelect(academy.id)}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
            isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-700 bg-slate-950/50 hover:border-slate-500'
          }`}
        >
          {isSelected && <Check size={12} strokeWidth={3} />}
        </button>
      </div>

      <div className="flex justify-between items-start mb-3 pr-2 pl-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 border border-slate-700 font-bold text-base">
            {getSafeText(academy.name)?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="m-0 text-white font-bold text-sm flex items-center gap-2">
              {getSafeText(academy.name)}
              {academy.is_active ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-normal">
                  {isRtl ? 'نشط' : 'Active'}
                </span>
              ) : (
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2 py-0.5 rounded-full font-normal">
                  {isRtl ? 'محظور' : 'Blocked'}
                </span>
              )}
            </h3>
            <p className="m-0 text-xs text-slate-400 mt-0.5">
              {isRtl ? 'المالك:' : 'Owner:'} {getSafeText(academy.ownerProfile?.full_name, 'غير معروف')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/60 rounded-lg p-2.5 mb-3 text-xs border border-slate-800/80 space-y-1">
        <div className="flex justify-between text-slate-400">
          <span>{isRtl ? 'تاريخ التسجيل:' : 'Registered:'}</span>
          <span className="text-slate-300 ltr">{academy.created_at ? new Date(academy.created_at).toLocaleDateString() : '-'}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>{isRtl ? 'انتهاء التجربة:' : 'Trial Ends:'}</span>
          <span className={`font-semibold ${new Date(academy.trial_ends_at) < new Date() ? 'text-rose-400' : 'text-emerald-400'}`}>
            {academy.trial_ends_at ? new Date(academy.trial_ends_at).toLocaleDateString() : '-'}
          </span>
        </div>
      </div>

      {/* الأزرار وشريط التحكم */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* زر دخول للأكاديمية - يظهر دائماً */}
          <button
            onClick={() => onSelectAcademy && onSelectAcademy(academy)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <ExternalLink size={14} /> {isRtl ? 'دخول للأكاديمية' : 'Enter Academy'}
          </button>

          <button
            onClick={() => onOpenDrawer(academy)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium border border-slate-700"
          >
            {isRtl ? 'التفاصيل' : 'Details'}
          </button>

          <button
            onClick={() => onExtendClick(academy)}
            className="bg-amber-950/40 hover:bg-amber-900/40 text-amber-400 border border-amber-500/30 px-2 py-1.5 rounded-lg cursor-pointer text-xs flex items-center gap-1"
          >
            <PlusCircle size={13} /> {isRtl ? 'تمديد' : 'Extend'}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {academy.ownerProfile?.phone ? (
            <button
              onClick={() => onWhatsAppClick(academy.ownerProfile.phone, getSafeText(academy.name))}
              className="bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 p-1.5 rounded-lg cursor-pointer"
              title={isRtl ? 'تواصل واتساب' : 'WhatsApp'}
            >
              <MessageCircle size={15} />
            </button>
          ) : (
            <button
              onClick={() => onOpenPhoneModal(academy)}
              className="bg-slate-800 text-slate-400 border border-slate-700 p-1.5 rounded-lg cursor-pointer hover:text-white"
              title={isRtl ? 'إضافة رقم هاتف' : 'Add Phone'}
            >
              <MessageCircle size={15} />
            </button>
          )}

          <button
            onClick={() => onStatusToggle(academy.id, academy.is_active)}
            disabled={processingId === academy.id}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
              academy.is_active 
                ? 'bg-rose-950/30 text-rose-400 border-rose-800/40 hover:bg-rose-900/40' 
                : 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40'
            }`}
          >
            {processingId === academy.id ? '...' : (academy.is_active ? (isRtl ? 'حظر' : 'Block') : (isRtl ? 'تفعيل' : 'Activate'))}
          </button>
        </div>
      </div>

    </div>
  );
}
