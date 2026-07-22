import React, { useState, useRef, useEffect } from 'react';

const AcademySwitcher = ({
  userEntities = [],
  currentEntity = null,
  onSwitchAcademy,
  t
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // إغلاق القائمة عند النقر في أي مكان خارج المكوّن
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // حالة عدم وجود أكاديميات
  if (!userEntities || userEntities.length === 0) {
    return (
      <div style={{ padding: '8px 12px', fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' }}>
        {t ? t('sidebar.defaultEntityName', 'الأكاديمية الرقمية') : 'الأكاديمية الرقمية'}
      </div>
    );
  }

  // حالة وجود أكاديمية واحدة فقط
  if (userEntities.length === 1) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        fontWeight: '700',
        color: '#f8fafc'
      }}>
        <span>🏛️</span>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {userEntities[0].name}
        </span>
      </div>
    );
  }

  // حالة وجود أكثر من أكاديمية (القائمة المنسدلة)
  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: '#1e293b',
          color: '#ffffff',
          border: '1px solid #334155',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span>🏛️</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentEntity?.name || (t ? t('sidebar.defaultEntityName', 'الأكاديمية الرقمية') : 'الأكاديمية الرقمية')}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          left: 0,
          marginTop: '6px',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {userEntities.map((entity) => {
            const isSelected = entity.id === currentEntity?.id;
            return (
              <button
                key={entity.id}
                type="button"
                onClick={() => {
                  if (onSwitchAcademy) onSwitchAcademy(entity.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isSelected ? '#1e293b' : 'transparent',
                  color: isSelected ? '#f59e0b' : '#cbd5e1',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  textAlign: 'right',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>{entity.name}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AcademySwitcher;
