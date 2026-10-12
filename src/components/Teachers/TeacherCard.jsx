/* src/components/Teachers/TeacherCard.jsx */

import React from 'react';
import { Award, CheckCircle2, XCircle, Phone, Clock, Calendar, MessageCircle, Star, Briefcase, Globe } from 'lucide-react';
import { UI } from '@/theme/styles';

export default function TeacherCard({ person, onToggleStatus, onManageAvailability, t = (s) => s }) {
  const isVolunteer = person.employment_type === 'volunteer';
  const rateText = isVolunteer 
    ? t('teachers.volunteer', 'تطوع / احتساب')
    : `${person.hourly_rate || person.monthly_salary || 0} (${person.employment_type})`;

  return (
    <div className={`${UI.card} flex flex-col justify-between transition-all ${
      person.is_active 
        ? 'border-semantic-borderCard hover:border-semantic-borderHover' 
        : 'border-semantic-danger/30 opacity-75'
    }`}>
      <div>
        {/* Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-semantic-textPrimary text-base">{person.name}</h3>
              {person.rating && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                  <Star className="w-3 h-3 fill-amber-400" /> <bdi>{Number(person.rating).toFixed(1)}</bdi>
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-semantic-actionPrimary/10 text-semantic-actionPrimary border border-semantic-actionPrimary/20">
                {t(`teachers.titles.${person.title}`, person.title || t('teachers.defaultTitle', 'معلّم / مقرئ'))}
              </span>
              {person.specialization && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-semantic-surfaceInput text-semantic-textSecondary border border-semantic-borderInput">
                  {person.specialization}
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={() => onToggleStatus(person.id, person.is_active)}
            title={person.is_active ? t('common.deactivate', 'تعطيل الحساب') : t('common.activate', 'تفعيل الحساب')}
            className="transition-transform active:scale-95 cursor-pointer"
          >
            {person.is_active ? (
              <CheckCircle2 className="w-5 h-5 text-semantic-success" />
            ) : (
              <XCircle className="w-5 h-5 text-semantic-danger" />
            )}
          </button>
        </div>

        {/* Info Details */}
        <div className="grid grid-cols-2 gap-2 text-xs text-semantic-textSecondary my-3 border-t border-b border-semantic-borderCard py-3">
          <p className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-semantic-textMuted" /> 
            <span><bdi>{person.experience_years || 0}</bdi> {t('teachers.yearsExp', 'سنوات خبرة')}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-semantic-textMuted" /> 
            <span>{t(`teachers.modes.${person.teaching_mode}`, person.teaching_mode || 'online')}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-semantic-textMuted" /> 
            <span>{person.timezone || 'UTC'}</span>
          </p>
          {person.phone && (
            <p className="flex items-center gap-1.5 dir-ltr text-right">
              <Phone className="w-3.5 h-3.5 text-semantic-textMuted" /> 
              <bdi>{person.phone}</bdi>
            </p>
          )}
        </div>

        {/* Ijazas */}
        {person.ijazas && person.ijazas.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-semantic-textSecondary mb-1.5 flex items-center gap-1 font-bold">
              <Award className="w-3 h-3 text-semantic-actionPrimary" /> {t('teachers.ijazatTitle', 'الإجازات القرآنية')}:
            </p>
            <div className="flex flex-wrap gap-1">
              {person.ijazas.map((ijaza, idx) => (
                <span key={idx} className="text-[10px] bg-semantic-surfaceInput border border-semantic-borderInput px-2 py-0.5 rounded-md text-semantic-textPrimary">
                  {t(`teachers.ijazatList.${ijaza}`, ijaza)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="pt-3 border-t border-semantic-borderCard flex items-center justify-between gap-2">
        <span className="text-[10px] text-semantic-textMuted font-medium"><bdi>{rateText}</bdi></span>

        <div className="flex items-center gap-1.5">
          {onManageAvailability && (
            <button 
              onClick={() => onManageAvailability(person.id)}
              className="p-1.5 rounded-xl bg-semantic-surfaceInput text-semantic-actionPrimary border border-semantic-borderInput hover:border-semantic-actionPrimary/50 transition-colors cursor-pointer"
              title={t('teachers.manageAvailability', 'إدارة المواعيد')}
            >
              <Calendar className="w-4 h-4" />
            </button>
          )}

          {person.phone && (
            <a 
              href={`https://wa.me/${person.phone.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-semantic-success hover:text-semantic-success/80 font-medium transition-colors bg-semantic-successBg px-2.5 py-1.5 rounded-xl border border-semantic-successBorder/50"
              title={t('common.whatsapp', 'مراسلة عبر واتساب')}
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
