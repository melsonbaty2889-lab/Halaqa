import React from 'react';
import { FaArrowUp, FaBookOpen } from 'react-icons/fa';

export default function AchievementChart({ isRtl = true }) {
  const weeklyData = [
    { dayAr: 'السبت', dayEn: 'Sat', pages: 45 },
    { dayAr: 'الأحد', dayEn: 'Sun', pages: 65 },
    { dayAr: 'الإثنين', dayEn: 'Mon', pages: 55 },
    { dayAr: 'الثلاثاء', dayEn: 'Tue', pages: 85 },
    { dayAr: 'الأربعاء', dayEn: 'Wed', pages: 70 },
    { dayAr: 'الخميس', dayEn: 'Thu', pages: 95 },
  ];

  const maxPages = 100; 
  const chartWidth = 500;   // تحديد عرض ثابت للـ viewBox لضمان استقرار المسار
  const chartHeight = 160;  // تحديد ارتفاع ثابت للـ viewBox

  // حساب النقاط كأرقام صافية بدون علامة %
  const points = weeklyData.map((d, index) => {
    const x = (index / (weeklyData.length - 1)) * chartWidth;
    const y = chartHeight - (d.pages / maxPages) * chartHeight;
    return { x, y, ...d };
  });

  const orderedPoints = isRtl ? [...points].reverse() : points;
  
  const linePath = orderedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${isRtl ? 0 : chartWidth} ${chartHeight} L ${isRtl ? chartWidth : 0} ${chartHeight} Z`;

  const textAlignment = isRtl ? 'text-right' : 'text-left';

  return (
    <div 
      className="p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-5 justify-between h-full"
      style={{ background: 'var(--surface)' }}
    >
      <div className={`flex items-start justify-between ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex flex-col gap-1 ${textAlignment}`}>
          <h3 className="text-base font-bold text-white">
            {isRtl ? 'منحنى الإنجاز الأسبوعي' : 'Weekly Achievement Chart'}
          </h3>
          <p className="text-xs text-slate-400">
            {isRtl ? 'مجموع الصفحات المنجزة (حفظ ومراجعة)' : 'Total completed pages (Hifz & Muraja\'ah)'}
          </p>
        </div>
        
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <FaArrowUp size={10} />
          <span>+12%</span>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-4 ${isRtl ? 'direction-rtl' : 'direction-ltr'}`}>
        <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/[0.01] ${textAlignment}`}>
          <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'إجمالي صفحات الأسبوع' : 'Total Weekly Pages'}</span>
          <span className="text-xl font-bold text-white flex items-center gap-2 justify-start">
            <FaBookOpen className="text-[#FBBF24] text-sm" />
            415 {isRtl ? 'صفحة' : 'Pages'}
          </span>
        </div>
        <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/[0.01] ${textAlignment}`}>
          <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'أعلى يوم إنجاز' : 'Peak Day'}</span>
          <span className="text-xl font-bold text-[#FBBF24]">
            {isRtl ? 'الخميس (٩٥)' : 'Thu (95)'}
          </span>
        </div>
      </div>

      {/* منطقة الرسم البياني بعد تصحيح الـ viewBox */}
      <div className="relative w-full mt-2" style={{ height: `${chartHeight}px` }}>
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-full overflow-visible" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* رسم التعبئة والخط بنجاح الآن */}
          <path d={areaPath} fill="url(#chartGradient)" />
          <path d={linePath} fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* العقد التفاعلية */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                className="fill-[#1e293b] stroke-[#FBBF24] stroke-2 transition-all duration-200 group-hover:r-5 group-hover:fill-[#FBBF24]" 
              />
            </g>
          ))}
        </svg>
      </div>

      <div className={`flex justify-between text-[11px] text-slate-500 font-medium px-1 ${
        isRtl ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {weeklyData.map((d, i) => (
          <span key={i} className="w-10 text-center block">
            {isRtl ? d.dayAr : d.dayEn}
          </span>
        ))}
      </div>
    </div>
  );
}
