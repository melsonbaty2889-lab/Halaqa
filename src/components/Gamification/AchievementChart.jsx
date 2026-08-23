/* src/components/Gamification/AchievementChart.jsx */
import React from 'react';
import { TrendingUp, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import colors from '@/theme/colors';

const DEFAULT_WEEKLY_DATA = [
  { dayAr: 'السبت', dayEn: 'Sat', pages: 45 },
  { dayAr: 'الأحد', dayEn: 'Sun', pages: 65 },
  { dayAr: 'الإثنين', dayEn: 'Mon', pages: 55 },
  { dayAr: 'الثلاثاء', dayEn: 'Tue', pages: 85 },
  { dayAr: 'الأربعاء', dayEn: 'Wed', pages: 70 },
  { dayAr: 'الخميس', dayEn: 'Thu', pages: 95 },
  { dayAr: 'الجمعة', dayEn: 'Fri', pages: 60 },
];

export default function AchievementChart({ data = DEFAULT_WEEKLY_DATA, isRtl: propIsRtl }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language?.split('-')[0]?.toLowerCase() || 'ar';
  const isRtl = propIsRtl !== undefined ? propIsRtl : (i18n?.dir() === 'rtl');

  const safeData = data && data.length > 0 ? data : DEFAULT_WEEKLY_DATA;
  
  const totalPages = safeData.reduce((sum, item) => sum + item.pages, 0);
  const peakDayItem = [...safeData].sort((a, b) => b.pages - a.pages)[0] || { dayAr: '-', dayEn: '-', pages: 0 };
  const peakDayName = isRtl ? peakDayItem.dayAr : peakDayItem.dayEn;

  const highestPageValue = Math.max(...safeData.map(d => d.pages), 10);
  const maxPages = highestPageValue * 1.15;

  const chartWidth = 500;   
  const chartHeight = 140;  

  const points = safeData.map((d, index) => {
    const divider = safeData.length > 1 ? safeData.length - 1 : 1;
    const x = isRtl 
      ? chartWidth - (index / divider) * chartWidth
      : (index / divider) * chartWidth;
    
    const y = chartHeight - (d.pages / maxPages) * chartHeight;
    return { x, y, ...d, originalIndex: index };
  });

  const sortedPointsForPath = [...points].sort((a, b) => a.x - b.x);
  const linePath = sortedPointsForPath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = sortedPointsForPath.length > 0 
    ? `${linePath} L ${sortedPointsForPath[sortedPointsForPath.length - 1].x} ${chartHeight} L ${sortedPointsForPath[0].x} ${chartHeight} Z`
    : '';

  const textAlignment = isRtl ? 'text-right' : 'text-left';

  return (
    <div className="p-5 rounded-2xl border border-white/5 shadow-2xl flex flex-col gap-4 justify-between h-full transition-all duration-300 hover:border-white/10 select-none bg-slate-900">
      <style>{`
        @keyframes customBlurIn {
          from { opacity: 0; transform: scaleY(0.95); transform-origin: bottom; }
          to { opacity: 1; transform: scaleY(1); }
        }
        @keyframes dashDraw {
          from { stroke-dashoffset: 1200; }
          to { stroke-dashoffset: 0; }
        }
        .animate-chart-area { animation: customBlurIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-chart-line { 
          stroke-dasharray: 1200; 
          stroke-dashoffset: 1200; 
          animation: dashDraw 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards; 
        }
      `}</style>

      {/* الرأس الإحصائي */}
      <div className={`flex items-start justify-between gap-2 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex flex-col gap-0.5 ${textAlignment}`}>
          <h3 className="text-sm font-bold text-white tracking-wide">
            {t('gamification.chartTitle', isRtl ? 'منحنى الإنجاز الأسبوعي' : 'Weekly Achievement Chart')}
          </h3>
          <p className="text-[11px] text-slate-400">
            {t('gamification.chartSubtitle', isRtl ? 'مجموع الصفحات المنجزة (حفظ ومراجعة)' : 'Total completed pages (Hifz & Muraja\'ah)')}
          </p>
        </div>
        
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 dir-ltr">
          <TrendingUp className="w-3 h-3" />
          <span>+12%</span>
        </div>
      </div>

      {/* بطاقات البيانات الإحصائية */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] ${textAlignment} min-w-0`}>
          <span className="text-[11px] text-slate-400 block mb-0.5 truncate">
            {t('gamification.totalWeeklyPages', isRtl ? 'إجمالي صفحات الأسبوع' : 'Total Weekly Pages')}
          </span>
          <span className="text-base sm:text-lg font-extrabold text-white flex items-center gap-1 justify-start min-w-0">
            <BookOpen className="text-amber-400 w-4 h-4 shrink-0" />
            <span className="font-sans truncate">{totalPages}</span> 
            <span className="text-xs font-normal text-slate-400 shrink-0">
              {t('gamification.pagesUnit', isRtl ? 'صفحة' : 'Pages')}
            </span>
          </span>
        </div>

        {/* حماية بطاقة أعلى يوم من القص */}
        <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] ${textAlignment} min-w-0`}>
          <span className="text-[11px] text-slate-400 block mb-0.5 truncate">
            {t('gamification.peakDay', isRtl ? 'أعلى يوم إنجاز' : 'Peak Day')}
          </span>
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-base font-bold text-amber-400 truncate">
              {peakDayName}
            </span>
            <span className="text-xs font-semibold text-slate-400 shrink-0">
              ({peakDayItem.pages})
            </span>
          </div>
        </div>
      </div>

      {/* رسم الـ SVG */}
      <div className="relative w-full mt-2 h-[140px]">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-full overflow-visible" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradientUltimate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.00" />
            </linearGradient>
            <filter id="glowUltimate" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#FBBF24" floodOpacity="0.2" />
            </filter>
          </defs>

          <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {sortedPointsForPath.length > 0 && (
            <>
              <path d={areaPath} fill="url(#chartGradientUltimate)" className="animate-chart-area" />
              <path 
                d={linePath} 
                fill="none" 
                stroke="#FBBF24" 
                strokeWidth="2.75" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                filter="url(#glowUltimate)" 
                className="animate-chart-line"
              />
            </>
          )}

          {points.map((p, i) => {
            const tooltipWidth = 46;
            const safeTooltipX = Math.max(4, Math.min(chartWidth - tooltipWidth - 4, p.x - tooltipWidth / 2));

            return (
              <g key={i} className="group/node cursor-pointer">
                <line 
                  x1={p.x} y1={p.y} x2={p.x} y2={chartHeight} 
                  stroke="#FBBF24" strokeWidth="1" strokeDasharray="2 2" 
                  className="opacity-0 group-hover/node:opacity-40 transition-opacity duration-200"
                />
                <circle cx={p.x} cy={p.y} r="8" className="fill-amber-400/20 opacity-0 group-hover/node:opacity-100 transition-all duration-200" />
                <circle cx={p.x} cy={p.y} r="3.5" className="fill-slate-900 stroke-amber-400 stroke-[2.5] transition-all duration-200 group-hover/node:r-4.5" />

                <g className="opacity-0 pointer-events-none group-hover/node:opacity-100 transition-all duration-150 origin-center">
                  <rect 
                    x={safeTooltipX} 
                    y={p.y - 28} 
                    width={tooltipWidth} 
                    height="20" 
                    rx="6" 
                    fill="#FBBF24"
                  />
                  <text 
                    x={safeTooltipX + tooltipWidth / 2} 
                    y={p.y - 14} 
                    fill="#0F172A" 
                    fontSize="10" 
                    fontWeight="bold" 
                    textAnchor="middle"
                    className="font-sans"
                  >
                    {p.pages}P
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* محور الأيام السفلي مع التوزيع المحاذي */}
      <div className={`grid grid-cols-7 text-[11px] text-slate-400 font-semibold text-center ${
        isRtl ? 'direction-rtl' : 'direction-ltr'
      }`}>
        {safeData.map((d, i) => (
          <span key={i} className="truncate px-0.5">
            {isRtl ? d.dayAr : d.dayEn}
          </span>
        ))}
      </div>
    </div>
  );
}
