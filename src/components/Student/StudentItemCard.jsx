// src/components/Student/StudentItemCard.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, ChevronLeft, ChevronRight, Phone, Calendar } from 'lucide-react';
import { formatName } from '@/utils/formatters';

const StudentItemCard = ({ student, onClick, getStatusBadge }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const studentName = formatName(student.name || student.full_name || '');

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div 
      onClick={() => onClick(student)}
      className="bg-dark-card border border-appBorder-card rounded-2xl p-4 hover:border-appBorder-hover transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary-glow/10 relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3">
        {/* معلومات الطالب الأساسية */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-dark-input border border-appBorder-input flex items-center justify-center text-appText-sub font-semibold group-hover:border-primary/50 group-hover:text-primary transition-colors shrink-0 overflow-hidden">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={studentName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-appText-main text-sm group-hover:text-primary transition-colors truncate">
              {studentName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-appText-sub mt-1 flex-wrap">
              {student.phone && (
                <span className="flex items-center gap-1 dir-ltr" dir="ltr">
                  <Phone className="w-3 h-3 text-appText-muted shrink-0" />
                  <span className="truncate">{student.phone}</span>
                </span>
              )}
              {student.join_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-appText-muted shrink-0" />
                  <span className="truncate">
                    {new Date(student.join_date).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
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
