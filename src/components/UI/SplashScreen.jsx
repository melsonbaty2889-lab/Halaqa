// src/components/UI/SplashScreen.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { toEngNums } from '@/utils/dateUtils';

export default function SplashScreen({ onFinish }) {
  const { t, i18n } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [randomAya, setRandomAya] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);

  // 🟢 استخراج اللغة والاتجاه المعتمد مباشرة بدون ومضات
  const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
  const isRtl = currentLang.startsWith('ar');

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
      loading: "Loading system...",
      ayat: [
        "And for this let the competitors compete",
        "And recite the Quran with measured recitation",
        "The best among you are those who learn the Quran and teach it"
      ]
    }
  };

  const currentT = translations[isRtl ? 'ar' : 'en'];

  useEffect(() => {
    // اختيار الآية
    const selectedAyat = currentT.ayat;
    const selected = selectedAyat[Math.floor(Math.random() * selectedAyat.length)];
    setRandomAya(selected);

    // 🟢 تقليل التحديث ليكون أنعم وبدون ضغط على الـ CPU (كل 120ms زاد التقدم)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onFinish) onFinish();
            }, 400);
          }, 150);
          return 100;
        }
        return prev + 5;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [currentLang]);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden select-none bg-slate-950 text-white transition-opacity duration-500 ease-out font-sans ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* خلفية الإضاءة الهادئة */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 35%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 0)
          `,
          backgroundSize: '100% 100%, 28px 28px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
        {/* الشعار الموحد مع نبض أنيق */}
        <div className="mb-5 animate-pulse drop-shadow-[0_0_25px_rgba(16,185,129,0.25)]">
          <SmartHalaqaProLogo size={90} />
        </div>

        {/* العنوان الأساسي */}
        <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
          {t('app_name', currentT.title)}
        </h1>
        
        {/* الوصف الفرعي */}
        <p className="text-xs text-slate-400 mb-6 font-medium">
          {t('app_subtitle', currentT.subtitle)}
        </p>

        {/* بطاقة الآية الكريمة */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl px-5 py-3 mb-8 w-full shadow-xl">
          <span className="text-amber-400 text-xs sm:text-sm font-semibold block leading-relaxed">
            {isRtl ? `﴿ ${randomAya} ﴾` : `"${randomAya}"`}
          </span>
        </div>

        {/* شريط التحميل */}
        <div className="w-60 relative">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-2">
            <span className="font-medium">{t('loading', currentT.loading)}</span>
            <span className="text-emerald-400 font-mono font-bold">{toEngNums(progress)}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full transition-all duration-150 ease-out bg-gradient-to-r from-emerald-500 to-amber-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* رقم الإصدار */}
      <div className="absolute bottom-6 text-[10px] text-slate-500 tracking-widest font-mono">
        SMART HALAQA • v2.5
      </div>
    </div>
  );
}
