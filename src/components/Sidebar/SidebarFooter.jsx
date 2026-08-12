import React from 'react';
import { Cloud, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { colors as C } from '@/constants/colors';

export default function SidebarFooter({ isRtl }) {
  return (
    <div style={{ padding: '12px', borderTop: `1px solid ${C.dark.border}`, background: C.dark.surface }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.72rem', color: C.text.muted }}>
        <Cloud size={14} style={{ color: C.brandEmerald.DEFAULT }} />
        <span>{isRtl ? 'ربط سحابي متزامن' : 'Cloud Synchronized'}</span>
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '8px',
          background: C.error.bgGlow,
          border: `1px solid ${C.error.border}`,
          borderRadius: '6px',
          color: C.error.light,
          fontWeight: '700',
          fontSize: '0.78rem',
          cursor: 'pointer',
          transition: 'background 0.15s ease'
        }}
      >
        <LogOut size={16} />
        <span>{isRtl ? 'إنهاء الجلسة وتأكيد الخروج' : 'Logout'}</span>
      </button>
    </div>
  );
}
