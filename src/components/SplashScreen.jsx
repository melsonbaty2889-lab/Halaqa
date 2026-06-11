import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const { t } = useTranslation();

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
      fontFamily: "'Cairo', sans-serif",
      overflow: 'hidden'
    }}>
      {/* حاوية الشعار مع تأثير التوهج */}
      <div style={{ 
        position: 'relative', 
        marginBottom: '30px', 
        animation: 'fadeIn 1s ease-in-out' 
      }}>
        <div style={{
          position: 'absolute',
          top: '10%', left: '10%', width: '80%', height: '80%',
          background: '#fbbf24',
          filter: 'blur(50px)',
          opacity: 0.2,
          borderRadius: '50%'
        }}></div>
        
        <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative' }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="40" stroke="url(#goldGradient)" strokeWidth="8" fill="none" />
          <path d="M50 10 A40 40 0 1 0 85 25" stroke="url(#goldGradient)" strokeWidth="8" fill="none" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="8" fill="url(#goldGradient)" />
        </svg>
      </div>

      {/* النصوص الترحيبية */}
      <h1 style={{ margin: 0, fontSize: '26px', color: '#f8fafc', fontWeight: '800', letterSpacing: '1px' }}>
        الحلقة الذكية
      </h1>
      <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#94a3b8', letterSpacing: '2px' }}>
        SMART HALAQA
      </p>
      
      {/* شريط التحميل */}
      <div style={{ marginTop: '50px', width: '200px' }}>
        <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase' }}>
          {t('loading_data') || 'System Initializing...'}
        </div>
        <div style={{ width: '100%', height: '3px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            background: 'linear-gradient(90deg, #fbbf24, #d97706)', 
            animation: 'load 1.5s infinite ease-in-out' 
          }}></div>
        </div>
      </div>

      {/* الحركات (Animations) */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes load { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
      `}</style>
    </div>
  );
}
