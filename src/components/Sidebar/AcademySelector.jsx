import React from 'react';
import { Building2, ChevronDown, Check } from "lucide-react";
import { colors as C } from '@/theme/colors';

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
    <div style={{ position: 'relative', marginBottom: '12px' }} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: '8px',
          border: `1px solid ${C.dark.border}`,
          background: C.dark.cardBg,
          color: C.text.main,
          cursor: 'pointer',
          textAlign: isRtl ? 'right' : 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <Building2 size={16} color={C.primary.light} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {currentAcademyName}
            </div>
            <span style={{
              display: 'inline-block',
              fontSize: '0.6rem',
              fontWeight: '600',
              padding: '1px 6px',
              borderRadius: '4px',
              marginTop: '2px',
              ...statusBadge.style
            }}>
              {statusBadge.text}
            </span>
          </div>
        </div>
        <ChevronDown size={14} color={C.text.muted} style={{ flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: C.dark.cardBg,
          border: `1px solid ${C.dark.border}`,
          borderRadius: '8px',
          zIndex: 100,
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          overflow: 'hidden'
        }}>
          {academiesList.map((ac) => (
            <button
              key={ac.id}
              onClick={() => {
                if (typeof onSwitchAcademy === 'function') onSwitchAcademy(ac.id);
                setDropdownOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: ac.id === currentAcademyId ? C.dark.surface : 'transparent',
                border: 'none',
                color: ac.id === currentAcademyId ? C.primary.light : C.text.main,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: isRtl ? 'right' : 'left'
              }}
            >
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {getText(ac.name)}
              </span>
              {ac.id === currentAcademyId && <Check size={14} color={C.primary.light} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
