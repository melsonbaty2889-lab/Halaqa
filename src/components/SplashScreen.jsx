/* src/components/SplashScreen.jsx */
import React, { useState, useEffect } from 'react';
import { FaBookOpen } from 'react-icons/fa';

export default function SplashScreen({ 
  lang = 'ar',
  t 
}) {
  const [progress, setProgress] = useState(0);
  const [randomAya, setRandomAya] = useState('');

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
    // اختيار آية عشوائية
    const selectedAyat = currentT.ayat;
    const selected = selectedAyat[Math.floor(Math.random() * selectedAyat.length)];
    setRandomAya(selected);

    // شريط التقدم السلس 0% -> 100%
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
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
      userSelect: 'none'
    }}>

      {/* 🌟 1. نمط إسلامي خفيف في الخلفية */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(rgba(201, 168, 76, 0.06) 1px, transparent 0)`,
        backgroundSize: '28px 28px',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      {/* 🌟 2. المربع الأخضر واللوجو الأصلي الدقيق */}
      <div style={{
        position: 'relative',
        width: '100px',
        height: '100px',
        borderRadius: '26px',
        background: 'linear-gradient(145deg, #0E7490 0%, #047857 50%, #064E3B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '24px'
      }}>
        {/* الحلقة الذهبية الدوارة الأصلية حول المصحف */}
        <div style={{
          position: 'relative',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2.5px solid transparent',
            borderTopColor: '#F59E0B',
            borderRightColor: '#F59E0B',
            borderBottomColor: '#F59E0B',
            animation: 'spin 2.5s linear infinite'
          }} />

          <FaBookOpen style={{ color: '#FCD34D', fontSize: '32px', zIndex: 2 }} />
        </div>
      </div>

      {/* 🌟 3. اسم المنصة المترجم */}
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

      {/* 🌟 4. الآية/القول المترجم */}
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

      {/* 🌟 5. شريط التحميل المترجم */}
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

      {/* 🌟 6. الإصدار */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        color: '#475569',
        fontSize: '0.7rem',
        letterSpacing: '1px'
      }}>
        SMART HALAQA • v2.4
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
      }
