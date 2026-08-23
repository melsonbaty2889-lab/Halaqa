import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Flame, Award } from 'lucide-react';
import StudentBadges from './StudentBadges';
import WeeklyQuestCard from './WeeklyQuestCard';
import AchievementChart from './AchievementChart';

export default function GamificationStreaks({ badges = [], quest = null, weeklyData = [] }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('leaderboard');

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
          <WeeklyQuestCard quest={quest} />
          <AchievementChart weeklyData={weeklyData} />
        </div>
      )}

      {activeTab === 'badges' && (
        <StudentBadges badges={badges} />
      )}
    </div>
  );
}
