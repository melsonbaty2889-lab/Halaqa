// src/components/Logs/OperationBadge.jsx
import React from 'react';

export default function OperationBadge({ operation, t }) {
  // دالة أمان للحصول على الترجمة النصية دون استخدام خواص كائن من t
  const getLabel = (key, fallback) => {
    if (typeof t === 'function') {
      const res = t(key, { defaultValue: fallback });
      if (typeof res === 'string') return res;
      if (res && typeof res === 'object') return res.ar || res.en || fallback;
    }
    return fallback;
  };

  let opStr = 'عملية';
  let badgeStyle = 'bg-[var(--surface-input,#0A101D)] text-[var(--text-sub,#94A3B8)] border-[var(--border-input,#1B2738)]';

  switch (operation) {
    case 'INSERT':
      opStr = getLabel('logs.insertOp', 'إضافة');
      badgeStyle = 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 shadow-[0_0_8px_rgba(224,122,0,0.15)]';
      break;
    case 'UPDATE':
      opStr = getLabel('logs.updateOp', 'تعديل');
      badgeStyle = 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 shadow-[0_0_8px_rgba(224,122,0,0.15)]';
      break;
    case 'DELETE':
      opStr = getLabel('logs.deleteOp', 'حذف');
      badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]';
      break;
    default:
      opStr = String(operation || getLabel('logs.operation', 'عملية'));
      break;
  }

  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border shrink-0 inline-block text-center ${badgeStyle}`}>
      {opStr}
    </span>
  );
}
