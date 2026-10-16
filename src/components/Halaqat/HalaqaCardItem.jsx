/* src/components/Halaqat/HalaqaCardItem.jsx */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronLeft, ChevronRight, User, Clock } from 'lucide-react';
import { getLocalizedContent } from './HalaqaConstants';
import { formatTimeRange } from '@/utils/formatters';

export default function HalaqaCardItem({ 
  halaqa, 
  teachers = [],
  getLocalizedText, 
  onSelectHalaqa,
  onEdit,
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
    teacherName = getLocalizedContent(rawTeacher.name || rawTeacher.full_name, getLocalizedText) || rawTeacher.email;
  } else if (typeof rawTeacher === 'string') {
    teacherName = rawTeacher;
  }

  if (!teacherName && halaqa?.teacher_id && Array.isArray(teachers)) {
    const foundTeacher = teachers.find(t => String(t.id) === String(halaqa.teacher_id));
    if (foundTeacher) {
      teacherName = getLocalizedContent(foundTeacher.name || foundTeacher.full_name, getLocalizedText) || foundTeacher.email;
    }
  }

  const formattedTimeRange = formatTimeRange(halaqa?.start_time, halaqa?.end_time, currentLang);
  const isArchived = Boolean(halaqa?.is_archived);
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  // التعامل مع النقر لفتح التفاصيل أو الجلسة المباشرة بدلاً من نموذج التعديل
  const handleClick = () => {
    if (onNavigateToAttendance) {
      onNavigateToAttendance(halaqa?.id);
    } else if (onSelectHalaqa) {
      onSelectHalaqa(halaqa);
    } else if (onEdit) {
      onEdit(halaqa);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-semantic-surfaceCard border border-semantic-borderCard hover:border-semantic-actionPrimary/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg relative overflow-hidden"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        {/* معلومات الحلقة الأساسية */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput flex items-center justify-center text-semantic-textSecondary group-hover:border-semantic-actionPrimary/50 group-hover:text-semantic-actionPrimary transition-colors shrink-0 overflow-hidden">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-semantic-actionPrimary" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-semantic-textPrimary text-sm sm:text-base group-hover:text-semantic-actionPrimary transition-colors leading-tight m-0 truncate">
                {halaqaName || t('unnamedHalaqa', 'حلقة بدون اسم')}
              </h3>
            </div>

            <div className="flex items-center gap-x-3 gap-y-1 text-xs text-semantic-textSecondary mt-1.5 flex-wrap">
              {teacherName ? (
                <span className="flex items-center gap-1 font-medium text-semantic-textSecondary">
                  <User className="w-3.5 h-3.5 shrink-0 text-semantic-actionPrimary" />
                  <span className="truncate">{teacherName}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 font-medium text-amber-500">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('unassigned', 'بدون معلم')}</span>
                </span>
              )}

              {formattedTimeRange && (
                <span className="flex items-center gap-1 text-[11px] text-semantic-textMuted">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{formattedTimeRange}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* شارة حالة الحلقة والسهم */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            isArchived
              ? 'bg-semantic-surfaceInput text-semantic-textMuted border-semantic-borderCard'
              : 'bg-semantic-successBg text-semantic-success border-semantic-successBorder/30'
          }`}>
            {isArchived ? t('archived', 'مؤرشفة') : t('activeSession', 'نشطة')}
          </span>

          <ArrowIcon className="w-4 h-4 text-semantic-textSecondary group-hover:text-semantic-actionPrimary transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}
