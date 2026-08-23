import React from 'react';
import { Target, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WeeklyQuestCard({ quest = {}, isRtl = true }) {
  const { t } = useTranslation();

  const title = isRtl ? (quest.titleAr || 'تحدي الحفظ الأسبوعي') : (quest.titleEn || 'Weekly Hifz Quest');
  const desc = isRtl ? (quest.descAr || 'حفظ 10 صفحات هذا الأسبوع') : (quest.descEn || 'Memorize 10 pages this week');
  const current = quest.current || 6;
  const target = quest.target || 10;
  const reward = quest.rewardPoints || 100;

  const progressPercent = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 mb-4 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30 animate-pulse">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 block">
              {t('gamification.questBadge', 'تحدي الأسبوع')}
            </span>
            <h4 className="text-sm font-bold text-slate-100">{title}</h4>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full text-amber-300 text-xs font-black">
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          <span>+{reward} {t('gamification.pts', 'نقطة')}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3">{desc}</p>

      {/* شريط التقدم */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">{t('gamification.progress', 'التقدم')}</span>
          <span className="text-amber-400">{current} / {target} ({progressPercent}%)</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
