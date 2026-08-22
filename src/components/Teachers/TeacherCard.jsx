import React from 'react';
import { Award, CheckCircle2, XCircle, Phone, Clock, MessageCircle, Calendar } from 'lucide-react';

export default function TeacherCard({ person, onToggleStatus, onManageAvailability, t = (s) => s }) {
  const isVolunteer = person.employment_type === 'volunteer';
  const rateText = isVolunteer 
    ? (t('تطوع / احتساب') || 'تطوع / احتساب')
    : `${person.hourly_rate || person.monthly_salary || 0} (${person.employment_type})`;

  return (
    <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
      person.is_active 
        ? 'bg-[#0F172A]/85 border-[#1B2738] hover:border-[#2E3E56]' 
        : 'bg-[#0F172A]/30 border-rose-500/20 opacity-75'
    }`}>
      <div>
        {/* Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div>
            <h3 className="font-bold text-white text-base">{person.name}</h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E07A00]/10 text-[#E07A00] border border-[#E07A00]/20">
              {person.title || t('معلّم / مقرئ')}
            </span>
          </div>

          <button 
            onClick={() => onToggleStatus(person.id, person.is_active)}
            title={person.is_active ? t('تعطيل الحساب') : t('تفعيل الحساب')}
            className="transition-transform active:scale-95"
          >
            {person.is_active ? (
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
          </button>
        </div>

        {/* Info Details */}
        <div className="space-y-2 text-xs text-[#94A3B8] my-4 border-t border-b border-[#1B2738] py-3">
          {person.phone && (
            <p className="flex items-center gap-2 dir-ltr text-right">
              <Phone className="w-3.5 h-3.5 text-[#475569]" /> {person.phone}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#475569]" /> {person.timezone || 'UTC'}
          </p>
        </div>

        {/* Ijazas */}
        {person.ijazas && person.ijazas.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-[#94A3B8] mb-1.5 flex items-center gap-1 font-bold">
              <Award className="w-3 h-3 text-[#E07A00]" /> {t('الإجازات والخبرات')}:
            </p>
            <div className="flex flex-wrap gap-1">
              {person.ijazas.map((ijaza, idx) => (
                <span key={idx} className="text-[10px] bg-[#0A101D] border border-[#1B2738] px-2 py-0.5 rounded-md text-[#CBD5E1]">
                  {ijaza}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="pt-3 border-t border-[#1B2738] flex items-center justify-between gap-2">
        <span className="text-[10px] text-[#475569] font-medium">{rateText}</span>

        <div className="flex items-center gap-1.5">
          {onManageAvailability && (
            <button 
              onClick={() => onManageAvailability(person.id)}
              className="p-1.5 rounded-xl bg-[#0A101D] text-[#E07A00] border border-[#1B2738] hover:border-[#E07A00]/50 transition-colors"
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
              className="flex items-center gap-1.5 text-xs text-[#10B981] hover:text-emerald-300 font-medium transition-colors bg-[#09332C] px-2.5 py-1.5 rounded-xl border border-[#0D5C4D]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
