// src/components/Sidebar/SidebarSearch.jsx
import React, { useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { colors as C } from '@/theme/colors';

export default function SidebarSearch({ searchQuery, setSearchQuery, isRtl, t }) {
  const safeT = useCallback((key, fallback) => {
    if (typeof t === 'function') {
      return t(key, { defaultValue: fallback || key });
    }
    return fallback || key;
  }, [t]);

  const placeholderText = safeT('common.quickSearch', 'بحث سريع...');
  const clearText = safeT('common.clear', 'مسح');

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && searchQuery) {
      setSearchQuery('');
    }
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        position: 'relative',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        padding: '6px 10px',
        backgroundColor: C.dark?.surface || 'var(--surface-ground, rgba(255, 255, 255, 0.04))',
        border: `1px solid ${C.dark?.cardBorder || C.appBorder?.card || 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: '12px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <Search 
        size={15} 
        style={{ 
          color: C.dark?.textMuted || 'var(--text-color-secondary, #94a3b8)', 
          flexShrink: 0 
        }} 
      />
      <input 
        type="text"
        placeholder={placeholderText}
        value={searchQuery || ''}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          color: C.dark?.textPrimary || 'var(--text-color, #ffffff)',
          fontSize: '0.75rem',
          padding: '0 8px',
          boxSizing: 'border-box'
        }}
      />
      {Boolean(searchQuery) && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          aria-label={clearText}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: C.dark?.textMuted || 'var(--text-color-secondary, #94a3b8)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderRadius: '6px',
            transition: 'color 0.2s ease'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
