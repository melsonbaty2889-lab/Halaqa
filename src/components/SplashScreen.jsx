import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // ⚜️ لوحة الألوان الملكية الجديدة للمنصة
  const goldLight = '#E5C060'; // ذهبي مشرق متوهج
  const goldDark = '#B38F39';  // ذهبي عميق كلاسيكي
  const bgDeep = '#060B11';    // كحلي ليلي شديد العتمة لفخامة التباين
  const surfaceDark = '#101721';

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `radial-gradient(circle at center, ${surfaceDark} 0%, ${bgDeep} 100%)`,
      fontFamily: "'Cairo', sans-serif",
      overflow: 'hidden',
      direction: isRtl ? 'rtl' : 'ltr'
    }}>
      
      {/* 🌟 حاوية الشعار المطور بتأثير التوهج السينمائي */}
      <div style={{ 
        position: 'relative', 
        marginBottom: '25px', 
        animation: 'fadeInSplash 1.2s cubic-bezier(0.4, 0, 0.2, 1)' 
      }}>
        {/* هالة الضوء الخلفية الخافتة */}
        <div style={{
          position: 'absolute',
          top: '15%', left: '15%', width: '70%', height: '70%',
          background: goldLight,
          filter: 'blur(40px)',
          opacity: 0.12,
          borderRadius: '50%'
        }}></div>
        
        {/* الـ SVG المحسن بخطوط أنعم وأكثر فخامة */}
        <svg width="110" height="110" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative' }}>
          <defs>
            <linearGradient id="premiumGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={goldLight} />
              <stop offset="100%" stopColor={goldDark} />
            </linearGradient>
          </defs>
          {/* دائرة خلفية ناعمة جداً تضفي عمقاً دلالياً */}
          <circle cx="50" cy="50" r="42" stroke="url(#premiumGold)" strokeWidth="4" fill="none" opacity="0.08" />
          {/* المسار الأساسي المحسن بسمك خط أنيق (strokeWidth=5 بدلاً من 8) */}
          <path d="M50 12 A38 38 0 1 0 83 27" stroke="url(#premiumGold)" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="7" fill="url(#premiumGold)" />
        </svg>
      </div>

      {/* 📝 العبارات والنصوص المصقولة */}
      <h1 style={{ 
        margin: 0, 
        fontSize: '28px', 
        color: '#FFFFFF', 
        fontWeight: '700', 
        letterSpacing: isRtl ? '0px' : '0.5px',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
      }}>
        {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
      </h1>
      
      {/* العبارة الدلالية الفخمة البديلة للتكرار الإنجليزي */}
      <p style={{ 
        margin: '8px 0 0 0', 
        fontSize: '12px', 
        color: '#94A3B8', 
        fontWeight: '400', 
        letterSpacing: isRtl ? '0px' : '1px',
        opacity: 0.85
      }}>
        {isRtl ? 'المنصة الذكية لإدارة حلقات القرآن الكريم' : 'Advanced Platform for Quranic Circles'}
      </p>
      
      {/* ⏳ شريط مؤشر التحميل الانسيابي المتناسق */}
      <div style={{ marginTop: '55px', width: '180px' }}>
        <div style={{ 
          fontSize: '11px', 
          color: goldLight, 
          textAlign: 'center', 
          marginBottom: '10px', 
          fontWeight: '500',
          letterSpacing: isRtl ? '0px' : '1px',
          opacity: 0.9
        }}>
          {t('loading') || (isRtl ? 'جاري تهيئة النظام...' : 'Initializing System...')}
        </div>
        <div style={{ width: '100%', height: '3px', background: '#151E2B', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            background: `linear-gradient(90deg, ${goldLight}, ${goldDark})`, 
            animation: 'loadPremium 1.8s infinite ease-in-out' 
          }}></div>
        </div>
      </div>

      {/* حركات الـ CSS السينمائية */}
      <style>{`
        @keyframes fadeInSplash { 
          from { opacity: 0; transform: scale(0.94) translateY(5px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        @keyframes loadPremium { 
          0% { width: 0%; ${isRtl ? 'margin-right: 0%' : 'margin-left: 0%'}; } 
          50% { width: 70%; ${isRtl ? 'margin-right: 15%' : 'margin-left: 15%'}; } 
          100% { width: 0%; ${isRtl ? 'margin-right: 100%' : 'margin-left: 100%'}; } 
        }
      `}</style>
    </div>
  );
}
