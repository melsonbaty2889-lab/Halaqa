import React from 'react';
import { User, Clock, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/components/UI/UI';

export default function HalaqaCardItem({ 
  halaqa, 
  viewMode, 
  getLocalizedText, 
  onNavigateToAttendance, 
  onToggleArchiveHalaqa 
}) {
  const { t } = useTranslation();

  return (
    <div className={`${UI.card} flex flex-col justify-between gap-4 p-4`}>
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className="text-sm font-extrabold text-semantic-textPrimary m-0">
            {getLocalizedText ? getLocalizedText(halaqa.name) : (halaqa.name?.ar || '')}
          </h4>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-semantic-success/15 text-semantic-success border border-semantic-success/30 font-bold">
            {t('activeSession', 'جلسة نشطة')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-semantic-textSecondary mb-2">
          <User size={14} className="text-semantic-actionPrimary" />
          <span className="truncate">
            {getLocalizedText 
              ? getLocalizedText(halaqa.teacher_name || halaqa.teacher, t('unassigned', 'بانتظار تعيين معتمد'))
              : t('unassigned', 'بانتظار تعيين معتمد')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-semantic-textSecondary">
          <Clock size={13} className="text-semantic-textMuted" />
          <span>{halaqa.start_time || '16:00'} - {halaqa.end_time || '17:15'}</span>
          <span className="text-[11px] bg-semantic-surfaceInput px-1.5 py-0.5 rounded text-semantic-textMuted border border-semantic-borderCard">
            {halaqa.timezone || 'UTC'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-semantic-borderCard pt-3">
        <button 
          type="button"
          onClick={() => onNavigateToAttendance?.(halaqa.id)} 
          className={`${UI.btnPrimary} flex-1 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5`}
        >
          <Video size={14} />
          {t('goToAttendance', 'الانضمام للجلسة المباشرة')}
        </button>

        <button 
          type="button"
          onClick={() => onToggleArchiveHalaqa?.(halaqa.id, halaqa.is_archived)} 
          className="px-3.5 py-2.5 rounded-xl border border-semantic-borderCard bg-transparent text-semantic-textSecondary text-xs font-bold cursor-pointer hover:border-semantic-borderHover hover:text-semantic-textPrimary transition-colors"
        >
          {viewMode === 'active' ? t('archive', 'أرشفة') : t('activate', 'تنشيط')}
        </button>
      </div>
    </div>
  );
}
