import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { formatHijriDate } from '../../utils/dateUtils';
import { colors as C } from '@/constants/colors';

export default function SidebarWidget({
  academyTime,
  hijri,
  setActiveTab,
  setShowEarlyUpgrade,
  isMobile,
  setSidebarOpen,
  isRtl
}) {
  const formattedHijri = formatHijriDate(new Date(), isRtl);

  return (
    <div style={{
      background: C.dark.card,
      padding: '8px 10px',
      borderRadius: '8px',
      marginBottom: '10px',
      border: `1px solid ${C.dark.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '6px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: C.brandEmerald.light,
        fontSize: '0.72rem',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        flexShrink: 0
      }}>
        <Clock size={14} style={{ color: C.brandEmerald.light }} />
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
          color: C.brandEmerald.light,
          fontWeight: '600',
          whiteSpace: 'nowrap',
          lineHeight: '1.2'
        }}>
          {new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>

        <span style={{
          fontSize: '0.62rem',
          color: C.text.muted,
          fontWeight: '500',
          whiteSpace: 'nowrap',
          lineHeight: '1.2'
        }}>
          {formattedHijri}
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
          background: C.primary.gradient,
          color: C.dark.main,
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
        <Zap size={12} fill={C.dark.main} />
        <span>{isRtl ? 'ترقية' : 'Upgrade'}</span>
      </button>
    </div>
  );
}
