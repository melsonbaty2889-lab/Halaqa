import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Search, Play, Pause, ChevronRight, ChevronLeft, 
  Volume2, X, Check, BookOpen, Layers 
} from 'lucide-react';
import { QURAAN_READINGS } from '@/config/memorizationSystems';

export default function InteractiveQuran({ isRtl = true }) {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedRewaya, setSelectedRewaya] = useState('hafs');
  const [surahsList, setSurahsList] = useState([]);
  const [surahDetail, setSurahDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // التحكم في النوافذ المنبثقة للانتخاب (Modals)
  const [showSurahModal, setShowSurahModal] = useState(false);
  const [showRewayaModal, setShowRewayaModal] = useState(false);
  const [searchSurahQuery, setSearchSurahQuery] = useState('');

  // التحكم في الصوت
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const audioRef = useRef(null);

  // جلب قائمة السور
  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) setSurahsList(data.data);
      })
      .catch((err) => console.error('Error fetching surahs:', err));
  }, []);

  // جلب تفاصيل السورة والتلاوة
  useEffect(() => {
    setLoading(true);
    setIsPlaying(false);
    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/ar.alafasy`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setSurahDetail(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching ayahs:', err);
        setLoading(false);
      });
  }, [selectedSurah]);

  // تشغيل/إيقاف الصوت
  const toggleAudio = () => {
    if (!audioRef.current) {
      // رابط صوت السورة كاملة بصوت المشاري
      const surahNumStr = String(selectedSurah).padStart(3, '0');
      const url = `https://server8.mp3quran.net/afs/${surahNumStr}.mp3`;
      setCurrentAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    } else {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // إيقاف الصوت عند تغيير السورة
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [selectedSurah]);

  const currentSurahObj = surahsList.find(s => s.number === selectedSurah);
  const currentRewayaObj = QURAAN_READINGS.find(r => r.id === selectedRewaya);

  const filteredSurahs = surahsList.filter(s => 
    s.name.includes(searchSurahQuery) || 
    s.englishName.toLowerCase().includes(searchSurahQuery.toLowerCase()) ||
    String(s.number).includes(searchSurahQuery)
  );

  return (
    <>
      {/* تضمين خط المصحف العثماني الشريف عبر Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
        
        .quran-font {
          font-family: 'Amiri Quran', 'Amiri', serif;
          word-spacing: 2px;
        }
        .quran-title-font {
          font-family: 'Amiri', serif;
        }
      `}</style>

      <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-100 p-3 md:p-6 rounded-2xl border border-slate-800/80 shadow-2xl gap-4 select-none">
        
        {/* الشريط العلوي الفاخر للتحكم */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-3 md:p-4 rounded-xl border border-amber-500/20 shadow-lg">
          
          {/* عنوان الهيدر */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">المصحف التفاعلي الشريف</h2>
              <p className="text-xs text-amber-400/80 font-medium">الرسم العثماني والروايات المتواترة</p>
            </div>
          </div>

          {/* أزرار اختيار السورة والرواية والمشغل الصوتي */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
            
            {/* زر اختيار السورة */}
            <button
              onClick={() => setShowSurahModal(true)}
              className="flex items-center justify-between gap-2 bg-[#1f293d] hover:bg-[#28354d] border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 transition cursor-pointer flex-1 md:flex-none"
            >
              <div className="flex items-center gap-1.5">
                <Book size={15} className="text-emerald-400" />
                <span>{currentSurahObj ? `${currentSurahObj.number}. ${currentSurahObj.name}` : 'اختر السورة'}</span>
              </div>
              <ChevronLeft size={14} className="text-slate-400" />
            </button>

            {/* زر اختيار الرواية */}
            <button
              onClick={() => setShowRewayaModal(true)}
              className="flex items-center justify-between gap-2 bg-[#1f293d] hover:bg-[#28354d] border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-400 transition cursor-pointer flex-1 md:flex-none"
            >
              <div className="flex items-center gap-1.5">
                <Layers size={15} className="text-amber-400" />
                <span>{currentRewayaObj ? currentRewayaObj.name.split('(')[0] : 'اختر الرواية'}</span>
              </div>
              <ChevronLeft size={14} className="text-slate-400" />
            </button>

            {/* زر الاستماع للتلاوة */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-500 text-slate-950 animate-pulse' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? 'جاري الاستماع' : 'استماع للتلاوة'}</span>
            </button>
          </div>
        </div>

        {/* منطقة عرض صفحات المصحف الشريف */}
        <div className="flex-1 bg-[#0d1424] rounded-2xl border border-slate-800 p-4 md:p-10 overflow-y-auto min-h-[480px] flex flex-col items-center justify-start relative shadow-inner">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center my-auto gap-3 text-slate-400">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium text-amber-400/80">جاري تحميل الآيات بالرسم العثماني...</span>
            </div>
          ) : (
            <div className="max-w-3xl w-full text-center dir-rtl">
              
              {/* إطار السورة العلوي (تصميم المخطوطة) */}
              <div className="mb-8 relative py-4 px-6 border-y-2 border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 rounded-lg">
                <h1 className="quran-title-font text-3xl md:text-4xl font-bold text-amber-400 mb-1">
                  {surahDetail?.name}
                </h1>
                <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-sans mt-2">
                  <span>نوع السورة: <strong className="text-emerald-400">{surahDetail?.revelationType === 'Meccan' ? 'مكّية' : 'مدنيّة'}</strong></span>
                  <span>•</span>
                  <span>عدد آياتها: <strong className="text-emerald-400">{surahDetail?.numberOfAyahs}</strong></span>
                </div>

                {/* عرض البسملة بشكل منفصل ومصمم بجمالية */}
                {selectedSurah !== 9 && (
                  <div className="quran-font text-2xl md:text-3xl text-amber-200 mt-6 tracking-wide drop-shadow">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}
              </div>

              {/* نص القرآن الكريم بالخط العثماني الاصيل */}
              <div className="quran-font leading-[2.8] md:leading-[3.3] text-justify text-slate-100 text-2xl md:text-3xl selection:bg-amber-500/30">
                {surahDetail?.ayahs?.map((ayah) => {
                  let cleanText = ayah.text;
                  
                  // تنقية نص الآية الأولى من البسملة المكررة تلقائياً من API
                  if (ayah.numberInSurah === 1 && selectedSurah !== 1 && selectedSurah !== 9) {
                    cleanText = cleanText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
                    cleanText = cleanText.replace('بْسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
                  }

                  return (
                    <React.Fragment key={ayah.number}>
                      <span className="inline hover:text-amber-300 transition duration-150 cursor-pointer">
                        {cleanText}
                      </span>
                      {/* رمز نهاية الآية العثماني */}
                      <span className="inline-flex items-center justify-center mx-1.5 text-amber-400 text-lg font-serif align-middle select-none">
                        ﴿{ayah.numberInSurah}﴾
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* الشريط السفلي للتنقل بين السور */}
        <div className="flex items-center justify-between bg-[#111827] p-3 rounded-xl border border-slate-800 text-xs">
          <button
            disabled={selectedSurah <= 1}
            onClick={() => setSelectedSurah((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1f293d] border border-slate-700 text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight size={16} />
            <span>السورة السابقة</span>
          </button>

          <span className="text-slate-400 font-medium hidden sm:inline">
            السورة رقم <strong className="text-amber-400">{selectedSurah}</strong> من 114
          </span>

          <button
            disabled={selectedSurah >= 114}
            onClick={() => setSelectedSurah((prev) => Math.min(114, prev + 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1f293d] border border-slate-700 text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <span>السورة التالية</span>
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* MODAL 1: نافذة اختيار السورة الاحترافية مع البحث */}
      {showSurahModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
            
            {/* هيدر النافذة */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Book size={18} className="text-emerald-400" />
                <span>فهرس سور القرآن الكريم</span>
              </h3>
              <button 
                onClick={() => setShowSurahModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* حقل البحث */}
            <div className="p-3 bg-[#0d1424] border-b border-slate-800">
              <div className="relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث باسم السورة أو رقمها..."
                  value={searchSurahQuery}
                  onChange={(e) => setSearchSurahQuery(e.target.value)}
                  className="w-full bg-[#172033] border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* قائمة السور */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/60">
              {filteredSurahs.map((surah) => {
                const isSelected = surah.number === selectedSurah;
                return (
                  <button
                    key={surah.number}
                    onClick={() => {
                      setSelectedSurah(surah.number);
                      setShowSurahModal(false);
                      setSearchSurahQuery('');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition cursor-pointer text-right ${
                      isSelected 
                        ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30' 
                        : 'hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-xs font-bold text-emerald-400">
                        {surah.number}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">{surah.name}</div>
                        <div className="text-[11px] text-slate-400">{surah.englishName} • {surah.numberOfAyahs} آية</div>
                      </div>
                    </div>
                    {isSelected && <Check size={18} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: نافذة اختيار الروايات المتواترة */}
      {showRewayaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Layers size={18} className="text-amber-400" />
                <span>الروايات والقراءات العشر المتواترة</span>
              </h3>
              <button 
                onClick={() => setShowRewayaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {QURAAN_READINGS.map((rewaya) => {
                const isSelected = rewaya.id === selectedRewaya;
                return (
                  <button
                    key={rewaya.id}
                    onClick={() => {
                      setSelectedRewaya(rewaya.id);
                      setShowRewayaModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer text-right ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold' 
                        : 'bg-[#172033] border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-amber-400">{rewaya.name}</div>
                    </div>
                    {isSelected && <Check size={18} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
