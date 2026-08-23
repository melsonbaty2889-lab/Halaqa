import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Flame, Award, Target, Zap } from 'lucide-react';
import StudentBadges from './StudentBadges';
import AchievementChart from './AchievementChart';

export default function GamificationStreaks({ badges = [], quest = null, weeklyData = [] }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('leaderboard');

  // حساب بيانات التحدي الأسبوعي بشكل مباشر
  const currentQuest = quest || {
    description: t('gamification.defaultQuest', 'التزام الحضور والتسميع الأسبوعي'),
    current: 0,
    target: 7,
    rewardPoints: 50
  };
  const percentage = Math.min(Math.round((currentQuest.current / currentQuest.target) * 100), 100);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">
              {t('gamification.title')}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('gamification.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('gamification.tabs.leaderboard')}</span>
          </button>

          <button
            onClick={() => setActiveTab('streaks')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'streaks'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t('gamification.tabs.streaks')}</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'badges'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{t('gamification.tabs.badges')}</span>
          </button>
        </div>
      </div>

      {activeTab === 'leaderboard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 shadow-lg">
          {t('gamification.leaderboardUpdating')}
        </div>
      )}

      {activeTab === 'streaks' && (
        <div className="space-y-4">
          {/* التحدي الأسبوعي - مدمج مباشرة */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {t('gamification.tabs.streaks')}
                  </span>
                  <p className="text-xs font-semibold text-slate-300">
                    {currentQuest.description}
                  </p>
                </div>
              </div>
              {currentQuest.rewardPoints > 0 && (
                <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl text-amber-400 text-xs font-extrabold dir-ltr">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  <span>+{currentQuest.rewardPoints}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Progress</span>
                <span className="text-amber-400 dir-ltr font-mono">
                  {currentQuest.current} / {currentQuest.target} ({percentage}%)
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

          <AchievementChart weeklyData={weeklyData} />
        </div>
      )}

      {activeTab === 'badges' && (
        <StudentBadges badges={badges} />
      )}
    </div>
  );
}
