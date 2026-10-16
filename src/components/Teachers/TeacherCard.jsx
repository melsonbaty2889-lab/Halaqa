/* src/components/Teachers/TeacherCard.jsx */

import React from 'react';
import { Award, CheckCircle2, XCircle, Phone, Briefcase, Globe, Calendar, MessageCircle, Star, User } from 'lucide-react';
import { UI } from '@/theme/styles';
import { getStaffTitleLabel } from '@/constants/staffTitles';
import { getIjazaLabel } from '@/constants/ijazat';

export default function TeacherCard({ person, onToggleStatus, onManageAvailability, t = (key, fallback) => fallback || key }) {
  const titleLabel = getStaffTitleLabel(person.title, t);
  const cleanPhone = person.phone ? person.phone.replace(/[^0-9+]/g, '') : '';
  const displayPhone = person.phone ? person.phone.replace(/^EG/i, '+20 ') : '';

  const getTeachingModeText = (mode) => {
    if (mode === 'online') return t('teachers.mode_online', 'عن بُعد');
    if (mode === 'onsite' || mode === 'in_person') return t('teachers.mode_onsite', 'حضوري');
    if (mode === 'both') return t('teachers.mode_both', 'هجين');
    return mode || t('teachers.mode_online', 'عن بُعد');
  };

  const renderSalaryBadge = () => {
    if (person.employment_type === 'volunteer') {
      return t('teachers.volunteer', 'متطوع');
    }
    const amount = person.hourly_rate || person.monthly_salary || person.salary || 0;
    const isHourly = person.employment_type === 'hourly' || Boolean(person.hourly_rate);
    const unit = isHourly ? t('teachers.per_hour', 'بالساعة') : t('teachers.per_month', 'شهرياً');
    return `${amount} / ${unit}`;
  };

  const hasExperience = Number(person.experience_years) > 0;

  return (
    <div className={`bg-semantic-surfaceCard border rounded-2xl p-3.5 sm:p-4 transition-all duration-200 group hover:shadow-lg relative overflow-hidden ${
      person.is_active !== false 
        ? 'border-semantic-borderCard hover:border-semantic-actionPrimary/50' 
        : 'border-semantic-danger/30 opacity-75'
    }`}>
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        {/* معلومات المعلم الأساسية */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* الصورة الرمزية الهيكلية الموحدة */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput flex items-center justify-center text-semantic-textSecondary group-hover:border-semantic-actionPrimary/50 group-hover:text-semantic-actionPrimary transition-colors shrink-0 overflow-hidden">
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-semantic-textPrimary text-sm sm:text-base group-hover:text-semantic-actionPrimary transition-colors leading-tight m-0">
                {person.name}
              </h3>
              {person.rating && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <bdi>{Number(person.rating).toFixed(1)}</bdi>
                </span>
              )}
            </div>

            {/* المسمى والخصوصية والمزيد في سطر واحد مدمج */}
            <div className="flex items-center gap-x-3 gap-y-1 text-xs text-semantic-textSecondary mt-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-semantic-actionPrimary/15 text-semantic-actionPrimary border border-semantic-actionPrimary/30">
                {titleLabel}
              </span>

              <span className="flex items-center gap-1 text-semantic-textSecondary">
                <Globe className="w-3 h-3 shrink-0 text-semantic-textMuted" />
                <span>{getTeachingModeText(person.teaching_mode)}</span>
              </span>

              {hasExperience && (
                <span className="flex items-center gap-1 text-semantic-textSecondary">
                  <Briefcase className="w-3 h-3 shrink-0 text-semantic-textMuted" />
                  <span><bdi>{person.experience_years}</bdi> {t('teachers.yearsExpShort', 'سنوات')}</span>
                </span>
              )}

              {person.phone && (
                <span className="flex items-center gap-1 font-mono text-[11px] text-semantic-textSecondary" dir="ltr">
                  <Phone className="w-3 h-3 shrink-0 text-semantic-textMuted" />
                  <span>{displayPhone}</span>
                </span>
              )}
            </div>

            {/* الإجازات المترجمة والمبسطة في أكياس صغيرة */}
            {person.ijazas && person.ijazas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {person.ijazas.map((ijazaId, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-medium bg-semantic-surfaceInput border border-semantic-borderInput px-2 py-0.5 rounded-md text-semantic-textPrimary"
                  >
                    {getIjazaLabel(ijazaId, t)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* الأجر وأزرار الإجراءات السريعة والحالة */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-semantic-textPrimary font-bold bg-semantic-surfaceInput px-2.5 py-1 rounded-lg border border-semantic-borderInput hidden sm:inline-block">
            <bdi>{renderSalaryBadge()}</bdi>
          </span>

          {onManageAvailability && (
            <button 
              type="button"
              onClick={() => onManageAvailability(person.id)}
              className="p-2 rounded-xl bg-semantic-surfaceInput text-semantic-actionPrimary border border-semantic-borderInput hover:border-semantic-actionPrimary/50 transition-colors cursor-pointer flex items-center justify-center"
              title={t('teachers.manageAvailability', 'جدول التوفر')}
            >
              <Calendar className="w-4 h-4" />
            </button>
          )}

          {cleanPhone && (
            <a 
              href={`https://wa.me/${cleanPhone}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-semantic-successBg text-semantic-success hover:bg-semantic-success/20 transition-colors border border-semantic-successBorder/40 flex items-center justify-center cursor-pointer"
              title={t('common.whatsapp', 'واتساب')}
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}

          <button 
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(person.id, person.is_active)}
            className="p-1.5 rounded-xl transition-transform active:scale-95 cursor-pointer text-semantic-textSecondary hover:text-semantic-textPrimary"
            title={person.is_active !== false ? t('common.active', 'نشط') : t('common.inactive', 'غير نشط')}
          >
            {person.is_active !== false ? (
              <CheckCircle2 className="w-5 h-5 text-semantic-success" />
            ) : (
              <XCircle className="w-5 h-5 text-semantic-danger" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
