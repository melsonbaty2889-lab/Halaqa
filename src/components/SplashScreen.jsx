export default function SplashScreen() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: '#fbbf24'
    }}>
      {/* أيقونة تعبر عن الشعار */}
      <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>✨</div>
      <h1 style={{ margin: 0, fontSize: '24px' }}>الحلقة الذكية</h1>
      
      {/* حركة تحميل ناعمة */}
      <div style={{ marginTop: '20px', width: '40px', height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: '50%', height: '100%', background: '#fbbf24', animation: 'load 1s infinite' }}></div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes load { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      `}</style>
    </div>
  );
}
