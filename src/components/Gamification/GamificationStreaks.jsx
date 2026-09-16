import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Flame, Award, Target, Zap, Crown, Medal, Star } from 'lucide-react';
import StudentBadges from './StudentBadges';
import AchievementChart from './AchievementChart';
import { C } from '@/theme/colors';

export default function GamificationStreaks({ 
  badges = [], 
  quest = null, 
  weeklyData = [], 
  leaderboard = [] // استقبال قائمة المتصدرين لتأكيد إغلاق الصفحة
}) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const isRTL = i18n.dir() === 'rtl';

  const currentQuest = quest || {
    description: t('gamification.defaultQuest', 'التزام الحضور والتسميع الأسبوعي'),
    current: 0,
    target: 7,
    rewardPoints: 50
  };
  const percentage = Math.min(Math.round((currentQuest.current / currentQuest.target) * 100), 100);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      
      {/* الهيدر والتبويبات */}
      <div 
        className="border rounded-2xl p-4 shadow-lg space-y-4"
        style={{ backgroundColor: C.dark?.card, borderColor: C.dark?.cardBorder }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2.5 border rounded-xl"
            style={{ backgroundColor: C.dark?.surface, borderColor: C.amber?.dark, color: C.amber?.DEFAULT }}
          >
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: C.text?.title }}>
              {t('gamification.title', 'التحفيز والأوسمة')}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: C.text?.muted }}>
              {t('gamification.subtitle', 'متابعة نقاط الإنجاز وشارات التميز')}
            </p>
          </div>
        </div>

        {/* أزرار التبويبات */}
        <div 
          className="grid grid-cols-3 gap-1 p-1 rounded-xl border"
          style={{ backgroundColor: C.dark?.surface, borderColor: C.dark?.cardBorder }}
        >
          <button
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'leaderboard' ? C.dark?.card : 'transparent',
              color: activeTab === 'leaderboard' ? C.amber?.DEFAULT : C.text?.muted,
              borderColor: activeTab === 'leaderboard' ? C.amber?.dark : 'transparent',
              borderWidth: '1px'
            }}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('gamification.tabs.leaderboard', 'لوحة المتصدرين')}</span>
          </button>

          <button
            onClick={() => setActiveTab('streaks')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'streaks' ? C.dark?.card : 'transparent',
              color: activeTab === 'streaks' ? C.amber?.DEFAULT : C.text?.muted,
              borderColor: activeTab === 'streaks' ? C.amber?.dark : 'transparent',
              borderWidth: '1px'
            }}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t('gamification.tabs.streaks', 'سلاسل المواظبة')}</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'badges' ? C.dark?.card : 'transparent',
              color: activeTab === 'badges' ? C.amber?.DEFAULT : C.text?.muted,
              borderColor: activeTab === 'badges' ? C.amber?.dark : 'transparent',
              borderWidth: '1px'
            }}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{t('gamification.tabs.badges', 'الأوسمة والبادجات')}</span>
          </button>
        </div>
      </div>

      {/* 1. قائمة المتصدرين (التي كانت معلقة) */}
      {activeTab === 'leaderboard' && (
        <div 
          className="border rounded-2xl p-4 shadow-lg space-y-3"
          style={{ backgroundColor: C.dark?.card, borderColor: C.dark?.cardBorder }}
        >
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-xs" style={{ color: C.text?.muted }}>
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{t('gamification.noLeaderboardData', 'جاري تحديث نقاط لوحة المتصدرين...')}</p>
            </div>
          ) : (
            leaderboard.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="flex items-center justify-between p-3 rounded-xl border"
                style={{ backgroundColor: C.dark?.surface, borderColor: C.dark?.cardBorder }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-xs" style={{ color: C.amber?.DEFAULT }}>
                    #{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold" style={{ backgroundColor: C.dark?.card, borderColor: C.dark?.cardBorder, color: C.text?.title }}>
                    {item.full_name?.[0] || 'S'}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: C.text?.title }}>
                    {item.full_name || t('gamification.student', 'طالب')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold" style={{ color: C.amber?.DEFAULT }}>
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{item.points || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. التحدي والمخطط البياني */}
      {activeTab === 'streaks' && (
        <div className="space-y-4">
          <div 
            className="border rounded-2xl p-4 shadow-lg space-y-3"
            style={{ backgroundColor: C.dark?.card, borderColor: C.dark?.cardBorder }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="p-2 border rounded-xl"
                  style={{ backgroundColor: C.dark?.surface, borderColor: C.amber?.dark, color: C.amber?.DEFAULT }}
                >
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: C.amber?.DEFAULT }}>
                    {t('gamification.weeklyQuest', 'التحدي الأسبوعي')}
                  </span>
                  <p className="text-xs font-semibold" style={{ color: C.text?.title }}>
                    {currentQuest.description}
                  </p>
                </div>
              </div>
              {currentQuest.rewardPoints > 0 && (
                <div 
                  className="flex items-center gap-1 border px-2.5 py-1 rounded-xl text-xs font-extrabold"
                  style={{ backgroundColor: C.dark?.surface, borderColor: C.amber?.dark, color: C.amber?.DEFAULT }}
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  <span>+{currentQuest.rewardPoints}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span style={{ color: C.text?.muted }}>{t('gamification.progress', 'التقدم')}</span>
                <span className="font-mono" style={{ color: C.amber?.DEFAULT }}>
                  {currentQuest.current} / {currentQuest.target} ({percentage}%)
                </span>
              </div>
              <div 
                className="w-full rounded-full h-2.5 border overflow-hidden"
                style={{ backgroundColor: C.dark?.surface, borderColor: C.dark?.cardBorder }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: C.amber?.DEFAULT || '#f59e0b'
                  }}
                />
              </div>
            </div>
          </div>

          <AchievementChart weeklyData={weeklyData} />
        </div>
      )}

      {/* 3. الشارات والأوسمة */}
      {activeTab === 'badges' && (
        <StudentBadges badges={badges} />
      )}
    </div>
  );
}
