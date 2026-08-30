// src/components/Logs/CompactDiffViewer.jsx
import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { TECHNICAL_KEYS, toHumanValue } from './logs.config';

export default function CompactDiffViewer({ log, isAdvancedMode, onlyChanged, t }) {
  const isUpdate = log?.operation === 'UPDATE' && log?.old_data && log?.new_data;

  // دالة مساعدة لضمان إرجاع نص دائماً للتسميات (Labels)
  const getLabel = (key) => {
    if (!key) return '';
    const fieldTranslation = t?.fields?.[key];
    if (fieldTranslation) {
      if (typeof fieldTranslation === 'string') return fieldTranslation;
      if (typeof fieldTranslation === 'object') {
        return fieldTranslation.ar || fieldTranslation.en || key;
      }
    }
    return key;
  };

  if (isUpdate) {
    const allKeys = Array.from(new Set([...Object.keys(log.old_data || {}), ...Object.keys(log.new_data || {})]));

    const filteredKeys = allKeys.filter((key) => {
      if (!isAdvancedMode && TECHNICAL_KEYS.includes(key)) return false;

      const oldVal = toHumanValue(log.old_data?.[key], t);
      const newVal = toHumanValue(log.new_data?.[key], t);
      const isChanged = oldVal !== newVal;

      if (onlyChanged && !isChanged) return false;
      return true;
    });

    if (filteredKeys.length === 0) {
      return (
        <div className="text-[11px] text-[var(--text-sub,#94A3B8)] text-center py-2">
          جميع الحقول المعدلة ذات طابع تقني داخلي
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <div className="divide-y divide-[var(--border-card,rgba(255,255,255,0.08))] border border-[var(--border-card,rgba(255,255,255,0.08))] rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] overflow-hidden">
          {filteredKeys.map((key) => {
            const oldVal = toHumanValue(log.old_data?.[key], t);
            const newVal = toHumanValue(log.new_data?.[key], t);
            const label = getLabel(key);

            return (
              <div key={key} className="p-2.5 text-xs flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[var(--text-sub,#94A3B8)] font-medium text-[11px]">
                  {label}:
                </span>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="line-through text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/30">
                    {String(oldVal)}
                  </span>
                  <ArrowLeftRight size={12} className="text-[var(--text-sub,#94A3B8)] shrink-0" />
                  <span className="text-[var(--primary)] font-bold bg-[var(--primary)]/10 px-2 py-0.5 rounded border border-[var(--primary)]/20">
                    {String(newVal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const displayData = log?.new_data || log?.old_data || {};
  const entries = Object.entries(displayData).filter(([key, val]) => {
    if (!isAdvancedMode) {
      if (TECHNICAL_KEYS.includes(key)) return false;
      const strVal = toHumanValue(val, t);
      if (!strVal || strVal === 'false' || strVal === '0' || strVal === '—') return false;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {entries.map(([key, val]) => {
        const label = getLabel(key);
        const formattedVal = toHumanValue(val, t);

        return (
          <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] text-xs">
            <span className="text-[var(--text-sub,#94A3B8)] text-[11px] font-medium">
              {label}
            </span>
            <span className="font-semibold text-[var(--text-main,#FFFFFF)] text-[11px] truncate max-w-[180px]">
              {String(formattedVal)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
