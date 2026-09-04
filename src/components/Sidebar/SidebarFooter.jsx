// src/components/Sidebar/SidebarFooter.jsx
import React from 'react';
import { Cloud, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { colors as C } from '@/theme/colors';

export default function SidebarFooter({ isRtl }) {
  const handleLogout = async () => {
    try {
      if (supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* حالة الربط السحابي */}
      <div className="flex items-center justify-center gap-1.5 text-xs">
        <Cloud size={13} style={{ color: C.emerald?.light || '#34D399' }} className="shrink-0" />
        <span className="text-[11px] font-medium" style={{ color: C.text?.muted || '#94A3B8' }}>
          {isRtl ? 'ربط سحابي متزامن' : 'Cloud Synchronized'}
        </span>
      </div>

      {/* زر تسجيل الخروج */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs cursor-pointer transition-all duration-150 active:scale-95"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: C.error?.DEFAULT || '#EF4444',
          borderColor: 'rgba(239, 68, 68, 0.25)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
      >
        <LogOut size={15} className="shrink-0" />
        <span>{isRtl ? 'إنهاء الجلسة وتأكيد الخروج' : 'Logout'}</span>
      </button>
    </div>
  );
}
