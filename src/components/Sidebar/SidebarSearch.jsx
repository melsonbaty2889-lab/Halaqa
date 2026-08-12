import React from 'react';
import { Search } from 'lucide-react';
import { colors as C } from '@/constants/colors';

export default function SidebarSearch({ searchQuery, setSearchQuery, isRtl }) {
  return (
    <div style={{
      position: 'relative',
      marginBottom: '10px',
      background: C.dark.card,
      borderRadius: '8px',
      border: `1px solid ${C.dark.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px'
    }}>
      <Search size={14} style={{ color: C.text.placeholder }} />
      <input 
        type="text"
        placeholder={isRtl ? 'بحث سريع...' : 'Quick search...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: C.text.title,
          fontSize: '0.78rem'
        }}
      />
    </div>
  );
}
