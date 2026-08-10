import React from 'react';
import { SendHorizontal } from 'lucide-react';

export default function ReportMetrics({ totalCount, completionPercentage, remainingCount, unsentCount, onBulkSend, isRtl }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{isRtl ? "الإجمالي" : "Total"}</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginTop: '2px', display: 'block' }}>{totalCount}</span>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{isRtl ? "المرسل" : "Sent"}</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', marginTop: '2px', display: 'block' }}>{completionPercentage}%</span>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{isRtl ? "المتبقي" : "Remaining"}</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#f59e0b', marginTop: '2px', display: 'block' }}>{remainingCount}</span>
        </div>
      </div>

      {unsentCount > 0 && (
        <button
          onClick={onBulkSend}
          style={{
            width: '100%',
            marginBottom: '14px',
            background: '#10b981',
            color: '#090d16',
            border: 'none',
            padding: '9px 12px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <SendHorizontal size={15} />
          {isRtl ? `بدء الإرسال المتتابع للمتبقين (${unsentCount})` : `Batch Send Unsent (${unsentCount})`}
        </button>
      )}
    </>
  );
}
