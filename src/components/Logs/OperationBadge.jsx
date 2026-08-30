// src/components/Logs/OperationBadge.jsx
import React from 'react';
import { toHumanValue } from './logs.config';

export default function OperationBadge({ operation, t }) {
  const opStr = operation === 'INSERT' 
    ? toHumanValue(t.insertOp, t) 
    : operation === 'UPDATE' 
    ? toHumanValue(t.updateOp, t) 
    : operation === 'DELETE' 
    ? toHumanValue(t.deleteOp, t) 
    : 'Operation';

  switch (operation) {
    case 'INSERT':
    case 'UPDATE':
      return <span className="px-2 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold border border-[var(--primary)]/20 shrink-0">{opStr}</span>;
    case 'DELETE':
      return <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 shrink-0">{opStr}</span>;
    default:
      return <span className="px-2 py-1 rounded-lg bg-[var(--surface-input,#0A101D)] text-[var(--text-sub,#94A3B8)] text-[10px] shrink-0">{opStr}</span>;
  }
}
