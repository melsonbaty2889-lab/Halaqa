import React from 'react';
import { User, Clock, Video, AlertCircle, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';
import { getLocalizedContent } from './HalaqaConstants';
import { formatTimeString } from '@/utils/dateUtils';

export default function HalaqaCardItem({ 
  halaqa, 
  viewMode = 'active', 
  getLocalizedText, 
  onNavigateToAttendance, 
  onToggleArchiveHalaqa,
  onEditHalaqa
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';

  // استخراج بيانات المعلم واسم الحلقة بصورة آمنة وموحدة
  const halaqaName = getLocalizedContent(halaqa?.name, currentLang, getLocalizedText) || halaqa?.name_text;
  
  const rawTeacher = halaqa?.teacher || halaqa?.teacher_name || halaqa?.teacher_id;
  let teacherName = '';

  if (typeof rawTeacher === 'object' && rawTeacher !== null) {
    teacherName = getLocalizedContent(rawTeacher.name || rawTeacher.full_name, currentLang, getLocalizedText) || rawTeacher.email;
  } else if (typeof rawTeacher === 'string') {
    teacherName = rawTeacher;
  }

  const hasTeacher = Boolean(teacherName || halaqa?.teacher_id);

  // دالة تحويل التوقيت القادم من قاعدة البيانات للعرض المنسق
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

  return (
    <div className={`${UI.card} flex flex-col justify-between gap-4 p-4 hover:border-semantic-borderHover transition-all`}>
      <div>
        {/* عنوان الحلقة وحالتها */}
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

        {/* معلومات المعلم */}
        <div className="flex items-center gap-1.5 text-xs text-semantic-textSecondary mb-2.5">
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

        {/* توقيت الحلقة المنسق */}
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

      {/* أزرار الإجراءات */}
      <div className="flex items-center gap-1.5 border-t border-semantic-borderCard pt-3 mt-1">
        <button 
          type="button"
          onClick={() => onNavigateToAttendance?.(halaqa?.id)} 
          className={`${UI.btnEmerald} flex-1 py-2 px-2 text-xs font-extrabold flex items-center justify-center gap-1`}
          title={t('goToAttendance', 'الانضمام للجلسة المباشرة')}
        >
          <Video size={14} />
          <span className="truncate">{t('goToAttendance', 'الجلسة المباشرة')}</span>
        </button>

        {onEditHalaqa && (
          <button
            type="button"
            onClick={() => onEditHalaqa(halaqa)}
            className={`${UI.btnSecondary} p-2 text-xs font-bold shrink-0`}
            title={t('edit', 'تعديل')}
          >
            <Edit3 size={14} />
          </button>
        )}

        <button 
          type="button"
          onClick={() => onToggleArchiveHalaqa?.(halaqa?.id, halaqa?.is_archived)} 
          className={`${UI.btnSecondary} px-2.5 py-2 text-xs font-bold shrink-0`}
        >
          {viewMode === 'active' ? t('archive', 'أرشفة') : t('activate', 'تنشيط')}
        </button>
      </div>
    </div>
  );
}
