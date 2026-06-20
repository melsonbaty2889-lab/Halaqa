import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // ⚜️ لوحة الألوان البصرية المعتمدة بدقة عالية
  const goldMain = '#E5C060';       // الذهبي المشرق للّوجو ومؤشر التحميل
  const goldMuted = '#A38238';      // الذهبي الخافت المخصص لنصوص التحميل
  const bgDarkGradient = '#060B11'; // الخلفية العميقة الداكنة جداً للمنصة
  const surfaceDark = '#0A0F18';

  // الحماية الاحترافية من وميض الخطوط (FOUT Protection) اعتماداً على خطوط النظام كبديل فوري
  const fontSuite = `'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

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
      
      {/* 🌟 حاوية الشعار الأصلي (القوس المفتوح والنقطة المركزية) */}
      <div style={{ 
        position: 'relative', 
        marginBottom: '40px', 
        animation: 'fadeInSplash 1s ease-out forwards',
        willChange: 'transform, opacity' // تسريع المعالجة الرسومية للشعار
      }}>
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="logoGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F1D385" />
              <stop offset="100%" stopColor="#B38F39" />
            </linearGradient>
          </defs>
          
          {/* القوس الذهبي المفتوح بدقة من زاوية الساعة 2 إلى الساعة 12 */}
          <path 
            d="M 75.5 24.5 A 36 36 0 1 1 50 14" 
            stroke="url(#logoGold)" 
            strokeWidth="5" 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* النقطة الذهبية المركزية المستقرة في المنتصف */}
          <circle cx="50" cy="50" r="5.5" fill="url(#logoGold)" />
        </svg>
      </div>

      {/* 📝 العناوين الرئيسية للمشروع (الحلقة الذكية) */}
      <h1 style={{ 
        margin: 0, 
        fontSize: '32px', 
        color: '#FFFFFF', 
        fontWeight: '700', 
        textAlign: 'center',
        letterSpacing: isRtl ? '0px' : '0.5px'
      }}>
        {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
      </h1>
      
      {/* النصوص الفرعية المعتمدة باللون الرمادي المزرق الهادئ */}
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
      
      {/* ⏳ شريط ومؤشر التحميل السفلي المطور وعالي الأداء */}
      <div style={{ marginTop: '70px', width: '240px' }}>
        <div style={{ 
          fontSize: '12.5px', 
          color: goldMuted, 
          textAlign: 'center', 
          marginBottom: '14px', 
          fontWeight: '500'
        }}>
          {isRtl ? 'جاري تحميل البيانات...' : 'Loading data...'}
        </div>
        
        {/* المجرى الخلفي الثابت للشريط */}
        <div style={{ 
          width: '100%', 
          height: '3px', 
          background: '#111622', 
          borderRadius: '10px', 
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* مؤشر التحميل الانسيابي المطور كلياً بتقنية العزل والتسريع الرسومي */}
          <div style={{ 
            position: 'absolute',
            top: 0,
            height: '100%', 
            width: '40%', // عرض كتلة التحميل المتحركة
            background: goldMain, 
            borderRadius: '10px',
            willChange: 'transform', // إجبار المتصفح على استخدام كارت الشاشة للحركة
            ...(isRtl 
              ? { right: 0, animation: 'smoothLoadRTL 2s infinite ease-in-out' } 
              : { left: 0, animation: 'smoothLoadLTR 2s infinite ease-in-out' }
            )
          }}></div>
        </div>
      </div>

      {/* حركات الـ CSS الاحترافية المبنية على الـ Transforms لتلافي الـ Lag كلياً */}
      <style>{`
        @keyframes fadeInSplash { 
          from { opacity: 0; transform: scale(0.97); } 
          to { opacity: 1; transform: scale(1); } 
        }
        /* حركة انسيابية مخصصة للواجهات الإنجليزية من اليسار لليمين */
        @keyframes smoothLoadLTR { 
          0% { transform: translateX(-100%); } 
          100% { transform: translateX(250%); } 
        }
        /* حركة انسيابية مخصصة للواجهات العربية من اليمين لليسار */
        @keyframes smoothLoadRTL { 
          0% { transform: translateX(100%); } 
          100% { transform: translateX(-250%); } 
        }
      `}</style>
    </div>
  );
}
