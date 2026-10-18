/* src/components/Halaqat/HalaqaCardItem.jsx */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronLeft, ChevronRight, User, Clock, Edit3, Users, Archive, CheckCircle } from 'lucide-react';
import { getLocalizedContent } from './HalaqaConstants';
import { formatTimeRange } from '@/utils/formatters';
import { getDaysOptions } from '@/constants/days';

export default function HalaqaCardItem({ 
  halaqa, 
  teachers = [],
  getLocalizedText, 
  onSelectHalaqa,
  onEdit,
  onToggleArchive, // دالة جديدة للتحكم في الأرشفة والتنشيط بضغطة زر
  onNavigateToAttendance 
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  const halaqaName = getLocalizedContent(halaqa?.name, currentLang, getLocalizedText) || halaqa?.name_text;
  
  // جلب اسم المعلم
  const rawTeacher = halaqa?.teacher || halaqa?.teacher_name || halaqa?.teacher_id;
  let teacherName = '';

  if (typeof rawTeacher === 'object' && rawTeacher !== null) {
    teacherName = getLocalizedContent(rawTeacher.name || rawTeacher.full_name, currentLang, getLocalizedText) || rawTeacher.email;
  } else if (typeof rawTeacher === 'string') {
    teacherName = rawTeacher;
  }

  if (!teacherName && halaqa?.teacher_id && Array.isArray(teachers)) {
    const foundTeacher = teachers.find(t => String(t.id) === String(halaqa.teacher_id));
    if (foundTeacher) {
      teacherName = getLocalizedContent(foundTeacher.name || foundTeacher.full_name, currentLang, getLocalizedText) || foundTeacher.email;
    }
  }

  const formattedTimeRange = formatTimeRange(halaqa?.start_time, halaqa?.end_time, currentLang);
  const isArchived = Boolean(halaqa?.is_archived);
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  // تنسيق أيام الانعقاد بالأسماء المترجمة
  const formatDays = (daysArray) => {
    if (!Array.isArray(daysArray) || daysArray.length === 0) return null;
    const daysOptions = getDaysOptions(t);
    
    return daysArray.map(dayVal => {
      if (!dayVal) return '';
      const safeVal = String(dayVal).toLowerCase();
      const found = daysOptions.find(d => 
        (d?.value || '').toLowerCase() === safeVal || 
        (d?.label || '').toLowerCase() === safeVal ||
        (d?.short || '').toLowerCase() === safeVal ||
        (d?.value || '').toLowerCase().startsWith(safeVal)
      );
      return found ? found.label : dayVal;
    }).filter(Boolean).join(isRtl ? '، ' : ', ');
  };

  const formattedDays = formatDays(halaqa?.days_of_week);
  const studentsCount = halaqa?.students_count || halaqa?.student_count || 0;
  const maxStudents = halaqa?.max_students || 15;

  const handleCardClick = () => {
    if (onNavigateToAttendance) {
      onNavigateToAttendance(halaqa?.id, { isArchived });
    } else if (onSelectHalaqa) {
      onSelectHalaqa(halaqa);
    }
  };

  const hasTimeData = Boolean(formattedDays || formattedTimeRange);

  return (
    <div
      onClick={handleCardClick}
      className={`bg-semantic-surfaceCard border rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg relative overflow-hidden flex flex-col justify-between gap-3 text-start ${
        isArchived 
          ? 'border-semantic-borderCard/60 opacity-80 hover:opacity-100 bg-semantic-surfaceCard/60' 
          : 'border-semantic-borderCard hover:border-semantic-actionPrimary/50'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. السطر العلوي: الأيقونة + اسم الحلقة + شارة التنشيط/الأرشفة القابلة للضغط وأزرار التحكم */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-semantic-surfaceInput border flex items-center justify-center shrink-0 transition-colors ${
            isArchived 
              ? 'border-semantic-borderCard text-semantic-textMuted' 
              : 'border-semantic-borderInput text-semantic-actionPrimary group-hover:border-semantic-actionPrimary/50'
          }`}>
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-semantic-textPrimary text-sm sm:text-base group-hover:text-semantic-actionPrimary transition-colors leading-snug m-0 truncate text-start">
              {halaqaName || t('unnamedHalaqa', 'حلقة بدون اسم')}
            </h3>
          </div>
        </div>

        {/* الحاوية الجانبية لأزرار التحكم والشارة القابلة للنقر */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* زر تبديل الحالة (نشطة / مؤرشفة) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleArchive) onToggleArchive(halaqa);
            }}
            title={isArchived ? t('clickToActivate', 'انقر للتنشيط') : t('clickToArchive', 'انقر للأرشفة')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
              isArchived
                ? 'bg-semantic-surfaceInput text-semantic-textMuted border-semantic-borderCard hover:border-semantic-actionPrimary hover:text-semantic-actionPrimary'
                : 'bg-semantic-successBg text-semantic-success border-semantic-successBorder/30 hover:opacity-80'
            }`}
          >
            {isArchived ? <Archive size={10} className="shrink-0" /> : <CheckCircle size={10} className="shrink-0" />}
            <span>{isArchived ? t('archived', 'مؤرشفة') : t('activeSession', 'نشطة')}</span>
          </button>

          {/* زر التعديل */}
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(halaqa);
              }}
              className="p-1.5 rounded-lg text-semantic-textMuted hover:text-semantic-actionPrimary hover:bg-semantic-surfaceInput transition-colors cursor-pointer shrink-0"
              title={t('common.edit', 'تعديل')}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          <ArrowIcon className="w-4 h-4 text-semantic-textSecondary group-hover:text-semantic-actionPrimary transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 shrink-0" />
        </div>
      </div>

      {/* 2. السطر الأوسط: اسم المعلم الكامل + عدد الطلاب */}
      <div className="flex items-center justify-between gap-2 text-xs border-t border-semantic-borderInput/40 pt-2.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <User className="w-3.5 h-3.5 shrink-0 text-semantic-actionPrimary" />
          <span className="font-semibold text-semantic-textSecondary truncate">
            {teacherName || <span className="text-amber-500/90 font-normal">{t('unassigned', 'بدون معلم')}</span>}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-semantic-textMuted bg-semantic-surfaceInput/60 px-2 py-0.5 rounded-lg border border-semantic-borderInput/50 shrink-0">
          <Users className="w-3 h-3 shrink-0 text-semantic-actionPrimary" />
          <span>
            <bdi>{studentsCount}</bdi>/<bdi>{maxStudents}</bdi> {studentsCount === 1 ? t('students_unit', 'طالب') : t('students_plural', 'طلاب')}
          </span>
        </div>
      </div>

      {/* 3. السطر السفلي: المواعيد */}
      {hasTimeData && (
        <div className="flex items-center gap-1.5 text-[11px] text-semantic-textMuted bg-semantic-surfaceInput/30 p-2 rounded-xl border border-semantic-borderInput/30 mt-0.5">
          <Clock className="w-3 h-3 shrink-0 text-semantic-actionPrimary/80" />
          <div className="truncate flex-1 text-start">
            {formattedDays && <span className="font-medium text-semantic-textSecondary">{formattedDays}</span>}
            {formattedDays && formattedTimeRange && <span className="mx-1.5 opacity-40">•</span>}
            {formattedTimeRange && <span>{formattedTimeRange}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
