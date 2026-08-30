// src/components/Student/StudentItemCard.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, ChevronLeft, ChevronRight, Phone, Calendar, BookOpen } from 'lucide-react';
import { formatName } from '@/utils/formatters';
import { useAcademy } from '@/context/AcademyContext';

const StudentItemCard = ({ student, onClick, getStatusBadge, calendarType = 'gregorian' }) => {
  const { t, i18n } = useTranslation();
  const { academy } = useAcademy?.() || {};
  const isRtl = i18n.dir() === 'rtl';
  const activeCalendarType = calendarType || academy?.calendar_type || 'gregorian';

  const studentName = formatName(student.name || student.full_name || t('students.unnamed', 'بدون اسم'));
  const phone = student.parent_phone || student.parent_whatsapp || student.phone || '';
  const joinDate = student.created_at || student.join_date || null;
  const halaqaName = student.halaqa_name || student.halaqas?.name || '';

  // دالة تنسيق التاريخ الديناميكية حسب إعدادات الأكاديمية
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    if (calendarType === 'hijri') {
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
      onClick={() => onClick(student)}
      className="bg-dark-card border border-appBorder-card hover:border-primary/40 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-primary-glow/10 relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        {/* معلومات الطالب */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-dark-input border border-appBorder-input flex items-center justify-center text-appText-sub font-semibold group-hover:border-primary/50 group-hover:text-primary transition-colors shrink-0 overflow-hidden">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={studentName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-appText-main text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-1 min-w-0 leading-tight">
                {studentName}
              </h3>
              {student.student_code && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md bg-dark-input text-appText-sub border border-appBorder-input font-mono">
                  #{student.student_code}
                </span>
              )}
            </div>

            <div className="flex items-center gap-x-3 gap-y-1.5 text-xs text-appText-sub mt-1.5 flex-wrap">
              {halaqaName && (
                <span className="flex items-center gap-1 text-primary/90 font-medium">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{halaqaName}</span>
                </span>
              )}

              {phone && (
                <span className="flex items-center gap-1 dir-ltr font-mono text-[11px] text-appText-sub/90" dir="ltr">
                  <Phone className="w-3 h-3 text-appText-muted shrink-0" />
                  <span>{phone}</span>
                </span>
              )}

              {joinDate && (
                <span className="flex items-center gap-1 text-[11px] text-appText-sub/80">
                  <Calendar className="w-3 h-3 text-appText-muted shrink-0" />
                  <span>{formatDate(joinDate)}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* شارة الحالة والسهم */}
        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge && (
            <div className="shrink-0">
              {getStatusBadge(student.status)}
            </div>
          )}
          <ArrowIcon className="w-4 h-4 text-appText-muted group-hover:text-primary transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};

export default StudentItemCard;
