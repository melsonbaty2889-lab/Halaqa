import React from 'react';
import { Cloud, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SidebarFooter({ isRtl }) {
  return (
    <div style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#070d18' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.72rem', color: '#64748b' }}>
        <Cloud size={14} style={{ color: '#10b981' }} />
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
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '6px',
          color: '#f87171',
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
