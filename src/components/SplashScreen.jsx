export default function SplashScreen() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: '#fbbf24',
      fontFamily: "'Cairo', sans-serif"
    }}>
      {/* الشعار الهندسي الخاص بك */}
      <div style={{ marginBottom: '30px', animation: 'fadeIn 1s ease-in-out' }}>
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="#fbbf24" strokeWidth="8" fill="none" strokeLinecap="round"/>
          <path d="M50 10 A40 40 0 1 0 85 25" stroke="#fbbf24" strokeWidth="8" fill="none" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="8" fill="#fbbf24"/>
        </svg>
      </div>

      <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px' }}>الحلقة الذكية</h1>
      
      {/* شريط تحميل بسيط */}
      <div style={{ marginTop: '40px', width: '150px', height: '3px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: '40%', height: '100%', background: '#fbbf24', animation: 'load 1.5s infinite ease-in-out' }}></div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes load { 0% { transform: translateX(-150%); } 100% { transform: translateX(250%); } }
      `}</style>
    </div>
  );
}
