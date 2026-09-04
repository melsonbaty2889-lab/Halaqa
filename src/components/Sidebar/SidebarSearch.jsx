// src/components/Sidebar/SidebarSearch.jsx
import React from 'react';
import { Search, X } from 'lucide-react';
import { colors as C } from '@/theme/colors';

export default function SidebarSearch({ searchQuery, setSearchQuery, isRtl, t }) {
  const placeholderText = typeof t === 'function' 
    ? t('common.searchPlaceholder', isRtl ? 'بحث سريع...' : 'Quick search...')
    : (isRtl ? 'بحث سريع...' : 'Quick search...');

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        position: 'relative',
        marginBottom: '10px',
        background: C.dark?.card || 'rgba(15, 23, 42, 0.85)',
        borderRadius: '8px',
        border: `1px solid ${C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px'
      }}
    >
      <Search size={14} style={{ color: C.text?.muted || '#94A3B8', flexShrink: 0 }} />
      <input 
        type="text"
        placeholder={placeholderText}
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
          color: C.text?.title || '#FFFFFF',
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
            color: C.text?.muted || '#94A3B8',
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
