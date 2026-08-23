import React from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Zap } from 'lucide-react';

export default function WeeklyQuestCard({ quest = null }) {
  const { t } = useTranslation();

  if (!quest) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center text-xs text-slate-500">
        {t('common.noResults', 'لا توجد بيانات')}
      </div>
    );
  }

  const { current = 0, target = 1, rewardPoints = 0 } = quest;
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              {t('gamification.quest.badge', 'تحدي الأسبوع')}
            </span>
            <p className="text-xs font-semibold text-slate-300">
              {quest.description || t('gamification.quest.desc', 'متابعة ورد الحفظ الأسبوعي')}
            </p>
          </div>
        </div>
        {rewardPoints > 0 && (
          <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl text-amber-400 text-xs font-extrabold dir-ltr">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>+{rewardPoints}</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-400">{t('gamification.quest.progress', 'التقدم')}</span>
          <span className="text-amber-400 dir-ltr font-mono">
            {current} / {target} ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
