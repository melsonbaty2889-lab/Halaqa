import React from 'react';
import { Cloud, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SidebarFooter({ isRtl }) {
  return (
    <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
      <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-400">
        <Cloud size={14} className="text-emerald-400 shrink-0" />
        <span className="text-[11px] font-medium">{isRtl ? 'ربط سحابي متزامن' : 'Cloud Synchronized'}</span>
      </div>

      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="w-full flex items-center justify-center gap-2 p-2 bg-red-950/30 hover:bg-red-900/40 border border-red-800/50 rounded-lg text-red-400 hover:text-red-300 font-bold text-xs cursor-pointer transition-all duration-150"
      >
        <LogOut size={16} className="shrink-0" />
        <span>{isRtl ? 'إنهاء الجلسة وتأكيد الخروج' : 'Logout'}</span>
      </button>
    </div>
  );
}
