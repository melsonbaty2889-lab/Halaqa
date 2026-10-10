/* src/components/Halaqat/HalaqaCardItem.jsx */

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

  const isArchived = Boolean(halaqa?.is_archived);

  return (
    <div className={`${UI.card} flex flex-col justify-between gap-3 p-4 hover:border-semantic-borderHover transition-all w-full max-w-full overflow-hidden`}>
      <div>
        {/* عنوان الحلقة وحالتها */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className="text-sm font-extrabold text-semantic-textPrimary m-0 line-clamp-1">
            {halaqaName || t('unnamedHalaqa', 'حلقة بدون اسم')}
          </h4>
          
          {isArchived ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderCard font-bold shrink-0">
              {t('archived', 'مؤرشفة')}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-semantic-successBg text-semantic-success border border-semantic-successBorder/30 font-bold shrink-0">
              {t('activeSession', 'نشطة')}
            </span>
          )}
        </div>

        {/* معلومات المعلم */}
        <div className="flex items-center gap-1.5 text-xs text-semantic-textSecondary mb-2">
          {hasTeacher ? (
            <>
              <User size={14} className="text-semantic-actionPrimary shrink-0" />
              <span className="truncate font-semibold">
                {teacherName || t('unnamedTeacher', 'معلم غير محدد')}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-semantic-actionPrimary bg-semantic-actionPrimary/10 px-2 py-1 rounded-lg border border-semantic-actionPrimary/20 w-full">
              <AlertCircle size={13} className="shrink-0" />
              <span className="text-[11px] font-bold">{t('unassigned', 'بانتظار تعيين معتمد')}</span>
            </div>
          )}
        </div>

        {/* التوقيت */}
        {(startTimeFormatted || endTimeFormatted) && (
          <div className="flex items-center gap-1.5 text-[11px] text-semantic-textSecondary">
            <Clock size={13} className="text-semantic-textMuted shrink-0" />
            <span className="font-semibold truncate">
              {startTimeFormatted} {endTimeFormatted && `- ${endTimeFormatted}`}
            </span>
          </div>
        )}
      </div>

      {/* أزرار الإجراءات - محسنة لتتطابق تماماً مع حدود البطاقة بدون أي خروج */}
      <div className="grid grid-cols-12 items-center gap-1.5 border-t border-semantic-borderCard pt-3 mt-1 w-full">
        <button 
          type="button"
          onClick={() => onNavigateToAttendance?.(halaqa?.id)} 
          className={`${UI.btnEmerald} col-span-7 py-2 px-2 text-xs font-extrabold flex items-center justify-center gap-1 min-w-0`}
          title={t('goToAttendance', 'الجلسة المباشرة')}
        >
          <Video size={13} className="shrink-0" />
          <span className="truncate">{t('goToAttendance', 'الجلسة المباشرة')}</span>
        </button>

        {onEditHalaqa && (
          <button
            type="button"
            onClick={() => onEditHalaqa(halaqa)}
            className={`${UI.btnSecondary} col-span-2 py-2 px-0 flex items-center justify-center text-xs font-bold rounded-xl`}
            title={t('edit', 'تعديل')}
          >
            <Edit3 size={14} />
          </button>
        )}

        <button 
          type="button"
          onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, isArchived)} 
          className={`${UI.btnSecondary} col-span-3 py-2 px-1 text-[11px] font-bold flex items-center justify-center rounded-xl truncate`}
        >
          <span className="truncate">{isArchived ? t('activate', 'تنشيط') : t('archive', 'أرشفة')}</span>
        </button>
      </div>
    </div>
  );
}
