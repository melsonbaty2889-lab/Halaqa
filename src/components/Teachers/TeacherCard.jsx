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
    <div className={`${UI.card} p-3.5 flex flex-col justify-between hover:border-semantic-actionPrimary/40 ${
      person.is_active !== false 
        ? '' 
        : 'opacity-75 border-semantic-danger/30'
    }`}>
      <div className="space-y-2.5">
        {/* الهيدر المدمج: الصورة الرمزية + الاسم + المسمى الوظيفي + الحالة */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput flex items-center justify-center shrink-0 text-semantic-textSecondary">
              <User className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-semantic-textPrimary text-sm m-0 leading-tight truncate">
                  {person.name}
                </h3>
                {person.rating && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-md border border-amber-500/20 shrink-0">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <bdi>{Number(person.rating).toFixed(1)}</bdi>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-semantic-actionPrimary/15 text-semantic-actionPrimary border border-semantic-actionPrimary/30 truncate">
                  {titleLabel}
                </span>
                {person.specialization && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-semantic-surfaceInput text-semantic-textSecondary border border-semantic-borderInput truncate">
                    {person.specialization}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(person.id, person.is_active)}
            className="p-1 rounded-lg transition-transform active:scale-95 cursor-pointer text-semantic-textSecondary hover:text-semantic-textPrimary shrink-0"
            title={person.is_active !== false ? t('common.active', 'نشط') : t('common.inactive', 'غير نشط')}
          >
            {person.is_active !== false ? (
              <CheckCircle2 className="w-4 h-4 text-semantic-success" />
            ) : (
              <XCircle className="w-4 h-4 text-semantic-danger" />
            )}
          </button>
        </div>

        {/* معلومات سريعة ومختصرة في سطر واحد */}
        <div className="flex items-center justify-between text-[11px] text-semantic-textSecondary bg-semantic-surfaceInput/50 px-2.5 py-1.5 rounded-lg border border-semantic-borderInput/50 gap-2">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-semantic-textMuted shrink-0" /> 
            <span>{getTeachingModeText(person.teaching_mode)}</span>
          </div>

          {hasExperience && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-semantic-textMuted shrink-0" /> 
              <span><bdi>{person.experience_years}</bdi> {t('teachers.yearsExpShort', 'سنوات')}</span>
            </div>
          )}

          {person.phone && (
            <div className="flex items-center gap-1 min-w-0" dir="ltr">
              <Phone className="w-3 h-3 text-semantic-textMuted shrink-0" /> 
              <span className="font-medium truncate">{displayPhone}</span>
            </div>
          )}
        </div>

        {/* الإجازات المترجمة والمبسطة */}
        {person.ijazas && person.ijazas.length > 0 && (
          <div className="space-y-1 pt-0.5">
            <p className="text-[10px] text-semantic-textMuted m-0 flex items-center gap-1 font-bold">
              <Award className="w-3 h-3 text-semantic-actionPrimary" /> 
              <span>{t('teachers.ijazatTitle', 'الإجازات')}:</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {person.ijazas.map((ijazaId, idx) => (
                <span 
                  key={idx} 
                  className="text-[10px] font-medium bg-semantic-surfaceInput border border-semantic-borderInput px-2 py-0.5 rounded-md text-semantic-textPrimary"
                >
                  {getIjazaLabel(ijazaId, t)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* الفوتر */}
      <div className="pt-2 mt-2 border-t border-semantic-borderCard flex items-center justify-between gap-2">
        <span className="text-[10px] text-semantic-textPrimary font-bold bg-semantic-surfaceInput px-2.5 py-1 rounded-md border border-semantic-borderInput">
          <bdi>{renderSalaryBadge()}</bdi>
        </span>

        <div className="flex items-center gap-1.5">
          {onManageAvailability && (
            <button 
              type="button"
              onClick={() => onManageAvailability(person.id)}
              className="p-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-actionPrimary border border-semantic-borderInput hover:border-semantic-actionPrimary/50 transition-colors cursor-pointer flex items-center justify-center"
              title={t('teachers.manageAvailability', 'جدول التوفر')}
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          )}

          {cleanPhone && (
            <a 
              href={`https://wa.me/${cleanPhone}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-semantic-successBg text-semantic-success hover:bg-semantic-success/20 transition-colors border border-semantic-successBorder/40 flex items-center justify-center cursor-pointer"
              title={t('common.whatsapp', 'واتساب')}
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
