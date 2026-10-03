import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ExternalLink, MessageCircle, PlusCircle, Check
} from 'lucide-react';

export default function AcademyCard({
  academy,
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
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const isSelected = selectedAcademyIds.includes(academy.id);

  const handleEnterAcademy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof onSelectAcademy === 'function') {
      onSelectAcademy(academy);
    }
    window.dispatchEvent(new CustomEvent('select-admin-academy', { detail: academy }));
  };

  return (
    <div className={`card-surface p-4 rounded-xl transition-all relative border ${
      isSelected 
        ? 'border-sky-500 ring-1 ring-sky-500/50' 
        : academy.is_active 
          ? 'border-semantic-borderCard' 
          : 'border-semantic-danger/40 bg-semantic-dangerBg/10'
    }`}>
      
      {/* Checkbox للإجراءات الجماعية */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => onToggleSelect(academy.id)}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
            isSelected 
              ? 'bg-sky-500 border-sky-500 text-white' 
              : 'border-semantic-borderInput bg-semantic-surfaceInput hover:border-semantic-borderHover'
          }`}
        >
          {isSelected && <Check size={12} strokeWidth={3} />}
        </button>
      </div>

      <div className="flex justify-between items-start mb-3 pr-2 pl-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20 font-bold text-base">
            {getSafeText(academy.name)?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="m-0 text-semantic-textPrimary font-bold text-sm flex items-center gap-2">
              {getSafeText(academy.name)}
              {academy.is_active ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-normal">
                  {t('common.active', 'نشط')}
                </span>
              ) : (
                <span className="bg-semantic-dangerBg text-semantic-danger border border-semantic-danger/20 text-[10px] px-2 py-0.5 rounded-full font-normal">
                  {t('common.blocked', 'محظور')}
                </span>
              )}
            </h3>
            <p className="m-0 text-xs text-semantic-textSecondary mt-0.5">
              {t('academy.owner_label', 'المالك:')} {getSafeText(academy.ownerProfile?.full_name, t('common.unknown', 'غير معروف'))}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-semantic-surfaceInput/60 rounded-lg p-2.5 mb-3 text-xs border border-semantic-borderInput space-y-1">
        <div className="flex justify-between text-semantic-textSecondary">
          <span>{t('academy.registered_at', 'تاريخ التسجيل:')}</span>
          <span className="text-semantic-textPrimary ltr">
            {academy.created_at ? new Date(academy.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : '-'}
          </span>
        </div>
        <div className="flex justify-between text-semantic-textSecondary">
          <span>{t('academy.trial_ends', 'انتهاء التجربة:')}</span>
          <span className={`font-semibold ${new Date(academy.trial_ends_at) < new Date() ? 'text-semantic-danger' : 'text-semantic-success'}`}>
            {academy.trial_ends_at ? new Date(academy.trial_ends_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : '-'}
          </span>
        </div>
      </div>

      {/* الأزرار وشريط التحكم */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-semantic-borderCard">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleEnterAcademy}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-bold flex items-center gap-1 transition-colors z-20"
          >
            <ExternalLink size={14} /> {t('academy.enter', 'دخول للأكاديمية')}
          </button>

          <button
            onClick={() => onOpenDrawer(academy)}
            className="bg-semantic-surfaceInput hover:bg-semantic-surfaceSecondary text-semantic-textPrimary px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium border border-semantic-borderInput transition-colors"
          >
            {t('common.details', 'التفاصيل')}
          </button>

          <button
            onClick={() => onExtendClick(academy)}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1.5 rounded-lg cursor-pointer text-xs flex items-center gap-1 transition-colors"
          >
            <PlusCircle size={13} /> {t('academy.extend', 'تمديد')}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {academy.ownerProfile?.phone ? (
            <button
              onClick={() => onWhatsAppClick(academy.ownerProfile.phone, getSafeText(academy.name))}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-1.5 rounded-lg cursor-pointer transition-colors"
              title={t('academy.whatsapp_chat', 'تواصل واتساب')}
            >
              <MessageCircle size={15} />
            </button>
          ) : (
            <button
              onClick={() => onOpenPhoneModal(academy)}
              className="bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderInput p-1.5 rounded-lg cursor-pointer hover:text-semantic-textPrimary transition-colors"
              title={t('academy.add_phone', 'إضافة رقم هاتف')}
            >
              <MessageCircle size={15} />
            </button>
          )}

          <button
            onClick={() => onStatusToggle(academy.id, academy.is_active)}
            disabled={processingId === academy.id}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
              academy.is_active 
                ? 'bg-semantic-dangerBg text-semantic-danger border-semantic-danger/30 hover:opacity-90' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {processingId === academy.id ? '...' : (academy.is_active ? t('common.block', 'حظر') : t('common.activate', 'تفعيل'))}
          </button>
        </div>
      </div>

    </div>
  );
}
