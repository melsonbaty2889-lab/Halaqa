import React from 'react';
import { Search } from 'lucide-react';

export default function SidebarSearch({ searchQuery, setSearchQuery, isRtl }) {
  return (
    <div style={{
      position: 'relative',
      marginBottom: '10px',
      background: '#0f172a',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px'
    }}>
      <Search size={14} style={{ color: '#64748b' }} />
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
          color: '#fff',
          fontSize: '0.78rem'
        }}
      />
    </div>
  );
}
