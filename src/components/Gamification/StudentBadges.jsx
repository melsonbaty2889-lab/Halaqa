import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Flame, Star, Crown, Lock, Sparkles, Target, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { C } from '@/theme/colors';

const BADGE_CONFIGS = [
  { id: 'hifzSpark', key: 'hifzSpark', icon: Flame },
  { id: 'juzMastery', key: 'juzMastery', icon: Star },
  { id: 'weeklyActive', key: 'weeklyActive', icon: Crown },
  { id: 'qaidaMaster', key: 'qaidaMaster', icon: Award }
];

export default function StudentBadges({ badges = [], streakDays = 0 }) {
  const { t, i18n } = useTranslation();
  const [selectedBadge, setSelectedBadge] = useState(null);
  const isRTL = i18n.dir() === 'rtl';

  const unlockedKeys = new Set(badges.map(b => b.key || b.id));

  const handleBadgeClick = (badge, isUnlocked) => {
    setSelectedBadge({ ...badge, isUnlocked });
    if (isUnlocked) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: [C.amber?.DEFAULT || '#f59e0b', '#fbbf24', '#10b981']
      });
    }
  };

  const questTarget = 7;
  const questProgress = Math.min(100, Math.round((streakDays / questTarget) * 100));

  return (
    <div className="space-y-4" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      
      {/* 1. التحدي الأسبوعي */}
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
                {t('gamification.defaultQuest', 'الالتزام بالتحفيظ طوال الأسبوع')}
              </p>
            </div>
          </div>
          <div 
            className="flex items-center gap-1 border px-2.5 py-1 rounded-xl text-xs font-extrabold"
            style={{ backgroundColor: C.dark?.surface, borderColor: C.amber?.dark, color: C.amber?.DEFAULT }}
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>+50 {t('gamification.pts', 'نقطة')}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span style={{ color: C.text?.muted }}>{t('gamification.progress', 'التقدم')}</span>
            <span className="font-mono" style={{ color: C.amber?.DEFAULT }}>
              {streakDays} / {questTarget} ({questProgress}%)
            </span>
          </div>
          <div 
            className="w-full rounded-full h-2.5 border overflow-hidden"
            style={{ backgroundColor: C.dark?.surface, borderColor: C.dark?.cardBorder }}
          >
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ width: `${questProgress}%`, backgroundColor: C.amber?.DEFAULT || '#f59e0b' }} 
            />
          </div>
        </div>
      </div>

      {/* 2. شبكة الشارات والأوسمة */}
      <div 
        className="border rounded-2xl p-5 shadow-lg space-y-4"
        style={{ backgroundColor: C.dark?.card, borderColor: C.dark?.cardBorder }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2.5 border rounded-xl"
              style={{ backgroundColor: C.dark?.surface, borderColor: C.amber?.dark, color: C.amber?.DEFAULT }}
            >
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold" style={{ color: C.text?.title }}>
              {t('gamification.badgesTitle', 'شارات التميز والإتقان')}
            </h3>
          </div>
          <span 
            className="text-xs font-bold border px-3 py-1 rounded-full"
            style={{ backgroundColor: C.dark?.surface, borderColor: C.amber?.dark, color: C.amber?.DEFAULT }}
          >
            {badges.length} / {BADGE_CONFIGS.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGE_CONFIGS.map((badgeItem) => {
            const isUnlocked = unlockedKeys.has(badgeItem.key) || unlockedKeys.has(badgeItem.id);
            const Icon = badgeItem.icon;
            const title = t(`gamification.badges.${badgeItem.key}.title`, badgeItem.id);
            const desc = t(`gamification.badges.${badgeItem.key}.desc`, '');

            return (
              <div 
                key={badgeItem.id} 
                onClick={() => handleBadgeClick({ ...badgeItem, title, desc }, isUnlocked)} 
                className={`relative flex flex-col items-center justify-between p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
                  !isUnlocked ? 'opacity-40 grayscale' : ''
                }`}
                style={{
                  backgroundColor: isUnlocked ? C.dark?.surface : C.dark?.card,
                  borderColor: isUnlocked ? C.amber?.dark : C.dark?.cardBorder
                }}
              >
                {isUnlocked && (
                  <span 
                    className="absolute -top-2 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-sm"
                    style={{ backgroundColor: C.amber?.DEFAULT, color: '#090d16' }}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {t('gamification.acquired', 'مكتسب')}
                  </span>
                )}
                {!isUnlocked && (
                  <Lock 
                    className="w-4 h-4 absolute top-2.5 pe-1" 
                    style={{ color: C.text?.muted, left: isRTL ? 'auto' : '0.625rem', right: isRTL ? '0.625rem' : 'auto' }} 
                  />
                )}
                
                <div 
                  className="mt-2 p-3 rounded-2xl border transition-colors"
                  style={{
                    backgroundColor: isUnlocked ? C.dark?.card : C.dark?.surface,
                    borderColor: isUnlocked ? C.amber?.dark : C.dark?.cardBorder,
                    color: isUnlocked ? C.amber?.DEFAULT : C.text?.muted
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="w-full mt-3">
                  <h4 className="text-xs font-bold" style={{ color: C.text?.title }}>
                    {title}
                  </h4>
                  <p className="text-[10px] mt-1 line-clamp-2" style={{ color: C.text?.muted }}>
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. نافذة العرض والتفاصيل التفاعلية */}
      {selectedBadge && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-black/70">
          <div 
            className="border rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
            style={{ backgroundColor: C.dark?.card, borderColor: C.dark?.cardBorder }}
          >
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 pe-1 p-1 rounded-lg border text-xs"
              style={{ 
                left: isRTL ? '1rem' : 'auto', 
                right: isRTL ? 'auto' : '1rem',
                backgroundColor: C.dark?.surface, 
                borderColor: C.dark?.cardBorder,
                color: C.text?.muted 
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <div 
              className="p-4 border rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-inner"
              style={{ 
                backgroundColor: C.dark?.surface, 
                borderColor: selectedBadge.isUnlocked ? C.amber?.dark : C.dark?.cardBorder, 
                color: selectedBadge.isUnlocked ? C.amber?.DEFAULT : C.text?.muted 
              }}
            >
              <selectedBadge.icon className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold" style={{ color: C.text?.title }}>
                {selectedBadge.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: C.text?.muted }}>
                {selectedBadge.desc}
              </p>
            </div>

            <button 
              onClick={() => setSelectedBadge(null)} 
              className="w-full py-2.5 text-xs font-bold rounded-xl border transition-opacity hover:opacity-90"
              style={{ backgroundColor: C.dark?.surface, borderColor: C.dark?.cardBorder, color: C.text?.title }}
            >
              {t('common.close', 'إغلاق')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
