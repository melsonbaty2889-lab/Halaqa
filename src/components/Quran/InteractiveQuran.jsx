import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, ChevronLeft, Bookmark } from 'lucide-react';
import { QURAAN_READINGS } from '@/config/memorizationSystems'; // 👈 استيراد الروايات المعتمدة من ملفك

export default function InteractiveQuran({ isRtl = true }) {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedRewaya, setSelectedRewaya] = useState('hafs');
  const [surahsList, setSurahsList] = useState([]);
  const [surahDetail, setSurahDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAyah, setActiveAyah] = useState(null);

  // جلب قائمة السور من API مجاني ومستقر
  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setSurahsList(data.data);
        }
      })
      .catch((err) => console.error('Error fetching surahs:', err));
  }, []);

  // جلب آيات السورة المحددة
  useEffect(() => {
    setLoading(true);
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

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-3 md:p-6 rounded-2xl border border-slate-800 gap-4">
      {/* الشريط العلوي للتحكم */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Book size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 leading-tight">المصحف التفاعلي</h2>
            <p className="text-xs text-slate-400">عرض التلاوة والمقارئ العالمية</p>
          </div>
        </div>

        {/* قوائم الاختيار (منسجمة مع ملف memorizationSystems) */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
          {/* اختيار السورة */}
          <select
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(Number(e.target.value))}
            className="bg-slate-950 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 flex-1 md:flex-none cursor-pointer"
          >
            {surahsList.map((s) => (
              <option key={s.number} value={s.number} className="bg-slate-900 text-slate-200">
                {s.number}. {s.name} ({s.numberOfAyahs} آية)
              </option>
            ))}
          </select>

          {/* اختيار الرواية من القائمة العالمية QURAAN_READINGS */}
          <select
            value={selectedRewaya}
            onChange={(e) => setSelectedRewaya(e.target.value)}
            className="bg-slate-950 text-amber-400 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 flex-1 md:flex-none cursor-pointer"
          >
            {QURAAN_READINGS.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                رواية: {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* منطقة عرض السورة والآيات */}
      <div className="flex-1 bg-slate-900/40 rounded-xl border border-slate-800/80 p-4 md:p-8 overflow-y-auto min-h-[400px] flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center my-auto gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">جاري تحميل الآيات المباركة...</span>
          </div>
        ) : (
          <div className="max-w-4xl w-full text-center">
            {/* عنوان السورة والبسملة */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-amber-400 mb-2">
                سُورَةُ {surahDetail?.name?.replace('سُورَةُ ', '')}
              </h1>
              <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {surahDetail?.revelationType === 'Meccan' ? 'مكيّة' : 'مدنيّة'} • {surahDetail?.numberOfAyahs} آية
              </span>

              {selectedSurah !== 9 && (
                <div className="text-xl md:text-2xl text-emerald-400 font-serif my-6 tracking-wide">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              )}
            </div>

            {/* نص السورة والآيات مع إمكانية التفاعل بالضغط */}
            <div className="leading-[2.8] md:leading-[3.2] text-right dir-rtl text-slate-100 text-lg md:text-2xl font-serif select-none">
              {surahDetail?.ayahs?.map((ayah) => {
                const isActive = activeAyah === ayah.numberInSurah;
                let text = ayah.text;
                if (ayah.numberInSurah === 1 && selectedSurah !== 1 && selectedSurah !== 9) {
                  text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
                }

                return (
                  <span
                    key={ayah.number}
                    onClick={() => setActiveAyah(ayah.numberInSurah)}
                    className={`cursor-pointer inline px-1 py-0.5 rounded transition-all duration-150 ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 font-bold border-b-2 border-amber-400'
                        : 'hover:bg-slate-800/80 hover:text-emerald-300'
                    }`}
                  >
                    {text}{' '}
                    <span className="inline-flex items-center justify-center w-7 h-7 mx-1 text-xs text-emerald-400 bg-slate-900 rounded-full border border-emerald-500/30 font-sans align-middle">
                      {ayah.numberInSurah}
                    </span>{' '}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* الشريط السفلي للتنقل */}
      <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
        <button
          disabled={selectedSurah <= 1}
          onClick={() => setSelectedSurah((prev) => Math.max(1, prev - 1))}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight size={16} />
          <span>السورة السابقة</span>
        </button>

        <span className="text-slate-400 font-medium">
          سورة <strong className="text-emerald-400">{selectedSurah}</strong> من 114
        </span>

        <button
          disabled={selectedSurah >= 114}
          onClick={() => setSelectedSurah((prev) => Math.min(114, prev + 1))}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>السورة التالية</span>
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
}
