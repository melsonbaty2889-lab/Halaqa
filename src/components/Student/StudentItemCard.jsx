// src/components/Student/StudentItemCard.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, ChevronLeft, ChevronRight, Phone, Calendar, BookOpen } from 'lucide-react';
import { formatName } from '@/utils/formatters';
import { useAcademy } from '@/context/AcademyContext';

const StudentItemCard = ({ student, onClick, getStatusBadge, calendarType }) => {
  const { t, i18n } = useTranslation();
  const { academy } = useAcademy?.() || {};
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;

  // اعتماد التقويم الممرر كـ prop أو المأخوذ من Context
  const activeCalendarType = calendarType || academy?.calendar_type || 'gregorian';

  const studentName = formatName(
    student?.name || student?.full_name || t('unnamed_student', 'طالب بدون اسم')
  );

  const phone = student?.parent_phone || student?.parent_whatsapp || student?.phone || '';
  const joinDate = student?.created_at || student?.join_date || null;

  // معالجة اسم الحلقة
  const rawHalaqa = student?.halaqa_name || student?.halaqas?.name;
  const halaqaName = typeof rawHalaqa === 'object' && rawHalaqa !== null
    ? (isRtl ? rawHalaqa.ar || rawHalaqa.en : rawHalaqa.en || rawHalaqa.ar)
    : rawHalaqa || '';

  // دالة تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    if (activeCalendarType === 'hijri') {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    }

    return date.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US');
  };

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      onClick={() => onClick && onClick(student)}
      className="bg-semantic-surfaceCard border border-semantic-borderCard hover:border-semantic-actionPrimary/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        {/* معلومات الطالب */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput flex items-center justify-center text-semantic-textSecondary group-hover:border-semantic-actionPrimary/50 group-hover:text-semantic-actionPrimary transition-colors shrink-0 overflow-hidden">
            {student?.avatar_url ? (
              <img src={student.avatar_url} alt={studentName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-semantic-textPrimary text-sm sm:text-base group-hover:text-semantic-actionPrimary transition-colors leading-tight">
                {studentName}
              </h3>
              {student?.student_code && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md bg-semantic-surfaceInput text-semantic-textSecondary border border-semantic-borderInput font-mono">
                  #{student.student_code}
                </span>
              )}
            </div>

            <div className="flex items-center gap-x-3 gap-y-1.5 text-xs text-semantic-textSecondary mt-1.5 flex-wrap">
              {halaqaName && (
                <span className="flex items-center gap-1 text-semantic-actionPrimary font-medium">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{halaqaName}</span>
                </span>
              )}

              {phone && (
                <span className="flex items-center gap-1 font-mono text-[11px] text-semantic-textSecondary" dir="ltr">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>{phone}</span>
                </span>
              )}

              {joinDate && (
                <span className="flex items-center gap-1 text-[11px] text-semantic-textSecondary">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{formatDate(joinDate)}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* شارة الحالة والسهم */}
        <div className="flex items-center gap-2 shrink-0">
          {typeof getStatusBadge === 'function' && (
            <div className="shrink-0">
              {getStatusBadge(student)}
            </div>
          )}
          <ArrowIcon className="w-4 h-4 text-semantic-textSecondary group-hover:text-semantic-actionPrimary transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};

export default StudentItemCard;
