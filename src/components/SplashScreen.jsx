/* src/components/SplashScreen.jsx */
import React, { useState, useEffect, useRef } from 'react';
import { FaBookOpen, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const QURAN_AYAT = [
  "وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ",
  "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
  "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
  "إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"
];

// 🎵 صوت فتح هادئ ومميز
const SPLASH_AUDIO_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; 

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [randomAya, setRandomAya] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // اختيار آية قرآنية عشوائية
    const selectedAya = QURAN_AYAT[Math.floor(Math.random() * QURAN_AYAT.length)];
    setRandomAya(selectedAya);

    // شريط التقدم السلس 0% -> 100%
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 5));
    }, 70);

    return () => clearInterval(interval);
  }, []);

  // 🔊 تشغيل الصوت فور الضغط على زر الصوت
  const handleSoundClick = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsAudioPlaying(false);
      } else {
        audioRef.current.volume = 0.4;
        audioRef.current.play().then(() => {
          setIsAudioPlaying(true);
        }).catch((err) => console.log("Audio play error:", err));
      }
    }
  };

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
      direction: 'rtl',
      overflow: 'hidden',
      userSelect: 'none'
    }}>

      {/* 🎵 عنصر الصوت */}
      <audio 
        ref={audioRef} 
        src={SPLASH_AUDIO_URL} 
        preload="auto" 
        onEnded={() => setIsAudioPlaying(false)}
      />

      {/* 🔊 زر الصوت (يعمل بالضغط المباشر) */}
      <button 
        onClick={handleSoundClick}
        title={isAudioPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: isAudioPlaying ? '#C9A84C' : '#64748B',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s ease'
        }}
      >
        {isAudioPlaying ? <FaVolumeUp size={18} /> : <FaVolumeMute size={18} />}
      </button>

      {/* 🌟 1. نمط إسلامي خفيف في الخلفية */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(rgba(201, 168, 76, 0.06) 1px, transparent 0)`,
        backgroundSize: '28px 28px',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      {/* 🌟 2. المربع الأخضر واللوجو الأصلي */}
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
        {/* 🌟 3. الحلقة الدائرية الذهبية الأصلية (حول المصحف وتدور) */}
        <div style={{
          position: 'relative',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* الحلقة الذهبية الدوارة */}
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

          {/* أيقونة المصحف الشريف بالمنتصف */}
          <FaBookOpen style={{ color: '#FCD34D', fontSize: '32px', zIndex: 2 }} />
        </div>
      </div>

      {/* 🌟 4. اسم المنصة */}
      <h1 style={{
        color: '#FFFFFF',
        fontSize: '1.8rem',
        fontWeight: '800',
        margin: '0 0 6px 0',
        letterSpacing: '0.5px'
      }}>
        الحلقة الذكية
      </h1>
      
      <p style={{
        color: '#94A3B8',
        fontSize: '0.88rem',
        margin: '0 0 24px 0',
        fontWeight: '500'
      }}>
        المنصة الذكية لإدارة حلقات القرآن الكريم
      </p>

      {/* 🌟 5. الآية القرآنية */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '10px 20px',
        marginBottom: '30px',
        maxWidth: '320px',
        textAlign: 'center'
      }}>
        <span style={{ color: '#C9A84C', fontSize: '0.85rem', fontWeight: '600', display: 'block' }}>
          ﴿ {randomAya} ﴾
        </span>
      </div>

      {/* 🌟 6. شريط التحميل بالنسبة المئوية */}
      <div style={{ width: '220px', position: 'relative' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#64748B',
          fontSize: '0.75rem',
          marginBottom: '6px'
        }}>
          <span>جاري التحميل...</span>
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

      {/* 🌟 7. التوقيع والإصدار */}
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
