// src/components/UI/SplashScreen.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { toEngNums } from '@/utils/dateUtils';

export default function SplashScreen({ onFinish }) {
  const { t, i18n } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [selectedAyaObj, setSelectedAyaObj] = useState(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // 1. تحديد كود اللغة الأساسية المعتمدة (ar, en, tr, ur, id)
  const rawLang = i18n.resolvedLanguage || i18n.language || 'en';
  const currentLang = rawLang.split('-')[0].toLowerCase();
  
  // اللغات المكتوبة من اليمين لليسار (RTL)
  const isRtl = ['ar', 'ur'].includes(currentLang);

  // 2. قاموس النصوص الشامل لكافة اللغات المدعومة
  const translations = {
    ar: {
      title: "الحلقة الذكية",
      subtitle: "المنصة الذكية لإدارة حلقات القرآن الكريم",
      loading: "جاري التحميل...",
      skip: "تخطي"
    },
    en: {
      title: "Smart Halaqa",
      subtitle: "The Smart Platform for Quranic Circles",
      loading: "Loading system...",
      skip: "Skip"
    },
    tr: {
      title: "Akıllı Halaqa",
      subtitle: "Kur'an Halkaları Yönetim Platformu",
      loading: "Sistem yükleniyor...",
      skip: "Atla"
    },
    ur: {
      title: "اسمارٹ حلقہ",
      subtitle: "قرآنی حلقات کے لیے اسمارٹ پلیٹ فارم",
      loading: "لوڈ ہو رہا ہے...",
      skip: "چھوڑیں"
    },
    id: {
      title: "Halaqa Pintar",
      subtitle: "Platform Pintar untuk Halaqah Al-Qur'an",
      loading: "Memuat sistem...",
      skip: "Lewati"
    }
  };

  // 3. قاعدة بيانات الآيات والأحاديث المترجمة بجميع اللغات
  const quranData = [
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
    },
    {
      ar: "إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ",
      en: "Indeed, this Quran guides to that which is most suitable",
      tr: "Şüphesiz ki bu Kur'an en doğru yola iletir",
      ur: "بیشک یہ قرآن وہ راہ دکھاتا ہے جو بالکل سیدھی ہے",
      id: "Sungguh, Al-Qur'an ini memberi petunjuk ke jalan yang paling lurus"
    }
  ];

  // جلب النصوص الخاصة باللغة الحالية أو استخدام الإنجليزية كخيار احتياطي
  const currentT = translations[currentLang] || translations['en'];

  useEffect(() => {
    // اختيار آية عشوائية
    const randomAya = quranData[Math.floor(Math.random() * quranData.length)];
    setSelectedAyaObj(randomAya);

    // عداد التحميل الاحترافي السلس
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
  }, [currentLang]);

  // دالة الخروج بسلاسة
  const handleClose = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (typeof onFinish === 'function') onFinish();
    }, 350);
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden select-none bg-[var(--bg-dark,#070B11)] text-[var(--text-main,#FFFFFF)] transition-opacity duration-500 ease-out font-sans ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* زر التخطي المترجم والتموضع الديناميكي حسب اتجاه اللغة */}
      <button
        type="button"
        onClick={handleClose}
        className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} z-20 px-3.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-full text-xs text-slate-300 font-medium transition-all duration-200 backdrop-blur-md active:scale-95`}
      >
        {t('skip', currentT.skip)} ✕
      </button>

      {/* خلفية التوهج الزمردي */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 35%, var(--emerald-radial-glow, rgba(16, 185, 129, 0.12)) 0%, transparent 60%),
            radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 0)
          `,
          backgroundSize: '100% 100%, 28px 28px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm w-full">
        {/* الشعار */}
        <div className="mb-5 animate-pulse drop-shadow-[0_0_25px_var(--emerald-radial-glow,rgba(16,185,129,0.25))]">
          <SmartHalaqaProLogo size={90} />
        </div>

        {/* العنوان والوصف مترجمان تلقائياً */}
        <h1 className="text-2xl font-black text-[var(--text-main,#FFFFFF)] mb-1 tracking-tight">
          {t('app_name', currentT.title)}
        </h1>
        
        <p className="text-xs text-[var(--text-sub,#94A3B8)] mb-6 font-medium">
          {t('app_subtitle', currentT.subtitle)}
        </p>

        {/* بطاقة النص القرآني الشريف بالخط العربي وتحته ترجمة اللغة المختارة */}
        {selectedAyaObj && (
          <div className="bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md rounded-2xl px-5 py-3.5 mb-8 w-full shadow-xl flex flex-col gap-1.5">
            <span className="text-[var(--primary,#E07A00)] text-sm font-semibold block leading-relaxed dir-rtl">
              ﴿ {selectedAyaObj.ar} ﴾
            </span>
            {currentLang !== 'ar' && (
              <span className="text-[11px] text-slate-300 font-medium block opacity-85 border-t border-white/5 pt-1.5 leading-snug">
                "{selectedAyaObj[currentLang] || selectedAyaObj.en}"
              </span>
            )}
          </div>
        )}

        {/* شريط التحميل الموحد للأرقام والرموز */}
        <div className="w-60 relative">
          <div className="flex justify-between items-center text-[var(--text-sub,#94A3B8)] text-xs mb-2">
            <span className="font-medium">{t('loading', currentT.loading)}</span>
            <span className="text-emerald-400 font-mono font-bold">{toEngNums(progress)}%</span>
          </div>

          <div className="w-full h-1.5 bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--emerald-text, #10B981), var(--primary, #E07A00))'
              }}
            />
          </div>
        </div>
      </div>

      {/* الإصدار */}
      <div className="absolute bottom-6 text-[10px] text-[var(--text-muted,#475569)] tracking-widest font-mono">
        SMART HALAQA • v2.5
      </div>
    </div>
  );
}
