/* src/components/Teachers/TeacherCard.jsx */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, ChevronLeft, ChevronRight, Phone, Award } from 'lucide-react';
import { getStaffTitleLabel } from '@/constants/staffTitles';

export default function TeacherCard({ person, onClick, onToggleStatus }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;

  const titleLabel = getStaffTitleLabel(person?.title, t);
  const displayPhone = person?.phone ? person.phone.replace(/^EG/i, '+20 ') : '';

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      onClick={() => onClick && onClick(person)}
      className="bg-semantic-surfaceCard border border-semantic-borderCard hover:border-semantic-actionPrimary/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        {/* معلومات المعلم الأساسية */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* الحاوية الرمزية المطابقة تماماً للطالب */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput flex items-center justify-center text-semantic-textSecondary group-hover:border-semantic-actionPrimary/50 group-hover:text-semantic-actionPrimary transition-colors shrink-0 overflow-hidden">
            {person?.avatar_url ? (
              <img src={person.avatar_url} alt={person.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-semantic-textPrimary text-sm sm:text-base group-hover:text-semantic-actionPrimary transition-colors leading-tight m-0 truncate">
                {person?.name}
              </h3>
              {titleLabel && (
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-md bg-semantic-actionPrimary/15 text-semantic-actionPrimary border border-semantic-actionPrimary/30 font-bold">
                  {titleLabel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-x-3 gap-y-1 text-xs text-semantic-textSecondary mt-1.5 flex-wrap">
              {person?.specialization && (
                <span className="flex items-center gap-1 text-semantic-textSecondary font-medium">
                  <Award className="w-3.5 h-3.5 shrink-0 text-semantic-actionPrimary" />
                  <span className="truncate">{person.specialization}</span>
                </span>
              )}

              {displayPhone && (
                <span className="flex items-center gap-1 font-mono text-[11px] text-semantic-textSecondary" dir="ltr">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>{displayPhone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* شارة الحالة وسهم الانتقال المطابق للطالب */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            person?.is_active !== false 
              ? 'bg-semantic-successBg text-semantic-success border-semantic-successBorder/30' 
              : 'bg-semantic-dangerBg text-semantic-danger border-semantic-danger/30'
          }`}>
            {person?.is_active !== false ? t('common.active', 'نشط') : t('common.inactive', 'غير نشط')}
          </span>

          <ArrowIcon className="w-4 h-4 text-semantic-textSecondary group-hover:text-semantic-actionPrimary transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}
