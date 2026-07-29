/* src/components/SplashScreen.jsx */
import React, { useState, useEffect, useRef } from 'react';
import { FaBookOpen, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const QURAN_AYAT = [
  "وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ",
  "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
  "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
  "إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"
];

// 🎵 رابط صوت فتح الصفحة/النغمة الهادئة (يمكن استبداله بأي ملف mp3 لديك)
const SPLASH_AUDIO_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; 

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [randomAya, setRandomAya] = useState('');
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('splash_muted') === 'true');
  const audioRef = useRef(null);

  useEffect(() => {
    // اختيار آية عشوائية
    const selectedAya = QURAN_AYAT[Math.floor(Math.random() * QURAN_AYAT.length)];
    setRandomAya(selectedAya);

    // تشغيل الصوت إذا لم يكن مكتوماً
    if (!isMuted && audioRef.current) {
      audioRef.current.volume = 0.25; // صوت هادئ جداً 25%
      audioRef.current.play().catch(() => {
        // المتصفح قد يمنع التاب التلقائي بدون تفاعل سابق
        console.log("Autoplay prevented by browser policy");
      });
    }

    // محاكاة شريط التقدم 0% -> 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isMuted]);

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    localStorage.setItem('splash_muted', newMuteState);
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

      {/* 🎵 عنصر الصوت المخفي */}
      <audio ref={audioRef} src={SPLASH_AUDIO_URL} preload="auto" />

      {/* 🔊 زر التحكم في الصوت (كتم / تشغيل) أعلى الشاشة */}
      <button 
        onClick={toggleMute}
        title={isMuted ? "تفعيل الصوت" : "كتم الصوت"}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: isMuted ? '#64748B' : '#C9A84C',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </button>

      {/* 🌟 1. نمط إسلامي شفاف في الخلفية */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(rgba(201, 168, 76, 0.05) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
        opacity: 0.6,
        pointerEvents: 'none'
      }} />

      {/* 🌟 2. أيقونة الشعار مع التوهج والنبض */}
      <div style={{
        position: 'relative',
        width: '90px',
        height: '90px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 40px rgba(16, 185, 129, 0.35), 0 0 10px rgba(201, 168, 76, 0.2)',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        marginBottom: '24px',
        animation: 'pulseGlow 2.5s infinite ease-in-out'
      }}>
        <div style={{
          position: 'absolute',
          inset: '-6px',
          borderRadius: '28px',
          border: '2px solid transparent',
          borderTopColor: '#C9A84C',
          borderRightColor: '#C9A84C',
          animation: 'spin 3s linear infinite'
        }} />

        <FaBookOpen style={{ color: '#FCD34D', fontSize: '38px' }} />
      </div>

      {/* 🌟 3. اسم المنصة */}
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
        fontSize: '0.9rem',
        margin: '0 0 28px 0',
        fontWeight: '500'
      }}>
        المنصة الذكية لإدارة حلقات القرآن الكريم
      </p>

      {/* 🌟 4. الآية القرآنية */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '10px 20px',
        marginBottom: '35px',
        maxWidth: '320px',
        textAlign: 'center'
      }}>
        <span style={{ color: '#C9A84C', fontSize: '0.85rem', fontStyle: 'italic', display: 'block' }}>
          ﴿ {randomAya} ﴾
        </span>
      </div>

      {/* 🌟 5. شريط التحميل بالنسبة المئوية */}
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
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); boxShadow: 0 0 30px rgba(16, 185, 129, 0.3); }
          50% { transform: scale(1.04); boxShadow: 0 0 50px rgba(16, 185, 129, 0.5), 0 0 20px rgba(201, 168, 76, 0.4); }
        }
      `}</style>
    </div>
  );
      }
