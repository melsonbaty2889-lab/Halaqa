import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { toEngNums } from '@/utils/dateUtils';
import C from '@/theme/colors';

const QURAN_DATA = [
  {
    ar: "وَفِي ذَلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ",
    en: "And for this let the competitors compete",
    tr: "Yarışanlar işte bunun için yarışsınlar",
    ur: "اور مقابلہ کرنے والوں کو اسی میں مقابلہ کرنا چاہیے",
    id: "Dan untuk yang demikian itu hendaknya orang berlomba-lomba"
  },
  {
    ar: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
    en: "And recite the Quran with measured recitation",
    tr: "Kur'an'ı tane tane, düşüne düşüne oku",
    ur: "اور قرآن کو ٹھہر ٹھہر کر پڑھو",
    id: "Dan bacalah Al-Qur'an itu dengan perlahan-lahan"
  },
  {
    ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    en: "The best among you are those who learn the Quran and teach it",
    tr: "Sizin en hayırlınız Kur'an'ı öğrenen ve öğretendir",
    ur: "تم میں سے بہترین شخص وہ ہے جو قرآن سیکھے اور سکھائے",
    id: "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya"
  }
];

export default function SplashScreen({ onFinish }) {
  const { t, i18n } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [selectedAyaObj, setSelectedAyaObj] = useState(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'ar').split('-')[0].toLowerCase();
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : ['ar', 'ur'].includes(currentLang);

  // استخراج ألوان الثيم الديناميكية من C
  const bgDark = C.dark?.bg || '#070B11';
  const textMain = C.text?.title || '#FFFFFF';
  const textSub = C.text?.sub || C.text?.muted || '#94A3B8';
  const primaryColor = C.amber?.DEFAULT || C.primary?.DEFAULT || '#E07A00';
  const emeraldColor = C.emerald?.text || C.emerald?.DEFAULT || '#10B981';
  const surfaceCard = C.dark?.surface || 'rgba(15, 23, 42, 0.85)';
  const borderCard = C.dark?.borderInput || C.dark?.border || 'rgba(255, 255, 255, 0.08)';

  const handleClose = useCallback(() => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (typeof onFinish === 'function') onFinish();
    }, 350);
  }, [isFadingOut, onFinish]);

  useEffect(() => {
    const randomAya = QURAN_DATA[Math.floor(Math.random() * QURAN_DATA.length)];
    setSelectedAyaObj(randomAya);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleClose();
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [handleClose]);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden select-none transition-opacity duration-500 ease-out font-sans ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: bgDark,
        color: textMain
      }}
    >
      {/* زر التخطي (Skip) */}
      <button
        type="button"
        onClick={handleClose}
        aria-label={t('splash.skip', 'تخطي')}
        className="absolute top-6 end-6 z-20 px-4 py-2 border rounded-full text-xs font-medium transition-all duration-200 backdrop-blur-md active:scale-95 min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer"
        style={{
          backgroundColor: `${surfaceCard}B3`,
          borderColor: borderCard,
          color: textSub
        }}
      >
        <span>{t('splash.skip', 'تخطي')}</span>
        <span aria-hidden="true">✕</span>
      </button>

      {/* خلفية التوهج الزمردي */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 35%, ${emeraldColor}1F 0%, transparent 60%),
            radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 0)
          `,
          backgroundSize: '100% 100%, 28px 28px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm w-full">
        {/* الشعار */}
        <div className="mb-5 animate-pulse drop-shadow-[0_0_25px_rgba(16,185,129,0.25)]">
          <SmartHalaqaProLogo size={90} />
        </div>

        {/* العنوان والوصف */}
        <h1 className="text-2xl font-black mb-1 tracking-tight" style={{ color: textMain }}>
          {t('splash.title', 'الحلقة الذكية')}
        </h1>
        
        <p className="text-xs mb-6 font-medium" style={{ color: textSub }}>
          {t('splash.subtitle', 'المنصة الذكية لإدارة حلقات القرآن الكريم')}
        </p>

        {/* بطاقة الآية والترجمة */}
        {selectedAyaObj && (
          <div 
            className="backdrop-blur-md rounded-2xl px-5 py-3.5 mb-8 w-full shadow-xl flex flex-col gap-1.5 border"
            style={{
              backgroundColor: surfaceCard,
              borderColor: borderCard
            }}
          >
            <span className="text-sm font-semibold block leading-relaxed dir-rtl" style={{ color: primaryColor }}>
              ﴿ {selectedAyaObj.ar} ﴾
            </span>
            {currentLang !== 'ar' && (
              <span 
                className="text-[11px] font-medium block opacity-85 border-t pt-1.5 leading-snug"
                style={{
                  color: textSub,
                  borderColor: borderCard
                }}
              >
                "{selectedAyaObj[currentLang] || selectedAyaObj.en}"
              </span>
            )}
          </div>
        )}

        {/* شريط التحميل */}
        <div 
          role="progressbar" 
          aria-valuenow={progress} 
          aria-valuemin={0} 
          aria-valuemax={100}
          aria-label={t('splash.loading', 'جاري التحميل...')}
          className="w-60 relative"
        >
          <div className="flex justify-between items-center text-xs mb-2" style={{ color: textSub }}>
            <span className="font-medium">{t('splash.loading', 'جاري التحميل...')}</span>
            <span className="font-mono font-bold" style={{ color: emeraldColor }}>
              {toEngNums(progress)}%
            </span>
          </div>

          <div 
            className="w-full h-1.5 border rounded-full overflow-hidden p-0.5"
            style={{
              backgroundColor: bgDark,
              borderColor: borderCard
            }}
          >
            <div 
              className="h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${emeraldColor}, ${primaryColor})`
              }}
            />
          </div>
        </div>
      </div>

      {/* الإصدار */}
      <div className="absolute bottom-6 text-[10px] tracking-widest font-mono" style={{ color: textSub }}>
        SMART HALAQA • v2.5
      </div>
    </div>
  );
}
