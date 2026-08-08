import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function AcademySelector({
  academiesList,
  currentAcademyId,
  currentAcademyName,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  statusBadge,
  onSwitchAcademy,
  getText,
  isRtl
}) {
  return (
    <div ref={dropdownRef} style={{ marginBottom: '10px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '600' }}>
          {isRtl ? 'الأكاديمية' : 'Academy'}
        </span>
        <span style={{
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.62rem',
          fontWeight: '700',
          ...statusBadge.style
        }}>
          {getText(statusBadge.text)}
        </span>
      </div>

      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: '600',
          transition: 'all 0.2s ease'
        }}
      >
        <span dir="auto" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentAcademyName}
        </span>
        <ChevronDown size={14} style={{ color: '#94a3b8', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#0f172a',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.65)',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          {academiesList.map(acc => (
            <button
              key={acc.id}
              onClick={() => {
                if (onSwitchAcademy) onSwitchAcademy(acc.id);
                setDropdownOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                border: 'none',
                background: acc.id === currentAcademyId ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: acc.id === currentAcademyId ? '#fbbf24' : '#e2e8f0',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'background 0.15s ease'
              }}
            >
              <span dir="auto">{getText(acc.name)}</span>
              <input type="radio" checked={acc.id === currentAcademyId} readOnly style={{ accentColor: '#f59e0b' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
