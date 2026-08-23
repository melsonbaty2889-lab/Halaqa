/* src/components/Gamification/GamificationStreaks.jsx */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Flame, Award } from 'lucide-react';

// استدعاء المكونات الفرعية الجاهزة
import StudentBadges from './StudentBadges';
import AchievementChart from './AchievementChart';
import WeeklyQuestCard from './WeeklyQuestCard';

export default function GamificationStreaks({ 
  student = { current_streak: 5, current_quarter_index: 12 }, 
  weeklyData = [], 
  leaderboard = [],
  badges = []
}) {
  const { t, i18n } = useTranslation();
  // جعل التبويب الافتراضي هو الأوسمة لعرض الشارات فوراً
  const [activeTab, setActiveTab] = useState('badges');
  
  const currentLang = i18n?.language?.split('-')[0]?.toLowerCase() || 'ar';
  const isRtl = i18n?.dir() === 'rtl';

  return (
    <div className="space-y-4 text-slate-100 select-none">
      {/* 1. الكارت الرئيسي للتنقل */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {t('gamification.title', 'لوحة الإنجازات والتحديات')}
            </h2>
            <p className="text-xs text-slate-400">
              {t('gamification.subtitle', 'تحفيز الطلاب وتتبع الأوسمة والسلسلة اليومية')}
            </p>
          </div>
        </div>

        {/* أزرار التبويب */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('gamification.tabs.leaderboard', 'المتصدرين')}</span>
          </button>

          <button
            onClick={() => setActiveTab('streaks')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'streaks'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t('gamification.tabs.streaks', 'السلسلة')}</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'badges'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{t('gamification.tabs.badges', 'الأوسمة')}</span>
          </button>
        </div>
      </div>

      {/* 2. عرض المكون الفرعي حسب التبويب المختار */}

      {/* تبويب الأوسمة */}
      {activeTab === 'badges' && (
        <StudentBadges student={student} weeklyData={weeklyData} isRtl={isRtl} />
      )}

      {/* تبويب السلسلة والمنحنى البياني والتحدي الأسبوعي */}
      {activeTab === 'streaks' && (
        <div className="space-y-4">
          <WeeklyQuestCard isRtl={isRtl} />
          <AchievementChart data={weeklyData} isRtl={isRtl} />
        </div>
      )}

      {/* تبويب المتصدرين */}
      {activeTab === 'leaderboard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
          <p className="text-xs text-slate-400">
            {t('gamification.noLeaderboard', 'لوحة المتصدرين قيد التحديث الأسبوعي...')}
          </p>
        </div>
      )}
    </div>
  );
}
