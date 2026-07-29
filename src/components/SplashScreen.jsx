import React from 'react';
import { useTranslation } from 'react-i18next';

// 🌟 شعار المنظومة الاحترافي (المعتمد في باقي التطبيق)
const SmartHalaqaProLogo = ({ size = 90 }) => (
  <div style={{ 
    width: `${size}px`, 
    height: `${size}px`, 
    borderRadius: '24px', 
    background: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)', 
    border: '1.5px solid rgba(45, 212, 191, 0.35)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    boxShadow: '0 8px 25px rgba(15, 118, 110, 0.4)', 
    flexShrink: 0 
  }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="12" stroke="url(#goldGrad)" strokeWidth="1.8" strokeDasharray="40 12" />
      <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
      <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
    </svg>
  </div>
);

export default function SplashScreen() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const goldMain = '#E5C060';
  const goldMuted = '#A38238';
  const bgDarkGradient = '#060B11';
  const surfaceDark = '#0A0F18';

  const fontSuite = `'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

  return (
    <div 
      role="progressbar"
      aria-busy="true"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at center, ${surfaceDark} 0%, ${bgDarkGradient} 100%)`,
        fontFamily: fontSuite,
        overflow: 'hidden',
        direction: isRtl ? 'rtl' : 'ltr',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      
      {/* 🌟 استدعاء الشعار الموحد */}
      <div style={{ 
        marginBottom: '35px', 
        animation: 'fadeInSplash 1s ease-out forwards',
        willChange: 'transform, opacity'
      }}>
        <SmartHalaqaProLogo size={96} />
      </div>

      {/* 📝 العناوين الرئيسية */}
      <h1 style={{ 
        margin: 0, 
        fontSize: '30px', 
        color: '#FFFFFF', 
        fontWeight: '700', 
        textAlign: 'center',
        letterSpacing: isRtl ? '0px' : '0.5px'
      }}>
        {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
      </h1>
      
      <p style={{ 
        margin: '12px 0 0 0', 
        fontSize: '14px', 
        color: '#64748B', 
        fontWeight: '400', 
        textAlign: 'center',
        letterSpacing: isRtl ? '0px' : '0.5px',
        maxWidth: '85%',
        lineHeight: '1.5'
      }}>
        {isRtl ? 'المنصة الذكية لإدارة حلقات القرآن الكريم' : 'Advanced Platform for Quranic Circles'}
      </p>
      
      {/* ⏳ شريط التحميل */}
      <div style={{ marginTop: '60px', width: '220px' }}>
        <div style={{ 
          fontSize: '12.5px', 
          color: goldMuted, 
          textAlign: 'center', 
          marginBottom: '12px', 
          fontWeight: '500'
        }}>
          {isRtl ? 'جاري تحميل البيانات...' : 'Loading data...'}
        </div>
        
        <div style={{ 
          width: '100%', 
          height: '3px', 
          background: '#111622', 
          borderRadius: '10px', 
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ 
            position: 'absolute',
            top: 0,
            height: '100%', 
            width: '40%', 
            background: goldMain, 
            borderRadius: '10px',
            willChange: 'transform',
            ...(isRtl 
              ? { right: 0, animation: 'smoothLoadRTL 2s infinite ease-in-out' } 
              : { left: 0, animation: 'smoothLoadLTR 2s infinite ease-in-out' }
            )
          }}></div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInSplash { 
          from { opacity: 0; transform: scale(0.92); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes smoothLoadLTR { 
          0% { transform: translateX(-100%); } 
          100% { transform: translateX(250%); } 
        }
        @keyframes smoothLoadRTL { 
          0% { transform: translateX(100%); } 
          100% { transform: translateX(-250%); } 
        }
      `}</style>
    </div>
  );
}
