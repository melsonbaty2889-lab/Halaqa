import React from 'react';
import { User, Clock, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HalaqaCard({ 
  halaqa, 
  viewMode, 
  getLocalizedText, 
  onNavigateToAttendance, 
  onToggleArchiveHalaqa 
}) {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/80 flex flex-col justify-between gap-4">
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className="text-sm font-extrabold text-white m-0">
            {getLocalizedText(halaqa.name)}
          </h4>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-bold">
            {t('activeSession', 'جلسة نشطة')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <User size={14} className="text-amber-500" />
          <span className="truncate">
            {getLocalizedText(halaqa.teacher_name || halaqa.teacher, t('unassigned', 'بانتظار تعيين معتمد'))}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-slate-400">
          <Clock size={13} className="text-slate-500" />
          <span>{halaqa.start_time || '16:00'} - {halaqa.end_time || '17:15'}</span>
          <span className="text-[11px] bg-slate-800/90 px-1.5 py-0.5 rounded text-slate-400">
            {halaqa.timezone || 'UTC'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 pt-3">
        <button 
          onClick={() => onNavigateToAttendance?.(halaqa.id)} 
          className="flex-1 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 color-slate-950 text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 border-none"
        >
          <Video size={14} />
          {t('goToAttendance', 'الانضمام للجلسة المباشرة')}
        </button>

        <button 
          onClick={() => onToggleArchiveHalaqa?.(halaqa.id, halaqa.is_archived)} 
          className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-transparent text-slate-400 text-xs font-bold cursor-pointer hover:bg-white/5 transition-colors"
        >
          {viewMode === 'active' ? t('archive', 'أرشفة') : t('activate', 'تنشيط')}
        </button>
      </div>
    </div>
  );
}
