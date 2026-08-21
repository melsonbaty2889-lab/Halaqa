import React, { useState } from 'react';
import { Play, Pause, Volume2, RotateCcw, Music } from 'lucide-react';
import colors from '@/theme/colors';

export default function QuranAudioPlayer({ audioUrl, surahName, pageNumber, dir = 'rtl' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(audioUrl));

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      dir={dir}
      style={{ backgroundColor: colors?.surface || '#0F172A' }}
      className="w-full border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between text-white"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
          <Music className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold">{surahName || 'سورة القرآن'}</span>
          <span className="text-[10px] text-slate-400">صفحة {pageNumber || 1}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-[#FBBF24] text-[#0F172A] hover:bg-[#FBBF24]/90 transition-transform active:scale-95"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
      </div>
    </div>
  );
}
