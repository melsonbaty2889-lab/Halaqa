import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Flame, Star, Crown, Lock, CheckCircle2, Sparkles, Target, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const SYSTEM_BADGES = [
  { id: 'hifzSpark', key: 'hifzSpark', title: 'شعلة الحفظ', desc: 'الالتزام بالحفظ لمشوار متواصل', icon: Flame },
  { id: 'juzMastery', key: 'juzMastery', title: 'إتقان جزء', desc: 'الحصول على تقييم ممتاز في مراجعة جزء كامل', icon: Star },
  { id: 'weeklyActive', key: 'weeklyActive', title: 'الملتزم الأسبوعي', desc: 'حضور وتسميع جميع جلسات الأسبوع بدون غياب', icon: Crown },
  { id: 'qaidaMaster', key: 'qaidaMaster', title: 'بطل التجويد', desc: 'إتقان أحكام التجويد والنطق الصحيح', icon: Award }
];

export default function StudentBadges({ badges = [], streakDays = 0 }) {
  const { t } = useTranslation();
  const [selectedBadge, setSelectedBadge] = useState(null);
  const unlockedKeys = new Set(badges.map(b => b.key || b.id));

  const handleBadgeClick = (badge, isUnlocked) => {
    setSelectedBadge(badge);
    if (isUnlocked) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: ['#f59e0b', '#fbbf24', '#10b981'] });
    }
  };

  // بيانات التحدي الأسبوعي المدمجة
  const questTarget = 7;
  const questProgress = Math.min(100, Math.round((streakDays / questTarget) * 100));

  return (
    <div className="space-y-4">
      {/* 1. التحدي الأسبوعي */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase">التحدي الأسبوعي</span>
              <p className="text-xs font-semibold text-slate-300">الالتزام بالتحفيظ طوال الأسبوع</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl text-amber-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>+50 نقطة</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-400">التقدم</span>
            <span className="text-amber-400 font-mono">{streakDays} / {questTarget} ({questProgress}%)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-500" style={{ width: `${questProgress}%` }} />
          </div>
        </div>
      </div>

      {/* 2. الأوسمة والبادجات */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">شارات التميز والإتقان</h3>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            {badges.length} / {SYSTEM_BADGES.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SYSTEM_BADGES.map((sysBadge) => {
            const isUnlocked = unlockedKeys.has(sysBadge.key) || unlockedKeys.has(sysBadge.id);
            const Icon = sysBadge.icon;

            return (
              <div key={sysBadge.id} onClick={() => handleBadgeClick(sysBadge, isUnlocked)} className={`relative flex flex-col items-center justify-between p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${isUnlocked ? 'bg-slate-800/80 border-amber-500/50' : 'bg-slate-950/40 border-slate-800/80 opacity-40 grayscale'}`}>
                {isUnlocked && <span className="absolute -top-2 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />مكتسب</span>}
                {!isUnlocked && <Lock className="w-4 h-4 text-slate-500 absolute top-2.5 right-2.5" />}
                <div className={`mt-2 p-3 rounded-2xl border ${isUnlocked ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="w-full mt-3">
                  <h4 className="text-xs font-bold text-white">{sysBadge.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{sysBadge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* نافذة التفاصيل */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center text-amber-400">
              <selectedBadge.icon className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white">{selectedBadge.title}</h3>
            <p className="text-xs text-slate-400">{selectedBadge.desc}</p>
            <button onClick={() => setSelectedBadge(null)} className="w-full py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}
