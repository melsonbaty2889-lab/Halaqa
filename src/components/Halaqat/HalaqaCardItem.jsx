import React from 'react';
import { User, Clock, Video, AlertCircle, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';
import { getLocalizedContent } from './HalaqaConstants';
import { formatTimeString } from '@/utils/dateUtils';

export default function HalaqaCardItem({ 
  halaqa, 
  viewMode = 'active', 
  layoutMode = 'grid',
  getLocalizedText, 
  onNavigateToAttendance, 
  onToggleArchiveHalaqa,
  onEditHalaqa
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';

  const halaqaName = getLocalizedContent(halaqa?.name, currentLang, getLocalizedText) || halaqa?.name_text;
  
  const rawTeacher = halaqa?.teacher || halaqa?.teacher_name || halaqa?.teacher_id;
  let teacherName = '';

  if (typeof rawTeacher === 'object' && rawTeacher !== null) {
    teacherName = getLocalizedContent(rawTeacher.name || rawTeacher.full_name, currentLang, getLocalizedText) || rawTeacher.email;
  } else if (typeof rawTeacher === 'string') {
    teacherName = rawTeacher;
  }

  const hasTeacher = Boolean(teacherName || halaqa?.teacher_id);

  const renderFormattedTime = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('ص') || timeStr.includes('م') || timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
      return timeStr;
    }
    const [hours, minutes] = timeStr.split(':');
    if (hours !== undefined && minutes !== undefined) {
      const dummyDate = new Date();
      dummyDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return formatTimeString(dummyDate, currentLang);
    }
    return timeStr;
  };

  const startTimeFormatted = renderFormattedTime(halaqa?.start_time);
  const endTimeFormatted = renderFormattedTime(halaqa?.end_time);

  // وضع القائمة المنسق (List Mode)
  if (layoutMode === 'list') {
    return (
      <div className={`${UI.card} flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 hover:border-semantic-borderHover transition-all`}>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-base font-extrabold text-semantic-textPrimary m-0 truncate">
              {halaqaName || t('unnamedHalaqa', 'حلقة بدون اسم')}
            </h4>
            {halaqa?.is_archived ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderCard font-bold shrink-0">
                {t('archived', 'مؤرشفة')}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-semantic-successBg text-semantic-success border border-semantic-successBorder/30 font-bold shrink-0">
                {t('activeSession', 'نشطة')}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-semantic-textSecondary">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-semantic-actionPrimary shrink-0" />
              <span className="font-semibold truncate">
                {hasTeacher ? (teacherName || t('unnamedTeacher', 'معلم غير محدد')) : t('unassigned', 'بلا معلم')}
              </span>
            </div>
            {(startTimeFormatted || endTimeFormatted) && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-semantic-textMuted shrink-0" />
                <span className="font-semibold">{startTimeFormatted} {endTimeFormatted && `- ${endTimeFormatted}`}</span>
              </div>
            )}
          </div>
        </div>

        {/* أزرار الإجراءات المنتظمة في وضع القائمة */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-semantic-borderCard justify-end">
          <button 
            type="button"
            onClick={() => onNavigateToAttendance?.(halaqa?.id)} 
            className={`${UI.btnEmerald} py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0`}
          >
            <Video size={14} />
            <span>{t('goToAttendance', 'الجلسة المباشرة')}</span>
          </button>

          {onEditHalaqa && (
            <button
              type="button"
              onClick={() => onEditHalaqa(halaqa)}
              className={`${UI.btnSecondary} !w-9 !h-9 p-0 flex items-center justify-center text-xs font-bold shrink-0 rounded-xl`}
              title={t('edit', 'تعديل')}
            >
              <Edit3 size={14} />
            </button>
          )}

          <button 
            type="button"
            onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, halaqa?.is_archived)} 
            className={`${UI.btnSecondary} px-3 py-2 text-xs font-bold shrink-0 rounded-xl`}
          >
            {viewMode === 'active' ? t('archive', 'أرشفة') : t('activate', 'تنشيط')}
          </button>
        </div>
      </div>
    );
  }

  // وضع الشبكة (Grid Mode)
  return (
    <div className={`${UI.card} flex flex-col justify-between gap-4 p-4 hover:border-semantic-borderHover transition-all h-full`}>
      <div>
        <div className="flex justify-between items-start gap-2 mb-2.5">
          <h4 className="text-sm font-extrabold text-semantic-textPrimary m-0 line-clamp-1">
            {halaqaName || t('unnamedHalaqa', 'حلقة بدون اسم')}
          </h4>
          
          {halaqa?.is_archived ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderCard font-bold shrink-0">
              {t('archived', 'مؤرشفة')}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-semantic-successBg text-semantic-success border border-semantic-successBorder/30 font-bold shrink-0">
              {t('activeSession', 'نشطة')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-semantic-textSecondary mb-2.5">
          {hasTeacher ? (
            <>
              <User size={14} className="text-semantic-actionPrimary shrink-0" />
              <span className="truncate font-semibold">
                {teacherName || t('unnamedTeacher', 'معلم غير محدد')}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-semantic-actionPrimary bg-semantic-actionPrimary/10 px-2.5 py-1 rounded-lg border border-semantic-actionPrimary/20 w-full">
              <AlertCircle size={13} className="shrink-0" />
              <span className="text-[11px] font-bold">{t('unassigned', 'بانتظار تعيين معتمد')}</span>
            </div>
          )}
        </div>

        {(startTimeFormatted || endTimeFormatted) && (
          <div className="flex items-center gap-2 text-[12px] text-semantic-textSecondary">
            <Clock size={13} className="text-semantic-textMuted shrink-0" />
            <span className="font-semibold">
              {startTimeFormatted} {endTimeFormatted && `- ${endTimeFormatted}`}
            </span>
            {halaqa?.timezone && (
              <span className="text-[10px] bg-semantic-surfaceInput px-1.5 py-0.5 rounded text-semantic-textMuted border border-semantic-borderCard font-mono">
                {halaqa.timezone}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-semantic-borderCard pt-3 mt-1">
        <button 
          type="button"
          onClick={() => onNavigateToAttendance?.(halaqa?.id)} 
          className={`${UI.btnEmerald} flex-1 py-2 px-2 text-xs font-extrabold flex items-center justify-center gap-1.5`}
          title={t('goToAttendance', 'الانضمام للجلسة المباشرة')}
        >
          <Video size={14} />
          <span className="truncate">{t('goToAttendance', 'الجلسة المباشرة')}</span>
        </button>

        {onEditHalaqa && (
          <button
            type="button"
            onClick={() => onEditHalaqa(halaqa)}
            className={`${UI.btnSecondary} !w-9 !h-9 p-0 flex items-center justify-center text-xs font-bold shrink-0 rounded-xl`}
            title={t('edit', 'تعديل')}
          >
            <Edit3 size={14} />
          </button>
        )}

        <button 
          type="button"
          onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, halaqa?.is_archived)} 
          className={`${UI.btnSecondary} px-2.5 py-2 text-xs font-bold shrink-0 rounded-xl`}
        >
          {viewMode === 'active' ? t('archive', 'أرشفة') : t('activate', 'تنشيط')}
        </button>
      </div>
    </div>
  );
}
