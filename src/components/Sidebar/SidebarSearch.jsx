// src/components/Sidebar/SidebarSearch.jsx
import React from 'react';
import { Search, X } from 'lucide-react';
import { colors as C } from '@/theme/colors';

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
      <Search size={14} style={{ color: C.text.placeholder, flexShrink: 0 }} />
      <input 
        type="text"
        placeholder={isRtl ? 'بحث سريع...' : 'Quick search...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        style={{
          width: '100%',
          padding: '6px 8px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: C.text.title,
          fontSize: '0.78rem',
          direction: isRtl ? 'rtl' : 'ltr'
        }}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.text.placeholder,
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
