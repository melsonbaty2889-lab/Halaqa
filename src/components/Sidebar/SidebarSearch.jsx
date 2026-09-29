// src/components/Sidebar/SidebarSearch.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

export default function SidebarSearch({ searchQuery, setSearchQuery, isRtl, t }) {
  const placeholderText = typeof t === 'function' 
    ? t('common.searchPlaceholder', isRtl ? 'بحث سريع...' : 'Quick search...')
    : (isRtl ? 'بحث سريع...' : 'Quick search...');

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative mb-2.5 flex items-center px-2.5 bg-semantic-surfaceCard border border-semantic-borderCard rounded-lg"
    >
      <Search size={14} className="text-semantic-textMuted shrink-0" />
      <input 
        type="text"
        placeholder={placeholderText}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        className="w-full py-1.5 px-2 bg-transparent border-none outline-none text-semantic-textPrimary text-[0.78rem] placeholder:text-semantic-textMuted"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          className="bg-transparent border-none text-semantic-textMuted hover:text-semantic-textPrimary cursor-pointer p-0.5 flex items-center justify-center shrink-0 transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
