import React from 'react';
import { User, Clock, Video, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';

export default function HalaqaCardItem({ 
  halaqa, 
  viewMode, 
  getLocalizedText, 
  onNavigateToAttendance, 
  onToggleArchiveHalaqa 
}) {
  const { t } = useTranslation();
  const hasTeacher = Boolean(halaqa?.teacher_id || halaqa?.teacher_name || halaqa?.teacher);

  return (
    <div className={`${UI.card} flex flex-col justify-between gap-4 p-4 hover:border-semantic-borderHover`}>
      <div>
        {/* عنوان الحلقة وحالتها */}
        <div className="flex justify-between items-start gap-2 mb-2.5">
          <h4 className="text-sm font-extrabold text-semantic-textPrimary m-0 line-clamp-1">
            {getLocalizedText ? getLocalizedText(halaqa?.name) : halaqa?.name}
          </h4>
          
          {halaqa?.is_archived ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderCard font-bold shrink-0">
              {t('archived', 'مؤرشفة')}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-semantic-successBg text-semantic-success border border-semantic-successBorder/30 font-bold shrink-0">
              {t('activeSession', 'جلسة نشطة')}
            </span>
          )}
        </div>

        {/* معلومات المعلم */}
        <div className="flex items-center gap-1.5 text-xs text-semantic-textSecondary mb-2.5">
          {hasTeacher ? (
            <>
              <User size={14} className="text-semantic-actionPrimary shrink-0" />
              <span className="truncate">
                {getLocalizedText 
                  ? getLocalizedText(halaqa?.teacher_name || halaqa?.teacher)
                  : (halaqa?.teacher_name || halaqa?.teacher)}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-semantic-actionPrimary bg-semantic-actionPrimary/10 px-2 py-1 rounded-lg border border-semantic-actionPrimary/20 w-full">
              <AlertCircle size={13} className="shrink-0" />
              <span className="text-[11px] font-bold">{t('unassigned', 'بانتظار تعيين معتمد')}</span>
            </div>
          )}
        </div>

        {/* توقيت الحلقة */}
        {(halaqa?.start_time || halaqa?.end_time) && (
          <div className="flex items-center gap-2 text-[12px] text-semantic-textSecondary">
            <Clock size={13} className="text-semantic-textMuted shrink-0" />
            <span>
              {halaqa?.start_time} {halaqa?.end_time && `- ${halaqa?.end_time}`}
            </span>
            {halaqa?.timezone && (
              <span className="text-[11px] bg-semantic-surfaceInput px-1.5 py-0.5 rounded text-semantic-textMuted border border-semantic-borderCard">
                {halaqa.timezone}
              </span>
            )}
          </div>
        )}
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex items-center gap-2 border-t border-semantic-borderCard pt-3 mt-1">
        <button 
          type="button"
          onClick={() => onNavigateToAttendance?.(halaqa?.id)} 
          className={`${UI.btnPrimary} flex-1 py-2 text-xs font-extrabold flex items-center justify-center gap-1.5`}
        >
          <Video size={14} />
          {t('goToAttendance', 'الانضمام للجلسة المباشرة')}
        </button>

        <button 
          type="button"
          onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, halaqa?.is_archived)} 
          className={`${UI.btnSecondary} w-auto px-3.5 py-2 text-xs font-bold shrink-0`}
        >
          {viewMode === 'active' ? t('archive', 'أرشفة') : t('activate', 'تنشيط')}
        </button>
      </div>
    </div>
  );
}
