/* src/components/Curriculum/CurriculumStructure.jsx */
import React from 'react';
import { BookOpen, Layers, ChevronLeft, Plus } from 'lucide-react';
import colors from '@/theme/colors';

export default function CurriculumStructure({ levels = [], onAddLevel, onSelectItem }) {
  return (
    <div className={`w-full bg-[${colors.surface || '#0F172A'}] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-right rtl`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#FBBF24]" />
          <h3 className="text-white font-bold text-base">هيكل المناهج ومستويات الحفظ</h3>
        </div>
        <button 
          type="button"
          onClick={onAddLevel}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 text-slate-200 text-xs font-bold hover:bg-white/10 transition-colors"
        >
          <Plus className="w-4 h-4 text-[#FBBF24]" />
          <span>إضافة مستوى</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {levels.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            لا توجد مستويات منهجية مسجلة
          </div>
        ) : (
          levels.map((level) => (
            <div 
              key={level.id} 
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white/5 text-emerald-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">{level.level_name || level.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  {level.items_count || 0} عناصر
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {level.items && level.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectItem(item)}
                    className="p-2.5 rounded-lg bg-white/[0.01] border border-white/5 hover:border-white/10 flex items-center justify-between text-right transition-all group"
                  >
                    <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{item.title}</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#FBBF24] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
