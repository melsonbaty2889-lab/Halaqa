import React from 'react';
import { FaArrowUp, FaBookOpen } from 'react-icons/fa';

export default function AchievementChart({ isRtl = true }) {
  // بيانات إنجاز الأكاديمية خلال الأسبوع (عدد الصفحات المحفوظة/المراجعة)
  const weeklyData = [
    { dayAr: 'السبت', dayEn: 'Sat', pages: 45 },
    { dayAr: 'الأحد', dayEn: 'Sun', pages: 65 },
    { dayAr: 'الإثنين', dayEn: 'Mon', pages: 55 },
    { dayAr: 'الثلاثاء', dayEn: 'Tue', pages: 85 },
    { dayAr: 'الأربعاء', dayEn: 'Wed', pages: 70 },
    { dayAr: 'الخميس', dayEn: 'Thu', pages: 95 },
  ];

  const maxPages = 100; // الحد الأقصى للمقياس لضبط أبعاد الرسم
  const chartHeight = 160; // ارتفاع منطقة الرسم البياني

  // تحويل البيانات إلى نقاط داخل الـ SVG
  const points = weeklyData.map((d, index) => {
    const x = (index / (weeklyData.length - 1)) * 100; // نسبة مئوية لعرض مرن
    const y = chartHeight - (d.pages / maxPages) * chartHeight;
    return { x, y, ...d };
  });

  // بناء مسار المنحنى الانسيابي (Line Path) ومسار التعبئة المظلل (Area Path)
  // إذا كانت الواجهة تعتمد RTL، نعكس ترتيب النقاط لتبدأ من اليمين إلى اليسار بمنطق بصرى سليم
  const orderedPoints = isRtl ? [...points].reverse() : points;
  
  const linePath = orderedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${isRtl ? 0 : 100}% ${chartHeight} L ${isRtl ? 100 : 0}% ${chartHeight} Z`;

  const textAlignment = isRtl ? 'text-right' : 'text-left';

  return (
    <div 
      className="p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-5 justify-between h-full"
      style={{ background: 'var(--surface)' }}
    >
      {/* رأس الجزء (Header) */}
      <div className={`flex items-start justify-between ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex flex-col gap-1 ${textAlignment}`}>
          <h3 className="text-base font-bold text-white">
            {isRtl ? 'منحنى الإنجاز الأسبوعي' : 'Weekly Achievement Chart'}
          </h3>
          <p className="text-xs text-slate-400">
            {isRtl ? 'مجموع الصفحات المنجزة (حفظ ومراجعة)' : 'Total completed pages (Hifz & Muraja\'ah)'}
          </p>
        </div>
        
        {/* إحصائية سريعة مميزة */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <FaArrowUp size={10} />
          <span>+12%</span>
          <span className="text-slate-500 font-normal">{isRtl ? 'عن الأسبوع الماضي' : 'vs last week'}</span>
        </div>
      </div>

      {/* المؤشرات الرقمية السريعة */}
      <div className={`grid grid-cols-2 gap-4 ${isRtl ? 'direction-rtl' : 'direction-ltr'}`}>
        <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/[0.01] ${textAlignment}`}>
          <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'إجمالي صفحات الأسبوع' : 'Total Weekly Pages'}</span>
          <span className="text-xl font-bold text-white flex items-center gap-2 justify-start">
            <FaBookOpen className="text-[var(--gold)] text-sm" />
            415 {isRtl ? 'صفحة' : 'Pages'}
          </span>
        </div>
        <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/[0.01] ${textAlignment}`}>
          <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'أعلى يوم إنجاز' : 'Peak Day'}</span>
          <span className="text-xl font-bold text-[var(--gold)]">
            {isRtl ? 'الخميس (٩٥)' : 'Thu (95)'}
          </span>
        </div>
      </div>

      {/* منطقة الرسم البياني الذكي باستخدام SVG مرن وResponsive */}
      <div className="relative w-full mt-2" style={{ height: `${chartHeight}px` }}>
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            {/* التدرج اللوني الذهبي الفاخر لتعبئة المنحنى */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* خطوط الشبكة الخلفية الأفقية (Grid Lines) */}
          <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1={chartHeight / 2} x2="100%" y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1={chartHeight} x2="100%" y2={chartHeight} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* 1. مسار التعبئة (Area Path) */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* 2. خط المنحنى الأساسي (Line Path) */}
          <path d={linePath} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* 3. النقاط التفاعلية فوق المنحنى (Data Nodes) */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle 
                cx={`${p.x}%`} 
                cy={p.y} 
                r="4" 
                className="fill-[var(--surface)] stroke-[var(--gold)] stroke-2 transition-all duration-200 group-hover:r-5 group-hover:fill-[var(--gold)]" 
              />
              {/* تلميح ذكي يظهر عند تمرير الفأرة فوق النقطة */}
              <foreignObject 
                x={`calc(${p.x}% - 20px)`} 
                y={p.y - 32} 
                width="40" 
                height="24"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              >
                <div className="bg-slate-900 text-white text-[10px] font-bold rounded px-1 py-0.5 text-center border border-white/10 shadow-md">
                  {p.pages}
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>

      {/* أسماء الأيام أسفل الرسم البياني المتناسقة مع الاتجاهين */}
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
