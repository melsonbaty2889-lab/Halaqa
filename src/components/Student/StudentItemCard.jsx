// src/components/Student/StudentItemCard.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, ChevronLeft, ChevronRight, Phone, Calendar, BookOpen } from 'lucide-react';
import { formatName } from '@/utils/formatters';

const StudentItemCard = ({ student, onClick, getStatusBadge }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // مطابقة الحقول الفعالية من جدول Supabase
  const studentName = formatName(student.name || student.full_name || t('students.unnamed', 'بدون اسم'));
  const phone = student.parent_phone || student.parent_whatsapp || student.phone || '';
  const joinDate = student.created_at || student.join_date || null;
  const halaqaName = student.halaqa_name || student.halaqas?.name || '';

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div 
      onClick={() => onClick(student)}
      className="bg-dark-card border border-appBorder-card rounded-2xl p-3.5 sm:p-4 hover:border-appBorder-hover transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary-glow/10 relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3">
        {/* معلومات الطالب الأساسية */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-dark-input border border-appBorder-input flex items-center justify-center text-appText-sub font-semibold group-hover:border-primary/50 group-hover:text-primary transition-colors shrink-0 overflow-hidden">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={studentName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-appText-main text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                {studentName}
              </h3>
              {student.student_code && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md bg-dark-input text-appText-sub border border-appBorder-input font-mono">
                  #{student.student_code}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-appText-sub mt-1 flex-wrap">
              {halaqaName && (
                <span className="flex items-center gap-1 truncate max-w-[130px] sm:max-w-none">
                  <BookOpen className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">{halaqaName}</span>
                </span>
              )}

              {phone && (
                <span className="flex items-center gap-1 dir-ltr" dir="ltr">
                  <Phone className="w-3 h-3 text-appText-muted shrink-0" />
                  <span className="truncate">{phone}</span>
                </span>
              )}

              {joinDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-appText-muted shrink-0" />
                  <span className="truncate">
                    {new Date(joinDate).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* شارة الحالة والسهم الانتقالي */}
        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge && getStatusBadge(student.status)}
          <ArrowIcon className="w-4 h-4 text-appText-muted group-hover:text-appText-main transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};

export default StudentItemCard;
