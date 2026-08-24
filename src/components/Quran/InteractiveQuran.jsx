// src/components/InteractiveQuran.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Book, Play, Pause, ChevronRight, ChevronLeft, 
  X, Check, BookOpen, UserCheck, Sparkles, Loader2, Globe, FileText 
} from 'lucide-react';

// قائمة القراء الأكثر انتشاراً وتنوعاً في العالم الإسلامي (سيرفرات EveryAyah المعتمدة)
const RECITERS = [
  // 1️⃣ رواية حفص عن عاصم
  { id: 'afs_hafss', name: 'مشاري العفاسي', name_en: 'Mishary Alafasy', rewaya: 'حفص عن عاصم', folder: 'Alafasy_128kbps' },
  { id: 'hussary_hafss', name: 'محمود خليل الحصري', name_en: 'Mahmoud Al-Hussary', rewaya: 'حفص عن عاصم', folder: 'Husary_128kbps' },
  { id: 'minsh_hafss', name: 'محمد صديق المنشاوي (مجود)', name_en: 'Minshawy (Mujawwad)', rewaya: 'حفص عن عاصم', folder: 'Minshawy_Mujawwad_192kbps' },
  { id: 'dosari_hafss', name: 'ياسر الدوسري', name_en: 'Yasser Al-Dosari', rewaya: 'حفص عن عاصم', folder: 'Yasser_Ad-Dussary_128kbps' },
  { id: 'basfar_hafss', name: 'عبد الله بصفر', name_en: 'Abdullah Basfar', rewaya: 'حفص عن عاصم', folder: 'Abdullah_Basfar_192kbps' },
  
  // 2️⃣ رواية ورش عن نافع (دول المغرب العربي)
  { id: 'yassin_warsh', name: 'ياسين الجزائري', name_en: 'Yassin Al-Jazairi', rewaya: 'ورش عن نافع', folder: 'Yassin_Al_Jazairi_64kbps' },
  { id: 'kouchi_warsh', name: 'مصطفى الغربي', name_en: 'Mustafa Al-Gharbi', rewaya: 'ورش عن نافع', folder: 'Mustafa_Ismail_192kbps' },

  // 3️⃣ رواية قالون عن نافع (ليبيا وتونس)
  { id: 'qali_qalon', name: 'محمود خليل الحصري (قالون)', name_en: 'Al-Hussary (Qalon)', rewaya: 'قالون عن نافع', folder: 'Husary_Qasr_64kbps' },
  { id: 'hudhaify_qalon', name: 'علي الحذيفي (قالون)', name_en: 'Al-Hudhaify (Qalon)', rewaya: 'قالون عن نافع', folder: 'Hudhaify_32kbps' },

  // 4️⃣ المصحف المعلم
  { id: 'hussary_teacher', name: 'محمود خليل الحصري (المعلم)', name_en: 'Al-Hussary (Teacher)', rewaya: 'حفص (معلم)', folder: 'Hussary_Teacher_128kbps' }
];

// دالة تحويل الأرقام إلى الأرقام العربية المشرقية
const toArabicIndic = (num) => {
  return String(num).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
};

export default function InteractiveQuran() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [surahsList, setSurahsList] = useState([]);
  const [surahDetail, setSurahDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // الخيارات الإضافية للمرحلة الحالية
  const [viewMode, setViewMode] = useState('quran'); // 'quran' | 'tafsir' | 'translation'
  const [tafsirData, setTafsirData] = useState({});
  const [translationData, setTranslationData] = useState({});
  const [loadingExtra, setLoadingExtra] = useState(false);

  // وضع اختبار التسميع
  const [recitationMode, setRecitationMode] = useState(false);
  const [hiddenAyahs, setHiddenAyahs] = useState({});

  // Modals & Audio
  const [showSurahModal, setShowSurahModal] = useState(false);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [searchSurahQuery, setSearchSurahQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // تحميل خط Amiri Quran المخصص للقرآن الكريم ديناميكياً
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // تنظيف اسم السورة ومنع تكرار كلمة "سورة"
  const formatSurahName = (name) => {
    if (!name) return '';
    let cleaned = name.replace(/([^\u0621-\u064A\u0660-\u0669\s])/g, '').replace(/(اِ|اَ|اُ|أ|إ|آ)/g, 'ا').trim();
    cleaned = cleaned.replace(/^سورة\s+/, '');
    return isRtl ? `سورة ${cleaned}` : cleaned;
  };

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) setSurahsList(data.data);
      })
      .catch((err) => console.error('Error fetching surahs:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    stopAudio();
    setHiddenAyahs({});

    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) setSurahDetail(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching ayahs:', err);
        setLoading(false);
      });
  }, [selectedSurah]);

  useEffect(() => {
    if (viewMode === 'tafsir' && !tafsirData[selectedSurah]) {
      setLoadingExtra(true);
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/ar.jalalayn`)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 200) {
            setTafsirData((prev) => ({ ...prev, [selectedSurah]: data.data.ayahs }));
          }
          setLoadingExtra(false);
        });
    } else if (viewMode === 'translation' && !translationData[selectedSurah]) {
      setLoadingExtra(true);
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/en.sahih`)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 200) {
            setTranslationData((prev) => ({ ...prev, [selectedSurah]: data.data.ayahs }));
          }
          setLoadingExtra(false);
        });
    }
  }, [viewMode, selectedSurah]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      const surahStr = String(selectedSurah).padStart(3, '0');
      const url = `https://everyayah.com/data/${selectedReciter.folder}/${surahStr}001.mp3`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => stopAudio();
    }
  };

  const toggleAyahVisibility = (ayahNum) => {
    if (!recitationMode) return;
    setHiddenAyahs((prev) => ({ ...prev, [ayahNum]: !prev[ayahNum] }));
  };

  const currentSurahObj = surahsList.find((s) => s.number === selectedSurah);
  const filteredSurahs = surahsList.filter((s) => {
    const formatted = formatSurahName(s.name);
    const query = searchSurahQuery.trim().toLowerCase();
    return formatted.toLowerCase().includes(query) || String(s.number).includes(query) || s.englishName.toLowerCase().includes(query);
  });

  return (
    <div className="flex flex-col h-full bg-[#070B11] text-white p-3 md:p-6 rounded-3xl border border-white/10 shadow-2xl gap-5 font-cairo max-w-5xl mx-auto" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 1️⃣ الهيدر الرئيسي وتجربة التحكم */}
      <div className="bg-[#0F172A]/80 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white tracking-wide">
                {isRtl ? 'المصحف والتسميع التفاعلي' : 'Interactive Quran & Recitation'}
              </h1>
              <p className="text-xs text-slate-400 font-normal">
                {isRtl ? 'تلاوات، روايات متعددة، تفسير، وترجمة فورية' : 'Recitations, Narrations, Tafsir & Translation'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setRecitationMode(!recitationMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              recitationMode 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10' 
                : 'bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{recitationMode ? (isRtl ? 'وضع التسميع نشط' : 'Test Mode Active') : (isRtl ? 'اختبار التسميع' : 'Test Memory')}</span>
          </button>
        </div>

        {/* أدوات السورة وقارئ الصوت */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-white/5">
          <button
            onClick={() => setShowSurahModal(true)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-200 hover:border-slate-500 transition cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Book className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{currentSurahObj ? formatSurahName(currentSurahObj.name) : (isRtl ? 'اختر السورة' : 'Select Surah')}</span>
            </span>
            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => setShowReciterModal(true)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-200 hover:border-slate-500 transition cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{isRtl ? selectedReciter.name : selectedReciter.name_en}</span>
            </span>
            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={toggleAudio}
            className={`col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isPlaying 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 animate-pulse' 
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? (isRtl ? 'إيقاف التلاوة' : 'Pause Audio') : (isRtl ? 'تشغيل التلاوة' : 'Play Audio')}</span>
          </button>
        </div>
      </div>

      {/* 2️⃣ تبويب العرض */}
      <div className="flex items-center justify-center p-1 bg-[#0F172A]/90 rounded-2xl border border-white/10 w-full max-w-md mx-auto">
        <button
          onClick={() => setViewMode('quran')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
            viewMode === 'quran' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isRtl ? 'الرسم العثماني' : 'Uthmani Text'}</span>
        </button>
        <button
          onClick={() => setViewMode('tafsir')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
            viewMode === 'tafsir' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isRtl ? 'التفسير الميسر' : 'Tafsir'}</span>
        </button>
        <button
          onClick={() => setViewMode('translation')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
            viewMode === 'translation' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isRtl ? 'الترجمة' : 'Translation'}</span>
        </button>
      </div>

      {/* 3️⃣ لوحة عرض الآيات */}
      <div className="flex-1 bg-[#0B132B]/60 rounded-3xl border border-white/10 p-5 md:p-8 overflow-y-auto min-h-[480px] flex flex-col items-center">
        {loading || loadingExtra ? (
          <div className="flex flex-col items-center justify-center my-auto gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-semibold">{isRtl ? 'جاري التحميل...' : 'Loading Content...'}</span>
          </div>
        ) : (
          <div className="max-w-3xl w-full">
            {/* عنوان السورة والمعلومات */}
            <div className="text-center pb-6 mb-6 border-b border-white/10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-amber-400 mb-2">
                {formatSurahName(surahDetail?.name)}
              </h2>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
                <span>{isRtl ? 'النوع:' : 'Type:'} <strong className="text-emerald-400">{surahDetail?.revelationType === 'Meccan' ? (isRtl ? 'مكيّة' : 'Meccan') : (isRtl ? 'مدنيّة' : 'Medinan')}</strong></span>
                <span>•</span>
                <span>{isRtl ? 'عدد الآيات:' : 'Ayahs:'} <strong className="text-emerald-400">{toArabicIndic(surahDetail?.numberOfAyahs)}</strong></span>
              </div>

              {selectedSurah !== 9 && (
                <div className="text-2xl md:text-3xl text-amber-100/90 mt-5 tracking-widest" style={{ fontFamily: "'Amiri Quran', serif" }}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              )}
            </div>

            {/* الرسم العثماني بخط Amiri Quran وزخرفة الأرقام */}
            {viewMode === 'quran' && (
              <div className="text-justify text-slate-100 text-2xl md:text-3xl leading-[2.8] tracking-wide" style={{ fontFamily: "'Amiri Quran', serif" }}>
                {surahDetail?.ayahs?.map((ayah) => {
                  let cleanText = ayah.text;
                  if (ayah.numberInSurah === 1 && selectedSurah !== 1 && selectedSurah !== 9) {
                    cleanText = cleanText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s?/, '');
                  }
                  const isHidden = hiddenAyahs[ayah.numberInSurah];

                  return (
                    <React.Fragment key={ayah.number}>
                      <span 
                        onClick={() => toggleAyahVisibility(ayah.numberInSurah)}
                        className={`inline transition-all duration-200 rounded px-1 ${
                          recitationMode ? 'cursor-pointer hover:bg-amber-500/20' : ''
                        } ${isHidden ? 'bg-slate-800 text-transparent blur-md select-none' : 'hover:text-amber-300'}`}
                      >
                        {cleanText}
                      </span>
                      <span className="inline-flex items-center justify-center mx-1.5 text-amber-400 text-xl select-none">
                        ﴿{toArabicIndic(ayah.numberInSurah)}﴾
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* التفسير والترجمة المتزامنة */}
            {(viewMode === 'tafsir' || viewMode === 'translation') && (
              <div className="space-y-4">
                {surahDetail?.ayahs?.map((ayah, index) => {
                  const extraAyah = viewMode === 'tafsir' 
                    ? tafsirData[selectedSurah]?.[index] 
                    : translationData[selectedSurah]?.[index];

                  return (
                    <div key={ayah.number} className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                      <div className="text-xl text-amber-300 text-right leading-relaxed" style={{ fontFamily: "'Amiri Quran', serif" }}>
                        {ayah.text} <span className="text-amber-500 text-sm">﴿{toArabicIndic(ayah.numberInSurah)}﴾</span>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/5 font-sans">
                        {extraAyah ? extraAyah.text : '...'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4️⃣ التنقل بين السور */}
      <div className="flex items-center justify-between bg-[#0F172A]/80 p-3 rounded-2xl border border-white/10 text-xs">
        <button
          disabled={selectedSurah <= 1}
          onClick={() => setSelectedSurah((prev) => Math.max(1, prev - 1))}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
        >
          <ChevronRight className={`w-4 h-4 ${!isRtl ? 'rotate-180' : ''}`} />
          <span>{isRtl ? 'السورة السابقة' : 'Previous'}</span>
        </button>

        <span className="text-slate-400 font-bold">
          {toArabicIndic(selectedSurah)} / {toArabicIndic(114)}
        </span>

        <button
          disabled={selectedSurah >= 114}
          onClick={() => setSelectedSurah((prev) => Math.min(114, prev + 1))}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
        >
          <span>{isRtl ? 'السورة التالية' : 'Next'}</span>
          <ChevronLeft className={`w-4 h-4 ${!isRtl ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Modal السور */}
      {showSurahModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-md max-h-[80vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Book className="w-4 h-4 text-emerald-400" />
                <span>{isRtl ? 'فهرس السور' : 'Surah List'}</span>
              </h3>
              <button onClick={() => setShowSurahModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-900 border-b border-white/10">
              <input
                type="text"
                placeholder={isRtl ? "ابحث عن سورة..." : "Search Surah..."}
                value={searchSurahQuery}
                onChange={(e) => setSearchSurahQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    setSelectedSurah(surah.number);
                    setShowSurahModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition text-right cursor-pointer ${
                    surah.number === selectedSurah ? 'bg-emerald-500/15 text-emerald-400 font-bold' : 'hover:bg-white/5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400">
                      {toArabicIndic(surah.number)}
                    </span>
                    <span className="text-xs font-bold">{formatSurahName(surah.name)}</span>
                  </div>
                  {surah.number === selectedSurah && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal القراء والروايات */}
      {showReciterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-md max-h-[80vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>{isRtl ? 'اختر القارئ والرواية' : 'Select Reciter'}</span>
              </h3>
              <button onClick={() => setShowReciterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {RECITERS.map((reciter) => (
                <button
                  key={reciter.id}
                  onClick={() => {
                    setSelectedReciter(reciter);
                    setShowReciterModal(false);
                    stopAudio();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-right transition cursor-pointer ${
                    reciter.id === selectedReciter.id ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-900 border-white/5 text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{isRtl ? reciter.name : reciter.name_en}</div>
                    <div className="text-[10px] text-emerald-400 font-medium mt-0.5">📖 {reciter.rewaya}</div>
                  </div>
                  {reciter.id === selectedReciter.id && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
