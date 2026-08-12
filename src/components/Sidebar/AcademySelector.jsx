import React from 'react';
import { ChevronDown } from 'lucide-react';
import { colors as C } from '@/constants/colors';

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
        <span style={{ fontSize: '0.72rem', color: C.text.body, fontWeight: '600' }}>
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
          background: C.dark.card,
          border: `1px solid ${C.dark.border}`,
          borderRadius: '8px',
          color: C.text.title,
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
        <ChevronDown size={14} style={{ color: C.text.placeholder, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: C.dark.card,
          borderRadius: '8px',
          border: `1px solid ${C.dark.border}`,
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
                background: acc.id === currentAcademyId ? C.brandEmerald.bgGlow : 'transparent',
                color: acc.id === currentAcademyId ? C.primary.DEFAULT : C.text.body,
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'background 0.15s ease'
              }}
            >
              <span dir="auto">{getText(acc.name)}</span>
              <input type="radio" checked={acc.id === currentAcademyId} readOnly style={{ accentColor: C.primary.DEFAULT }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
