/* src/components/Student/StudentStatsCard.jsx */
import React from 'react';
import { Flame, Crown, TrendingUp, Sparkles } from 'lucide-react';
import colors from '@/theme/colors';

export default function StudentStatsCard({ student = {}, isRtl = true }) {
  const streak = student?.current_streak || 0;
  const points = student?.points || 0;

  // حساب الهدف القادم للسلسلة (كل 3 أيام أو 7 أيام)
  const nextStreakGoal = streak < 3 ? 3 : Math.ceil((streak + 1) / 3) * 3;
  const streakProgress = Math.min(100, Math.round((streak / nextStreakGoal) * 100));

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[${colors.background || '#0F172A'}] p-3.5 rounded-xl border border-slate-700/80 shadow-md`}>
      
      {/* 1. بطاقة السلسلة مع شريط التقدم والتأثير الحي */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-slate-900 to-slate-900 p-3 rounded-lg border border-red-500/20 flex flex-col justify-between">
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400 shadow-sm">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-start">
              <div className="text-[11px] text-slate-400 font-medium">
                {isRtl ? 'سلسلة الالتزام' : 'Active Streak'}
              </div>
              <div className="text-base font-bold text-red-400 flex items-center gap-1.5">
                <span>{streak} {isRtl ? 'أيام' : 'Days'}</span>
                {streak > 0 && (
                  <span className="inline-flex items-center text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full border border-red-500/30">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    {isRtl ? 'نشط' : 'Active'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* شريط التقدم نحو الوسام القادم */}
        <div className="mt-1">
          <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1">
            <span>{isRtl ? `الهدف: ${nextStreakGoal} أيام` : `Goal: ${nextStreakGoal} Days`}</span>
            <span>{streakProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500 w-[${streakProgress}%]`} 
            />
          </div>
        </div>

      </div>

      {/* 2. بطاقة إجمالي النقاط والمستوى */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 p-3 rounded-lg border border-amber-500/20 flex flex-col justify-between">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div className="text-start">
              <div className="text-[11px] text-slate-400 font-medium">
                {isRtl ? 'مجموع النقاط' : 'Total Points'}
              </div>
              <div className="text-base font-bold text-amber-400">
                {points.toLocaleString()} {isRtl ? 'نقطة' : 'Pts'}
              </div>
            </div>
          </div>

          <div className="p-1.5 bg-amber-400/10 rounded-full text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* مؤشر رتبة الطالب */}
        <div className="mt-2 text-start pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            {isRtl ? 'المستوى الحالي:' : 'Current Rank:'}
          </span>
          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {points >= 500 ? (isRtl ? 'متميز 🌟' : 'Elite 🌟') : (isRtl ? 'مكافح ⚡' : 'Striker ⚡')}
          </span>
        </div>

      </div>

    </div>
  );
}
