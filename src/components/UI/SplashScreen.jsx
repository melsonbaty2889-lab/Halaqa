/* src/components/UI/SplashScreen.jsx */
import React, { useState, useEffect } from 'react';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo'; // 👈 استدعاء الشعار الموحد

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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'radial-gradient(circle at center, #0F172A 0%, #070B14 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Cairo', sans-serif",
      direction: isRtl ? 'rtl' : 'ltr',
      overflow: 'hidden',
      userSelect: 'none',
      opacity: isFadingOut ? 0 : 1,
      visibility: isFadingOut ? 'hidden' : 'visible',
      transition: 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out'
    }}>

      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(rgba(201, 168, 76, 0.06) 1px, transparent 0)`,
        backgroundSize: '28px 28px',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      {/* 🟢 استبدال التصميم القديم بمكون اللوجو الموحد بالحجم المناسب */}
      <div style={{ marginBottom: '24px', filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))' }}>
        <SmartHalaqaProLogo size={100} />
      </div>

      <h1 style={{
        color: '#FFFFFF',
        fontSize: '1.8rem',
        fontWeight: '800',
        margin: '0 0 6px 0',
        letterSpacing: '0.5px'
      }}>
        {t ? t('app_name') : currentT.title}
      </h1>
      
      <p style={{
        color: '#94A3B8',
        fontSize: '0.88rem',
        margin: '0 0 24px 0',
        fontWeight: '500'
      }}>
        {t ? t('app_subtitle') : currentT.subtitle}
      </p>

      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '10px 20px',
        marginBottom: '30px',
        maxWidth: '340px',
        textAlign: 'center'
      }}>
        <span style={{ color: '#C9A84C', fontSize: '0.85rem', fontWeight: '600', display: 'block' }}>
          {isRtl ? `﴿ ${randomAya} ﴾` : `"${randomAya}"`}
        </span>
      </div>

      <div style={{ width: '220px', position: 'relative' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#64748B',
          fontSize: '0.75rem',
          marginBottom: '6px'
        }}>
          <span>{t ? t('loading') : currentT.loading}</span>
          <span style={{ color: '#C9A84C', fontWeight: 'bold' }}>{progress}%</span>
        </div>

        <div style={{
          width: '100%',
          height: '4px',
          background: '#1E293B',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #10B981, #C9A84C)',
            borderRadius: '10px',
            transition: 'width 0.1s ease-out'
          }} />
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        color: '#475569',
        fontSize: '0.7rem',
        letterSpacing: '1px'
      }}>
        SMART HALAQA • v2.4
      </div>
    </div>
  );
}
