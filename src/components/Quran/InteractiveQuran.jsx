import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Search, Play, Pause, ChevronRight, ChevronLeft, 
  Volume2, X, Check, BookOpen, UserCheck 
} from 'lucide-react';

// قائمة القراء المتاحين مع روابط السيرفرات الخاصة بهم
const RECITERS = [
  { id: 'afs', name: 'مشاري العفاسي', rewaya: 'حفص عن عاصم', server: 'https://server8.mp3quran.net/afs/' },
  { id: 'hussary', name: 'محمود خليل الحصري', rewaya: 'حفص عن عاصم', server: 'https://server13.mp3quran.net/hssr/' },
  { id: 'minsh', name: 'محمد صديق المنشاوي (مجود)', rewaya: 'حفص عن عاصم', server: 'https://server10.mp3quran.net/minsh/mjw/' },
  { id: 'abdulbasit', name: 'عبد الباسط عبد الصمد (مجود)', rewaya: 'حفص عن عاصم', server: 'https://server7.mp3quran.net/basit/mjw/' },
  { id: 'ghadi', name: 'سعد الغامدي', rewaya: 'حفص عن عاصم', server: 'https://server7.mp3quran.net/s_gmd/' },
  { id: 'hussary_warsh', name: 'محمود خليل الحصري', rewaya: 'ورش عن نافع', server: 'https://server13.mp3quran.net/hssr/warsh/' },
  { id: 'qalon', name: 'القالوني (قالون عن نافع)', rewaya: 'قالون عن نافع', server: 'https://server13.mp3quran.net/qalon/' },
];

export default function InteractiveQuran() {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [surahsList, setSurahsList] = useState([]);
  const [surahDetail, setSurahDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showSurahModal, setShowSurahModal] = useState(false);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [searchSurahQuery, setSearchSurahQuery] = useState('');

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // تنظيف النص من التشكيل لاستخدامه في القوائم بوضوح
  const cleanArabicText = (text) => {
    if (!text) return '';
    return text
      .replace(/([^\u0621-\u064A\u0660-\u0669\s])/g, '') // إزالة التشكيل الزائد
      .replace(/(اِ|اَ|اُ|أ|إ|آ)/g, 'ا')
      .trim();
  };

  // جلب قائمة السور
  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) setSurahsList(data.data);
      })
      .catch((err) => console.error('Error fetching surahs:', err));
  }, []);

  // جلب تفاصيل السورة
  useEffect(() => {
    setLoading(true);
    stopAudio();
    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`)
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

  // التحكم في التشغيل الصوتي
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
      audio.onerror = () => {
        alert('تعذر تحميل الملف الصوتي لهذا القارئ/السورة.');
        stopAudio();
      };
    }
  };

  const currentSurahObj = surahsList.find(s => s.number === selectedSurah);

  const filteredSurahs = surahsList.filter(s => {
    const cleanName = cleanArabicText(s.name);
    const query = cleanArabicText(searchSurahQuery);
    return cleanName.includes(query) || String(s.number).includes(query);
  });

  return (
    <>
      {/* تضمين الخط العثماني لتطبيقه على الآيات فقط */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;700&display=swap');
        
        .quran-ayah-text {
          font-family: 'Scheherazade New', 'Amiri', serif;
          word-spacing: 4px;
          line-height: 2.6;
        }
      `}</style>

      <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-100 p-3 md:p-6 rounded-2xl border border-slate-800/80 shadow-2xl gap-4 select-none dir-rtl">
        
        {/* الشريط العلوي */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-3 md:p-4 rounded-xl border border-amber-500/20 shadow-lg">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">المصحف الإلكتروني الشريف</h2>
              <p className="text-xs text-amber-400/80 font-medium">الرسم العثماني وتلاوات القراء</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
            
            {/* زر اختيار السورة */}
            <button
              onClick={() => setShowSurahModal(true)}
              className="flex items-center justify-between gap-2 bg-[#1f293d] hover:bg-[#28354d] border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 transition cursor-pointer flex-1 md:flex-none"
            >
              <div className="flex items-center gap-1.5">
                <Book size={15} className="text-emerald-400" />
                <span>{currentSurahObj ? `${currentSurahObj.number}. سورة ${cleanArabicText(currentSurahObj.name)}` : 'اختر السورة'}</span>
              </div>
              <ChevronLeft size={14} className="text-slate-400" />
            </button>

            {/* زر اختيار القارئ والرواية */}
            <button
              onClick={() => setShowReciterModal(true)}
              className="flex items-center justify-between gap-2 bg-[#1f293d] hover:bg-[#28354d] border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-400 transition cursor-pointer flex-1 md:flex-none"
            >
              <div className="flex items-center gap-1.5">
                <UserCheck size={15} className="text-amber-400" />
                <span>{selectedReciter.name}</span>
              </div>
              <ChevronLeft size={14} className="text-slate-400" />
            </button>

            {/* زر الاستماع */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-500 text-slate-950 animate-pulse' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? 'إيقاف التلاوة' : 'استماع'}</span>
            </button>
          </div>
        </div>

        {/* عرض القراءة والآيات */}
        <div className="flex-1 bg-[#0d1424] rounded-2xl border border-slate-800 p-4 md:p-8 overflow-y-auto min-h-[480px] flex flex-col items-center justify-start relative shadow-inner">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center my-auto gap-3 text-slate-400">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium text-amber-400/80">جاري تحميل السورة بالرسم العثماني...</span>
            </div>
          ) : (
            <div className="max-w-3xl w-full text-center">
              
              {/* إطار السورة */}
              <div className="mb-8 relative py-4 px-6 border-y-2 border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 rounded-lg">
                <h1 className="text-3xl md:text-4xl font-bold text-amber-400 mb-2">
                  سورة {cleanArabicText(surahDetail?.name)}
                </h1>
                <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-sans">
                  <span>نوع السورة: <strong className="text-emerald-400">{surahDetail?.revelationType === 'Meccan' ? 'مكيّة' : 'مدنيّة'}</strong></span>
                  <span>•</span>
                  <span>عدد آياتها: <strong className="text-emerald-400">{surahDetail?.numberOfAyahs}</strong></span>
                </div>

                {/* البسملة */}
                {selectedSurah !== 9 && (
                  <div className="quran-ayah-text text-2xl md:text-3xl text-amber-200 mt-6 tracking-wide drop-shadow">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}
              </div>

              {/* نص القرآن العثماني الصافي */}
              <div className="quran-ayah-text text-justify text-slate-100 text-2xl md:text-3xl">
                {surahDetail?.ayahs?.map((ayah) => {
                  let cleanText = ayah.text;
                  
                  // إزالة البسملة المكررة تلقائياً من بداية الآيات الأولى
                  if (ayah.numberInSurah === 1 && selectedSurah !== 1 && selectedSurah !== 9) {
                    cleanText = cleanText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s?/, '');
                  }

                  return (
                    <React.Fragment key={ayah.number}>
                      <span className="inline hover:text-amber-300 transition duration-150">
                        {cleanText}
                      </span>
                      <span className="inline-flex items-center justify-center mx-1.5 text-amber-400 text-lg font-serif select-none">
                        ﴿{ayah.numberInSurah}﴾
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* زر التنقل بين السور */}
        <div className="flex items-center justify-between bg-[#111827] p-3 rounded-xl border border-slate-800 text-xs">
          <button
            disabled={selectedSurah <= 1}
            onClick={() => setSelectedSurah((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1f293d] border border-slate-700 text-slate-200 hover:bg-emerald-600 hover:text-white disabled:opacity-30 cursor-pointer transition"
          >
            <ChevronRight size={16} />
            <span>السورة السابقة</span>
          </button>

          <span className="text-slate-400 font-medium">
            سورة <strong className="text-amber-400">{selectedSurah}</strong> من 114
          </span>

          <button
            disabled={selectedSurah >= 114}
            onClick={() => setSelectedSurah((prev) => Math.min(114, prev + 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1f293d] border border-slate-700 text-slate-200 hover:bg-emerald-600 hover:text-white disabled:opacity-30 cursor-pointer transition"
          >
            <span>السورة التالية</span>
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* modal السور النظيف */}
      {showSurahModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            
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

            <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/60">
              {filteredSurahs.map((surah) => {
                const isSelected = surah.number === selectedSurah;
                const cleanName = cleanArabicText(surah.name);
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
                        <div className="text-sm font-semibold">سورة {cleanName}</div>
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

      {/* modal القراء والروايات */}
      {showReciterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <UserCheck size={18} className="text-amber-400" />
                <span>اختر القارئ والرواية</span>
              </h3>
              <button 
                onClick={() => setShowReciterModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {RECITERS.map((reciter) => {
                const isSelected = reciter.id === selectedReciter.id;
                return (
                  <button
                    key={reciter.id}
                    onClick={() => {
                      setSelectedReciter(reciter);
                      setShowReciterModal(false);
                      stopAudio();
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer text-right ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold' 
                        : 'bg-[#172033] border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">{reciter.name}</div>
                      <div className="text-xs text-amber-400/80 mt-0.5">رواية: {reciter.rewaya}</div>
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
