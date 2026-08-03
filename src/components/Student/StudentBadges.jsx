import React, { useMemo } from 'react';
import { Award, Flame, Star, Crown } from 'lucide-react';

export default function StudentBadges({ student = {}, weeklyData = [], isRtl = true }) {
  // حساب الأوسمة بأداء عالي دون إعادة رندر زائد
  const badges = useMemo(() => {
    const streak = student?.current_streak || 0;
    const quarterIndex = student?.current_quarter_index || 0;
    const activeWeeks = (weeklyData || []).length;

    return [
      {
        id: 'streak',
        titleAr: 'شعلة الحفظ',
        titleEn: 'Hifz Spark',
        descAr: 'استمرار لـ 3 أيام',
        descEn: '3 Days Streak',
        icon: <Flame className="w-6 h-6 text-red-400" />,
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
        border: '#EF4444',
        badgeColor: 'bg-red-500',
        unlocked: streak >= 3,
        count: Math.floor(streak / 3)
      },
      {
        id: 'juz_master',
        titleAr: 'مُتقن الأجزاء',
        titleEn: 'Juz Mastery',
        descAr: 'إتمام جزء كامل',
        descEn: 'Completed 1 Juz',
        icon: <Star className="w-6 h-6 text-amber-400 fill-amber-400/20" />,
        bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))',
        border: '#3B82F6',
        badgeColor: 'bg-blue-500',
        unlocked: quarterIndex >= 8,
        count: Math.floor(quarterIndex / 8)
      },
      {
        id: 'weekly_achiever',
        titleAr: 'المثابر الأسبوعي',
        titleEn: 'Weekly Achiever',
        descAr: 'التزام أسبوعي منتظم',
        descEn: 'Consistent Active Week',
        icon: <Crown className="w-6 h-6 text-purple-400" />,
        bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
        border: '#8B5CF6',
        badgeColor: 'bg-purple-500',
        unlocked: activeWeeks >= 4,
        count: 1
      }
    ];
  }, [student?.current_streak, student?.current_quarter_index, weeklyData]);

  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);

  return (
    <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-700 text-start shadow-sm">
      
      {/* الهيدر العلوي */}
      <div className="text-xs color-[#F59E0B] font-bold mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-amber-400">
          <Award className="w-4 h-4" /> 
          <span>{isRtl ? 'شارات التميز والإتقان' : 'Mastery & Achievement Badges'}</span>
        </span>
        <span className="text-[11px] text-slate-400 font-normal">
          {unlockedCount} / {badges.length}
        </span>
      </div>

      {/* شبكة الأوسمة متجاوبة */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            style={{
              background: badge.unlocked ? badge.bg : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${badge.unlocked ? badge.border : '#334155'}`,
            }}
            className={`relative p-2.5 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300 ${
              badge.unlocked ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale'
            }`}
          >
            {/* عداد التكرار */}
            {badge.unlocked && badge.count > 1 && (
              <span 
                style={{ backgroundColor: badge.border }}
                className={`absolute -top-1.5 ${isRtl ? '-left-1.5' : '-right-1.5'} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm`}
              >
                x{badge.count}
              </span>
            )}

            <div className="mb-1">
              {badge.icon}
            </div>
            
            <div className={`text-[11px] font-bold mb-0.5 ${badge.unlocked ? 'text-slate-100' : 'text-slate-400'}`}>
              {isRtl ? badge.titleAr : badge.titleEn}
            </div>

            <div className={`text-[9px] ${badge.unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
              {isRtl ? badge.descAr : badge.descEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
