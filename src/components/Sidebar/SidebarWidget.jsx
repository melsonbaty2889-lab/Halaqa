import React from 'react';
import { Clock, Zap } from 'lucide-react';

export default function SidebarWidget({
  academyTime,
  hijri,
  setActiveTab,
  setShowEarlyUpgrade,
  isMobile,
  setSidebarOpen,
  isRtl
}) {
  return (
    <div style={{
      background: '#0f172a',
      padding: '8px 10px',
      borderRadius: '8px',
      marginBottom: '10px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '6px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#38bdf8',
        fontSize: '0.72rem',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        flexShrink: 0
      }}>
        <Clock size={14} style={{ color: '#38bdf8' }} />
        <span>{academyTime || '12:24 PM'}</span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1px',
        minWidth: 0
      }}>
        <span style={{
          fontSize: '0.65rem',
          color: '#38bdf8',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          lineHeight: '1.2'
        }}>
          {new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>

        <span style={{
          fontSize: '0.62rem',
          color: '#94a3b8',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          lineHeight: '1.2'
        }}>
          {hijri}
        </span>
      </div>

      <button
        onClick={() => {
          setActiveTab('subscriptions');
          if (typeof setShowEarlyUpgrade === 'function') setShowEarlyUpgrade(false);
          if (isMobile) setSidebarOpen(false);
        }}
        style={{
          padding: '5px 9px',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '700',
          fontSize: '0.68rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
          transition: 'transform 0.15s ease'
        }}
      >
        <Zap size={12} fill="#000" />
        <span>{isRtl ? 'ترقية' : 'Upgrade'}</span>
      </button>
    </div>
  );
}
