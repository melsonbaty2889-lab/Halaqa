import React, { useState, useEffect } from 'react';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';

export default function SplashScreen({ 
  lang = 'ar',
  t,
  onFinish 
}) {
  const [progress, setProgress] = useState(0);
  const [randomAya, setRandomAya] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);

  const translations = {
    ar: {
      title: "الحلقة الذكية",
      subtitle: "المنصة الذكية لإدارة حلقات القرآن الكريم",
      loading: "جاري التحميل...",
      ayat: [
        "وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ",
        "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
        "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
        "إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"
      ]
    },
    en: {
      title: "Smart Halaqa",
      subtitle: "The Smart Platform for Quranic Circles",
      loading: "Loading...",
      ayat: [
        "And for this let the competitors compete",
        "And recite the Quran with measured recitation",
        "The best among you are those who learn the Quran and teach it"
      ]
    }
  };

  const currentT = translations[lang] || translations['ar'];
  const isRtl = lang === 'ar';

  useEffect(() => {
    const selectedAyat = currentT.ayat;
    const selected = selectedAyat[Math.floor(Math.random() * selectedAyat.length)];
    setRandomAya(selected);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onFinish) onFinish();
            }, 500);
          }, 200);
          return 100;
        }
        return prev + 2;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [lang]);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden select-none bg-[var(--bg-dark,#070B11)] text-[var(--text-main,#FFFFFF)] transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* خلفية النجوم والتوهج الزمرّدي العلوي من index.css */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, var(--emerald-radial-glow, rgba(16, 185, 129, 0.14)) 0%, transparent 60%),
            radial-gradient(rgba(255, 255, 255, 0.15) 1.2px, transparent 0)
          `,
          backgroundSize: '100% 100%, 24px 24px'
        }}
      />

      {/* الشعار الموحد */}
      <div className="mb-6 drop-shadow-[0_0_20px_var(--emerald-radial-glow,rgba(16,185,129,0.2))]">
        <SmartHalaqaProLogo size={100} />
      </div>

      {/* العنوان الأساسي */}
      <h1 className="text-2xl font-extrabold text-[var(--text-main,#FFFFFF)] mb-1.5 tracking-tight">
        {t ? t('app_name') : currentT.title}
      </h1>
      
      {/* الوصف الفرعي */}
      <p className="text-sm text-[var(--text-sub,#94A3B8)] mb-6 font-medium">
        {t ? t('app_subtitle') : currentT.subtitle}
      </p>

      {/* بطاقة الآية الكريمة */}
      <div className="bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md rounded-xl px-5 py-2.5 mb-8 max-w-xs text-center shadow-lg">
        <span className="text-[var(--primary,#E07A00)] text-sm font-semibold block">
          {isRtl ? `﴿ ${randomAya} ﴾` : `"${randomAya}"`}
        </span>
      </div>

      {/* شريط التحميل */}
      <div className="w-56 relative">
        <div className="flex justify-between items-center text-[var(--text-sub,#94A3B8)] text-xs mb-1.5">
          <span>{t ? t('loading') : currentT.loading}</span>
          <span className="text-[var(--primary,#E07A00)] font-bold">{progress}%</span>
        </div>

        <div className="w-full h-1 bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-100 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--emerald-text, #10B981), var(--primary, #E07A00))'
            }}
          />
        </div>
      </div>

      {/* رقم الإصدار */}
      <div className="absolute bottom-5 text-xs text-[var(--text-muted,#475569)] tracking-wider font-mono">
        SMART HALAQA • v2.4
      </div>
    </div>
  );
}
