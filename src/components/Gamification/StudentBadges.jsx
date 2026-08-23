import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Flame, Star, Crown, Lock } from 'lucide-react';

export default function StudentBadges({ badges = [] }) {
  const { t } = useTranslation();

  const iconMap = {
    hifzSpark: Flame,
    juzMastery: Star,
    weeklyActive: Crown
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">
            {t('gamification.badges.title', 'شارات التميز والإتقان')}
          </h3>
        </div>
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full dir-ltr">
          {unlockedCount} / {badges.length}
        </span>
      </div>

      {badges.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4">
          {t('common.noResults', 'لا توجد بيانات')}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {badges.map((badge) => {
            const Icon = iconMap[badge.key] || Award;
            return (
              <div
                key={badge.id}
                className={`relative flex flex-col items-center justify-between p-3 rounded-xl border text-center min-h-[140px] transition-all ${
                  badge.unlocked
                    ? 'bg-slate-800/80 border-amber-500/40 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-40'
                }`}
              >
                {badge.unlocked && badge.tier && (
                  <span className="absolute -top-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t(`gamification.badges.${badge.tier.toLowerCase()}`, badge.tier)}
                  </span>
                )}

                {!badge.unlocked && (
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute top-2.5 right-2.5" />
                )}

                <div className="mt-2 p-2 rounded-full bg-slate-900 border border-slate-700/50">
                  <Icon className={`w-5 h-5 ${badge.unlocked ? 'text-amber-400' : 'text-slate-500'}`} />
                </div>

                <div className="w-full my-1">
                  <h4 className="text-xs font-bold text-white leading-tight break-words">
                    {t(`gamification.badges.${badge.key}`, badge.title)}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight break-words">
                    {t(`gamification.badges.${badge.key}Desc`, badge.desc)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
