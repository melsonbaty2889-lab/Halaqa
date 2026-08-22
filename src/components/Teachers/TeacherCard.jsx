import React from 'react';
import { Award, CheckCircle2, XCircle, Phone, Clock, MessageCircle, Calendar } from 'lucide-react';

export default function TeacherCard({ person, onToggleStatus, onManageAvailability, t = (s) => s }) {
  const isVolunteer = person.employment_type === 'volunteer';
  const rateText = isVolunteer 
    ? (t('تطوع / احتساب') || 'تطوع / احتساب')
    : `${person.hourly_rate || person.monthly_salary || 0} (${person.employment_type})`;

  return (
    <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
      person.is_active ? 'bg-slate-900/80 border-white/10 hover:border-white/20' : 'bg-slate-900/30 border-rose-500/20 opacity-75'
    }`}>
      <div>
        {/* Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div>
            <h3 className="font-bold text-white text-base">{person.name}</h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {person.title || t('معلّم / مقرئ')}
            </span>
          </div>

          <button 
            onClick={() => onToggleStatus(person.id, person.is_active)}
            title={person.is_active ? t('تعطيل الحساب') : t('تفعيل الحساب')}
            className="transition-transform active:scale-95"
          >
            {person.is_active ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
          </button>
        </div>

        {/* Info Details */}
        <div className="space-y-2 text-xs text-slate-300 my-4 border-t border-b border-white/5 py-3">
          {person.phone && (
            <p className="flex items-center gap-2 dir-ltr text-right">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {person.phone}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {person.timezone || 'UTC'}
          </p>
        </div>

        {/* Ijazas */}
        {person.ijazas && person.ijazas.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1 font-bold">
              <Award className="w-3 h-3 text-amber-400" /> {t('الإجازات والخبرات')}:
            </p>
            <div className="flex flex-wrap gap-1">
              {person.ijazas.map((ijaza, idx) => (
                <span key={idx} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-slate-300">
                  {ijaza}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400">{rateText}</span>

        <div className="flex items-center gap-1.5">
          {onManageAvailability && (
            <button 
              onClick={() => onManageAvailability(person.id)}
              className="p-1.5 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 transition-colors"
              title={t('إدارة المواعيد')}
            >
              <Calendar className="w-4 h-4" />
            </button>
          )}

          {person.phone && (
            <a 
              href={`https://wa.me/${person.phone.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
