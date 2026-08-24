// src/components/InteractiveQuran.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Book, Search, Play, Pause, ChevronRight, ChevronLeft, 
  X, Check, BookOpen, UserCheck, Eye, EyeOff, Sparkles, Loader2, Globe, Languages, FileText
} from 'lucide-react';

const RECITERS = [
  { id: 'afs', name: 'مشاري العفاسي', name_en: 'Mishary Alafasy', rewaya: 'حفص عن عاصم', server: 'https://server8.mp3quran.net/afs/' },
  { id: 'hussary', name: 'محمود خليل الحصري', name_en: 'Mahmoud Al-Hussary', rewaya: 'حفص عن عاصم', server: 'https://server13.mp3quran.net/hssr/' },
  { id: 'hussary_teacher', name: 'محمود خليل الحصري (المعلم)', name_en: 'Al-Hussary (Teacher)', rewaya: 'حفص (المعلم)', server: 'https://server13.mp3quran.net/hssr/teacher/' },
  { id: 'hussary_warsh', name: 'محمود خليل الحصري', name_en: 'Al-Hussary (Warsh)', rewaya: 'ورش عن نافع', server: 'https://server13.mp3quran.net/hssr/warsh/' },
  { id: 'qalon', name: 'القالوني', name_en: 'Al-Qaloni', rewaya: 'قالون عن نافع', server: 'https://server13.mp3quran.net/qalon/' },
  { id: 'minsh', name: 'محمد صديق المنشاوي (مجود)', name_en: 'Minshawy (Mujawwad)', rewaya: 'حفص عن عاصم', server: 'https://server10.mp3quran.net/minsh/mjw/' },
  { id: 'dosari', name: 'ياسر الدوسري', name_en: 'Yasser Al-Dosari', rewaya: 'حفص عن عاصم', server: 'https://server11.mp3quran.net/yasser/' },
];

export default function InteractiveQuran() {
  const { t, i18n } = useTranslation();
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

  const cleanArabicText = (text) => {
    if (!text) return '';
    return text.replace(/([^\u0621-\u064A\u0660-\u0669\s])/g, '').replace(/(اِ|اَ|اُ|أ|إ|آ)/g, 'ا').trim();
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

  // جلب التفسير والترجمة عند تغيير السورة أو وضع العرض
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
      const surahNumStr = String(selectedSurah).padStart(3, '0');
      const url = `${selectedReciter.server}${surahNumStr}.mp3`;
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
    const cleanName = cleanArabicText(s.name);
    const query = cleanArabicText(searchSurahQuery);
    return cleanName.includes(query) || String(s.number).includes(query) || s.englishName.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-[#070B11] text-white p-2 md:p-4 rounded-2xl border border-white/10 shadow-2xl gap-4 select-none font-cairo" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 1️⃣ الشريط العلوي */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-dark-card p-3 md:p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="logo-icon-wrapper !w-10 !h-10 !m-0">
            <BookOpen className="w-5 h-5 text-brandEmerald" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-extrabold text-white leading-tight">
              {isRtl ? 'المصحف والتسميع التفاعلي' : 'Interactive Quran & Recitation'}
            </h2>
            <p className="text-[11px] text-[#94A3B8] font-normal">
              {isRtl ? 'تلاوات، روايات متعددة، تفسير، وترجمة فورية' : 'Recitations, Multiple Narrations, Tafsir & Translation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
          {/* زر وضع التسميع */}
          <button
            onClick={() => setRecitationMode(!recitationMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              recitationMode 
                ? 'bg-primary text-white border border-primary-hover shadow-lg' 
                : 'bg-[#162032] border border-[#1B2738] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{recitationMode ? (isRtl ? 'التسميع نشط' : 'Test Mode Active') : (isRtl ? 'اختبار التسميع' : 'Test Memory')}</span>
          </button>

          {/* زر السورة */}
          <button
            onClick={() => setShowSurahModal(true)}
            className="btn-secondary !w-auto !py-2 !px-3 !text-xs"
          >
            <Book className="w-3.5 h-3.5 text-brandEmerald" />
            <span className="truncate max-w-[110px]">
              {currentSurahObj ? (isRtl ? `سورة ${cleanArabicText(currentSurahObj.name)}` : currentSurahObj.englishName) : (isRtl ? 'اختر السورة' : 'Select Surah')}
            </span>
          </button>

          {/* زر القارئ والرواية */}
          <button
            onClick={() => setShowReciterModal(true)}
            className="btn-secondary !w-auto !py-2 !px-3 !text-xs text-primary"
          >
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            <span className="truncate max-w-[110px]">{isRtl ? selectedReciter.name : selectedReciter.name_en}</span>
          </button>

          {/* زر التشغيل */}
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isPlaying ? 'bg-primary text-white animate-pulse' : 'bg-brandEmerald-bg border border-brandEmerald-border text-brandEmerald'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? (isRtl ? 'إيقاف' : 'Pause') : (isRtl ? 'استماع' : 'Listen')}</span>
          </button>
        </div>
      </div>

      {/* 2️⃣ شريط التبديل السريع (المصحف / التفسير / الترجمة) */}
      <div className="flex items-center justify-center gap-2 bg-dark-card p-1.5 rounded-xl border border-white/10 w-fit mx-auto">
        <button
          onClick={() => setViewMode('quran')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
            viewMode === 'quran' ? 'bg-primary text-white' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isRtl ? 'الرسم العثماني' : 'Uthmani Text'}</span>
        </button>
        <button
          onClick={() => setViewMode('tafsir')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
            viewMode === 'tafsir' ? 'bg-primary text-white' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isRtl ? 'التفسير الميسر' : 'Tafsir'}</span>
        </button>
        <button
          onClick={() => setViewMode('translation')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
            viewMode === 'translation' ? 'bg-primary text-white' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isRtl ? 'الترجمة الإنجليزية' : 'English Translation'}</span>
        </button>
      </div>

      {/* 3️⃣ عرض الآيات والتفاصيل */}
      <div className="flex-1 card-surface p-4 md:p-8 overflow-y-auto min-h-[460px] flex flex-col items-center justify-start relative">
        {loading || loadingExtra ? (
          <div className="flex flex-col items-center justify-center my-auto gap-3 text-[#94A3B8]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-bold">{isRtl ? 'جاري تحميل المحتوى...' : 'Loading Content...'}</span>
          </div>
        ) : (
          <div className="max-w-3xl w-full text-center">
            <div className="mb-8 py-4 px-6 border-y border-white/10 bg-dark-input/60 rounded-xl">
              <h1 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">
                {isRtl ? `سورة ${cleanArabicText(surahDetail?.name)}` : surahDetail?.englishName}
              </h1>
              <div className="flex items-center justify-center gap-3 text-xs text-[#94A3B8]">
                <span>{isRtl ? 'النوع:' : 'Type:'} <strong className="text-brandEmerald">{surahDetail?.revelationType === 'Meccan' ? (isRtl ? 'مكيّة' : 'Meccan') : (isRtl ? 'مدنيّة' : 'Medinan')}</strong></span>
                <span>•</span>
                <span>{isRtl ? 'الآيات:' : 'Ayahs:'} <strong className="text-brandEmerald">{surahDetail?.numberOfAyahs}</strong></span>
              </div>

              {selectedSurah !== 9 && (
                <div className="text-xl md:text-2xl text-amber-100/90 mt-4 tracking-wide font-serif" style={{ fontFamily: "'Scheherazade New', serif" }}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              )}
            </div>

            {/* العرض الافتراضي: النص العثماني */}
            {viewMode === 'quran' && (
              <div className="text-justify text-white text-xl md:text-2xl leading-[2.6] font-serif" style={{ fontFamily: "'Scheherazade New', serif" }}>
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
                        className={`inline transition-all duration-200 ${
                          recitationMode ? 'cursor-pointer hover:bg-primary/20 p-1 rounded-md' : ''
                        } ${isHidden ? 'bg-white/10 text-transparent blur-sm select-none' : 'hover:text-primary'}`}
                      >
                        {cleanText}
                      </span>
                      <span className="inline-flex items-center justify-center mx-1.5 text-primary text-base font-serif select-none">
                        ﴿{ayah.numberInSurah}﴾
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* عرض التفسير أو الترجمة آية بآية */}
            {(viewMode === 'tafsir' || viewMode === 'translation') && (
              <div className="space-y-4 text-right">
                {surahDetail?.ayahs?.map((ayah, index) => {
                  const extraAyah = viewMode === 'tafsir' 
                    ? tafsirData[selectedSurah]?.[index] 
                    : translationData[selectedSurah]?.[index];

                  return (
                    <div key={ayah.number} className="bg-dark-input/40 p-4 rounded-xl border border-white/5 space-y-2">
                      <div className="text-lg text-primary font-serif" style={{ fontFamily: "'Scheherazade New', serif" }}>
                        {ayah.text} ﴿{ayah.numberInSurah}﴾
                      </div>
                      <div className="text-xs text-[#94A3B8] font-sans leading-relaxed border-t border-white/5 pt-2">
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

      {/* 4️⃣ شريط التنقل السفلي */}
      <div className="flex items-center justify-between bg-dark-card p-3 rounded-xl border border-white/10 text-xs">
        <button
          disabled={selectedSurah <= 1}
          onClick={() => setSelectedSurah((prev) => Math.max(1, prev - 1))}
          className="btn-secondary !w-auto !py-2 !px-3 disabled:opacity-30"
        >
          {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <span>{isRtl ? 'السورة السابقة' : 'Previous Surah'}</span>
        </button>

        <span className="text-[#94A3B8] font-bold">
          {selectedSurah} / 114
        </span>

        <button
          disabled={selectedSurah >= 114}
          onClick={() => setSelectedSurah((prev) => Math.min(114, prev + 1))}
          className="btn-secondary !w-auto !py-2 !px-3 disabled:opacity-30"
        >
          <span>{isRtl ? 'السورة التالية' : 'Next Surah'}</span>
          {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Modal السور */}
      {showSurahModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-surface w-full max-w-lg max-h-[80vh] flex flex-col !p-0 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Book className="w-4 h-4 text-brandEmerald" />
                <span>{isRtl ? 'فهرس سور القرآن الكريم' : 'Surah Index'}</span>
              </h3>
              <button onClick={() => setShowSurahModal(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-dark-input border-b border-white/10">
              <input
                type="text"
                placeholder={isRtl ? "ابحث باسم السورة أو رقمها..." : "Search Surah..."}
                value={searchSurahQuery}
                onChange={(e) => setSearchSurahQuery(e.target.value)}
                className="app-input text-xs"
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
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition text-right ${
                    surah.number === selectedSurah ? 'bg-primary/15 text-primary font-extrabold' : 'hover:bg-white/5 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-dark-input flex items-center justify-center text-xs font-bold text-brandEmerald">
                      {surah.number}
                    </span>
                    <span className="text-xs font-bold">{isRtl ? `سورة ${cleanArabicText(surah.name)}` : surah.englishName}</span>
                  </div>
                  {surah.number === selectedSurah && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal القراء والروايات */}
      {showReciterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-surface w-full max-w-lg max-h-[80vh] flex flex-col !p-0 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <span>{isRtl ? 'اختر القارئ والرواية' : 'Select Reciter & Narration'}</span>
              </h3>
              <button onClick={() => setShowReciterModal(false)} className="text-[#94A3B8] hover:text-white">
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
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-right transition ${
                    reciter.id === selectedReciter.id ? 'bg-primary/15 border-primary text-primary font-bold' : 'bg-dark-input border-white/5 text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{isRtl ? reciter.name : reciter.name_en}</div>
                    <div className="text-[10px] text-brandEmerald mt-0.5">{reciter.rewaya}</div>
                  </div>
                  {reciter.id === selectedReciter.id && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
