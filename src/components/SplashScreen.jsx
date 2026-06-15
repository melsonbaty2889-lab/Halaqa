import { useTranslation } from 'react-i18next';
import { C } from '../constants/colors';

export default function SplashScreen() {
  const { t, i18n } = useTranslation();
  
  // 📐 التحقق من اتجاه ولغة التطبيق الحالية لمزامنة الحركات البصرية
  const isRtl = i18n.language === 'ar';

  // استخراج الثوابت اللونية الموحدة لنظامك مع توفير بدائل أمان (Fallbacks)
  const goldColor = C?.gold || '#C9A84C';
  const bgColor = '#0C1520'; // اللون المعتمد في index.css لضمان انتقال سلس بدون وميض
  const surfaceColor = C?.surface || '#111C2A';

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `radial-gradient(circle at center, ${surfaceColor} 0%, ${bgColor} 100%)`,
      fontFamily: "'Cairo', sans-serif",
      overflow: 'hidden',
      direction: isRtl ? 'rtl' : 'ltr'
    }}>
      
      {/* 🌟 حاوية الشعار المطور بتأثير التوهج الذهبي الموحد */}
      <div style={{ 
        position: 'relative', 
        marginBottom: '30px', 
        animation: 'fadeIn 1s ease-in-out' 
      }}>
        {/* هالة التوهج الخلفي الخلفية المحسنة */}
        <div style={{
          position: 'absolute',
          top: '10%', left: '10%', width: '80%', height: '80%',
          background: goldColor,
          filter: 'blur(45px)',
          opacity: 0.15,
          borderRadius: '50%'
        }}></div>
        
        {/* رسم الـ SVG الخاص بك بعد دمج تدفق الألوان الذهبية الملكية للأكاديمية */}
        <svg width="125" height="125" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative' }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={goldColor} />
              <stop offset="100%" stopColor="#967B33" /> {/* عمق لوني فخم للذهبي */}
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="40" stroke="url(#goldGradient)" strokeWidth="7" fill="none" opacity="0.15" />
          <path d="M50 10 A40 40 0 1 0 85 25" stroke="url(#goldGradient)" strokeWidth="7" fill="none" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="8" fill="url(#goldGradient)" />
        </svg>
      </div>

      {/* 📝 النصوص الترحيبية الثنائية المتجاوبة مع وضع اللغة الفعال */}
      <h1 style={{ margin: 0, fontSize: '26px', color: '#f8fafc', fontWeight: '800', letterSpacing: isRtl ? '0px' : '1px' }}>
        {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
      </h1>
      <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: goldColor, fontWeight: '600', letterSpacing: '2px' }}>
        {isRtl ? 'نظام إدارة حلقات تحفيظ القرآن الكريم' : 'SMART HALAQA MANAGEMENT SYSTEM'}
      </p>
      
      {/* ⏳ شريط التحميل الانسيابي ذو الاتجاه الديناميكي */}
      <div style={{ marginTop: '50px', width: '210px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginBottom: '10px', fontWeight: '500' }}>
          {/* قراءة مباشرة من ملف i18n.js الخاص بك لترجمة كلمة "جاري تحميل البيانات..." */}
          {t('loading') || (isRtl ? 'جاري تهيئة النظام...' : 'Initializing System...')}
        </div>
        <div style={{ width: '100%', height: '4px', background: '#162030', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ 
            height: '100%', 
            background: `linear-gradient(90deg, ${goldColor}, #967B33)`, 
            animation: 'load 1.6s infinite ease-in-out' 
          }}></div>
        </div>
      </div>

      {/* 🪄 حقن الحركات التفاعلية المتوافقة هندسياً مع اللغتين */}
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: scale(0.9); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes load { 
          0% { width: 0%; margin-left: 0%; margin-right: 0%; } 
          50% { width: 65%; ${isRtl ? 'margin-right: 20%' : 'margin-left: 20%'}; } 
          100% { width: 0%; ${isRtl ? 'margin-right: 100%' : 'margin-left: 100%'}; } 
        }
      `}</style>
    </div>
  );
}
