// src/components/Sidebar/SidebarSearch.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

export default function SidebarSearch({ searchQuery, setSearchQuery, isRtl, t }) {
  // استخدام مفتاح ترجمة مخصص للبحث السريع مع توفير Fallback مناسب
  const placeholderText = typeof t === 'function' 
    ? t('common.quickSearch', isRtl ? 'بحث سريع...' : 'Quick search...')
    : (isRtl ? 'بحث سريع...' : 'Quick search...');

  const clearText = typeof t === 'function'
    ? t('common.clear', isRtl ? 'مسح' : 'Clear')
    : (isRtl ? 'مسح' : 'Clear');

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative mb-3 flex items-center px-3 py-1.5 bg-semantic-surfaceCard border border-semantic-borderCard rounded-xl focus-within:border-semantic-actionPrimary focus-within:ring-1 focus-within:ring-semantic-actionPrimaryGlow transition-all duration-200"
    >
      <Search size={15} className="text-semantic-textMuted shrink-0" />
      <input 
        type="text"
        placeholder={placeholderText}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        className="w-full bg-transparent border-none outline-none text-semantic-textPrimary text-xs px-2 placeholder:text-semantic-textMuted"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          aria-label={clearText}
          className="bg-transparent border-none text-semantic-textMuted hover:text-semantic-textPrimary cursor-pointer p-0.5 flex items-center justify-center shrink-0 transition-colors rounded-md focus-visible:outline-none"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
